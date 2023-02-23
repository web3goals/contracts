// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./interfaces/IHub.sol";
import "./interfaces/IVerifier.sol";
import "./interfaces/IPUSHCommInterface.sol";
import "./libraries/DataTypes.sol";
import "./libraries/Errors.sol";
import "./libraries/Constants.sol";

/**
 * Contract to set, verify, close goal or become a goal watcher.
 */
contract Goal is ERC721Upgradeable, OwnableUpgradeable, PausableUpgradeable {
    using Counters for Counters.Counter;

    event ParamsSet(uint256 indexed tokenId, DataTypes.GoalParams);
    event WatcherSet(
        uint256 indexed tokenId,
        address indexed watcherAccountAddress,
        DataTypes.GoalWatcher watcher
    );
    event URISet(uint256 indexed tokenId, string tokenURI);
    event ClosedAsAchieved(uint256 indexed tokenId);
    event ClosedAsFailed(uint256 indexed tokenId);

    address private _hubAddress;
    address private _epnsCommContractAddress; // TODO: Move to hub contract
    address private _epnsChannelAddress; // TODO: Move to hub contract
    uint private _usageFeePercent;
    Counters.Counter private _counter;
    mapping(uint256 => DataTypes.GoalParams) private _params;
    mapping(uint256 => mapping(string => string)) _verificationData;
    mapping(uint256 => DataTypes.GoalWatcher[]) private _watchers;

    function initialize(
        address hubAddress,
        uint usageFeePercent
    ) public initializer {
        __ERC721_init("Web3 Goals Goal", "W3GG");
        __Ownable_init();
        __Pausable_init();
        _hubAddress = hubAddress;
        _usageFeePercent = usageFeePercent;
    }

    function set(
        string memory description,
        uint stake,
        uint deadlineTimestamp,
        string memory verificationRequirement,
        string[] memory verificationDataKeys,
        string[] memory verificationDataValues
    ) public payable returns (uint256) {
        // Base checks
        _requireNotPaused();
        require(
            msg.value == stake,
            Errors.STAKE_MUST_BE_EQUAL_TO_MESSAGE_VALUE
        );
        require(stake > 0, Errors.STAKE_MUST_BE_GREATER_THAN_ZERO);
        require(
            deadlineTimestamp > block.timestamp + Constants.SECONDS_PER_DAY,
            Errors.MUST_BE_MORE_THAN_24_HOURS_BEFORE_DEADLINE_TIMESTAMP
        );
        require(
            IHub(_hubAddress).getVerifierAddress(verificationRequirement) !=
                address(0),
            Errors.NOT_FOUND_VERIFIER_FOR_GOAL_VERIFICATION_REQUIREMENT
        );
        // Update counter
        _counter.increment();
        // Mint token
        uint256 newTokenId = _counter.current();
        _mint(msg.sender, newTokenId);
        // Set params
        DataTypes.GoalParams memory tokenParams = DataTypes.GoalParams(
            block.timestamp,
            description,
            msg.sender,
            stake,
            deadlineTimestamp,
            false,
            false,
            verificationRequirement
        );
        _params[newTokenId] = tokenParams;
        emit ParamsSet(newTokenId, tokenParams);
        // Set verification data
        _addVerificationData(
            newTokenId,
            verificationDataKeys,
            verificationDataValues
        );
        // Return
        return newTokenId;
    }

    function watch(uint256 tokenId, string memory extraDataURI) public {
        // Base Checks
        _requireNotPaused();
        require(_exists(tokenId), Errors.TOKEN_DOES_NOT_EXIST);
        require(!_params[tokenId].isClosed, Errors.GOAL_IS_CLOSED);
        require(
            _params[tokenId].authorAddress != msg.sender,
            Errors.GOAL_AUTHOR_CAN_NOT_BE_A_WATCHER
        );
        bool isSenderWatcher = false;
        for (uint i = 0; i < _watchers[tokenId].length; i++) {
            if (_watchers[tokenId][i].accountAddress == msg.sender) {
                isSenderWatcher = true;
            }
        }
        require(!isSenderWatcher, Errors.SENDER_IS_ALREADY_WATCHER);
        // Add watcher
        DataTypes.GoalWatcher memory tokenWatcher = DataTypes.GoalWatcher(
            block.timestamp,
            msg.sender,
            false,
            extraDataURI
        );
        _watchers[tokenId].push(tokenWatcher);
        emit WatcherSet(tokenId, tokenWatcher.accountAddress, tokenWatcher);
        // Send notification to goal author
        if (
            _epnsCommContractAddress != address(0) &&
            _epnsChannelAddress != address(0)
        ) {
            // TODO: Move notification texts to variables
            // TODO: Move notification code to internal function
            IPUSHCommInterface(_epnsCommContractAddress).sendNotification(
                _epnsChannelAddress, // from channel - recommended to set channel via dApp and put it's value -> then once contract is deployed, go back and add the contract address as delegate for your channel
                _params[tokenId].authorAddress, // to recipient, put address(this) in case you want Broadcast or Subset. For Targetted put the address to which you want to send
                bytes(
                    string(
                        // We are passing identity here: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                        abi.encodePacked(
                            "0", // this is notification identity: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/identity/payload-identity-implementations
                            "+", // segregator
                            "3", // this is payload type: https://docs.epns.io/developers/developer-guides/sending-notifications/advanced/notification-payload-types/payload (1, 3 or 4) = (Broadcast, targetted or subset)
                            "+", // segregator
                            "New watcher is added", // this is notificaiton title
                            "+", // segregator
                            string.concat(
                                "Open the goal #",
                                Strings.toString(tokenId),
                                " to accept it"
                            ) // notification body
                        )
                    )
                )
            );
        }
    }

    function acceptWatcher(uint256 tokenId, address watcherAddress) public {
        // Base checks
        _requireNotPaused();
        require(_exists(tokenId), Errors.TOKEN_DOES_NOT_EXIST);
        require(!_params[tokenId].isClosed, Errors.GOAL_IS_CLOSED);
        require(
            _params[tokenId].authorAddress == msg.sender,
            Errors.SENDER_IS_NOT_GOAL_AUTHOR
        );
        // Check watcher
        uint watcherIndex = 2 ^ (256 - 1);
        for (uint i = 0; i < _watchers[tokenId].length; i++) {
            if (_watchers[tokenId][i].accountAddress == watcherAddress) {
                watcherIndex = i;
            }
        }
        require(watcherIndex != 2 ^ (256 - 1), Errors.WATCHER_IS_NOT_FOUND);
        DataTypes.GoalWatcher storage watcher = _watchers[tokenId][
            watcherIndex
        ];
        require(!watcher.isAccepted, Errors.WATCHER_IS_ALREADY_ACCEPTED);
        // Update watcher
        watcher.isAccepted = true;
        // Emit events
        emit WatcherSet(tokenId, watcher.accountAddress, watcher);
    }

    function verify(uint tokenId) public {
        addVerificationDataAndVerify(tokenId, new string[](0), new string[](0));
    }

    function addVerificationDataAndVerify(
        uint tokenId,
        string[] memory verificationDataKeys,
        string[] memory verificationDataValues
    ) public {
        // Base Checks
        _requireNotPaused();
        require(_exists(tokenId), Errors.TOKEN_DOES_NOT_EXIST);
        require(!_params[tokenId].isClosed, Errors.GOAL_IS_CLOSED);
        require(
            _params[tokenId].authorAddress == msg.sender,
            Errors.SENDER_IS_NOT_GOAL_AUTHOR
        );
        // Add verification data
        _addVerificationData(
            tokenId,
            verificationDataKeys,
            verificationDataValues
        );
        // Verify
        IVerifier(_getVerifierAddress(tokenId)).verify(tokenId);
    }

    function getVerificationStatus(
        uint tokenId
    ) public view returns (bool isAchieved, bool isFailed) {
        return
            IVerifier(_getVerifierAddress(tokenId)).getVerificationStatus(
                tokenId
            );
    }

    function close(uint256 tokenId) public {
        // Base checks
        _requireNotPaused();
        require(_exists(tokenId), Errors.TOKEN_DOES_NOT_EXIST);
        require(!_params[tokenId].isClosed, Errors.GOAL_IS_CLOSED);
        // Try close as achieved by goal author if deadline has not passed
        if (_params[tokenId].deadlineTimestamp > block.timestamp) {
            require(
                _params[tokenId].authorAddress == msg.sender,
                Errors.SENDER_IS_NOT_GOAL_AUTHOR
            );
            (bool isVerificationStatusAchieved, ) = IVerifier(
                _getVerifierAddress(tokenId)
            ).getVerificationStatus(tokenId);
            require(
                isVerificationStatusAchieved,
                Errors.GOAL_VERIFICATION_STATUS_IS_NOT_ACHIEVED
            );
            _params[tokenId].isClosed = true;
            _params[tokenId].isAchieved = true;
            // Emit events
            emit ParamsSet(tokenId, _params[tokenId]);
            emit ClosedAsAchieved(tokenId);
            // Return stake
            (bool sent, ) = _params[tokenId].authorAddress.call{
                value: _params[tokenId].authorStake
            }("");
            require(sent, Errors.FAIL_TO_RETURN_AUTHOR_STAKE);
        }
        // Close as failed if deadline has passed
        else {
            _params[tokenId].isClosed = true;
            _params[tokenId].isAchieved = false;
            // Emit events
            emit ParamsSet(tokenId, _params[tokenId]);
            emit ClosedAsFailed(tokenId);
            // Define number of accepted watchers
            uint acceptedWatchersNumber = 0;
            for (uint i = 0; i < _watchers[tokenId].length; i++) {
                if (_watchers[tokenId][i].isAccepted) {
                    acceptedWatchersNumber++;
                }
            }
            // Send stake to accepted watchers
            if (acceptedWatchersNumber == 0) {
                return;
            }
            uint watcherStakePart = _params[tokenId].authorStake /
                acceptedWatchersNumber;
            for (uint i = 0; i < _watchers[tokenId].length; i++) {
                if (_watchers[tokenId][i].isAccepted) {
                    (bool sent, ) = _watchers[tokenId][i].accountAddress.call{
                        value: watcherStakePart
                    }("");
                    require(sent, Errors.FAIL_TO_SEND_PART_OF_STAKE_TO_WATCHER);
                }
            }
        }
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function getCurrentCounter() public view returns (uint) {
        return _counter.current();
    }

    function getHubAddress() public view returns (address) {
        return _hubAddress;
    }

    function setHubAddress(address hubAddress) public onlyOwner {
        _hubAddress = hubAddress;
    }

    function getEpnsCommContractAddress() public view returns (address) {
        return _epnsCommContractAddress;
    }

    function setEpnsCommContractAddress(
        address epnsCommContractAddress
    ) public onlyOwner {
        _epnsCommContractAddress = epnsCommContractAddress;
    }

    function getEpnsChannelAddress() public view returns (address) {
        return _epnsChannelAddress;
    }

    function setEpnsChannelAddress(
        address epnsChannelAddress
    ) public onlyOwner {
        _epnsChannelAddress = epnsChannelAddress;
    }

    function getUsageFeePercent() public view returns (uint) {
        return _usageFeePercent;
    }

    function setUsageFeePercent(uint usageFeePercent) public onlyOwner {
        _usageFeePercent = usageFeePercent;
    }

    function getParams(
        uint256 tokenId
    ) public view returns (DataTypes.GoalParams memory) {
        return _params[tokenId];
    }

    function getVerificationData(
        uint256 tokenId,
        string memory key
    ) public view returns (string memory) {
        return _verificationData[tokenId][key];
    }

    function getVerificationDataList(
        uint256 tokenId,
        string[] memory keys
    ) public view returns (string[] memory) {
        string[] memory values = new string[](keys.length);
        for (uint i = 0; i < keys.length; i++) {
            values[i] = (_verificationData[tokenId][keys[i]]);
        }
        return values;
    }

    function getWatchers(
        uint256 tokenId
    ) public view returns (DataTypes.GoalWatcher[] memory) {
        return _watchers[tokenId];
    }

    // TODO: Move image value to changeable variables
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        abi.encodePacked(
                            '{"name":" Web3 Goal #',
                            Strings.toString(tokenId),
                            '","image":"data:image/svg+xml;base64,',
                            Base64.encode(
                                abi.encodePacked(
                                    '<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="white"/><path d="M279.139 211.497V172.426C279.139 168.42 280.732 164.578 283.565 161.745L328.887 116.42C332.322 112.99 337.193 111.417 341.986 112.196C346.776 112.975 350.901 116.007 353.074 120.348L365.929 146.064L391.643 158.905C395.991 161.075 399.026 165.205 399.804 170.001C400.583 174.797 399.008 179.674 395.571 183.108L350.248 228.433C347.415 231.266 343.573 232.859 339.567 232.859H300.499L259.603 273.758C255.766 277.466 250.257 278.873 245.113 277.461C239.969 276.053 235.947 272.031 234.539 266.886C233.127 261.742 234.534 256.233 238.241 252.396L279.139 211.497ZM309.352 178.681V202.644H333.314L359.389 176.567L347.907 170.826C344.991 169.361 342.629 166.991 341.169 164.072L335.428 152.604L309.352 178.681Z" fill="#2B6EFD"/><path d="M248.5 127C253.918 127 258.925 129.892 261.635 134.584C264.344 139.277 264.344 145.058 261.635 149.75C258.925 154.443 253.918 157.334 248.5 157.334C220.342 157.334 193.339 168.519 173.431 188.431C153.519 208.34 142.334 235.343 142.334 263.5C142.334 291.657 153.519 318.661 173.431 338.569C193.34 358.481 220.343 369.666 248.5 369.666C276.657 369.666 303.661 358.481 323.569 338.569C343.481 318.66 354.665 291.657 354.665 263.5C354.665 258.082 357.558 253.075 362.25 250.365C366.942 247.656 372.723 247.656 377.416 250.365C382.108 253.075 385 258.082 385 263.5C385 299.702 370.619 334.422 345.019 360.019C319.42 385.619 284.701 400 248.5 400C212.299 400 177.578 385.619 151.981 360.019C126.381 334.42 112 299.701 112 263.5C112 227.299 126.381 192.578 151.981 166.981C177.58 141.381 212.299 127 248.5 127ZM248.5 187.666C253.918 187.666 258.925 190.558 261.635 195.251C264.344 199.943 264.344 205.724 261.635 210.417C258.925 215.109 253.918 218.001 248.5 218.001C236.432 218.001 224.859 222.795 216.327 231.329C207.793 239.86 203 251.433 203 263.501C203 275.569 207.793 287.143 216.327 295.674C224.859 304.208 236.432 309.002 248.5 309.002C260.568 309.002 272.141 304.208 280.673 295.674C289.207 287.143 294 275.569 294 263.501C294 258.083 296.892 253.076 301.585 250.367C306.277 247.657 312.058 247.657 316.751 250.367C321.443 253.076 324.335 258.083 324.335 263.501C324.335 283.613 316.344 302.903 302.123 317.124C287.901 331.346 268.612 339.336 248.5 339.336C228.388 339.336 209.099 331.346 194.877 317.124C180.656 302.903 172.665 283.613 172.665 263.501C172.665 243.389 180.656 224.1 194.877 209.878C209.099 195.657 228.388 187.666 248.5 187.666Z" fill="#FF4400"/></svg>'
                                )
                            ),
                            '","attributes":[{"trait_type":"id","value":"',
                            Strings.toString(tokenId),
                            '"},{"trait_type":"author","value":"',
                            Strings.toHexString(
                                uint160(_params[tokenId].authorAddress)
                            ),
                            '"},{"trait_type":"description","value":"',
                            _params[tokenId].description,
                            '"},{"trait_type":"staked wei","value":"',
                            Strings.toString(_params[tokenId].authorStake),
                            '"},{"trait_type":"deadline timestamp","value":"',
                            Strings.toString(
                                _params[tokenId].deadlineTimestamp
                            ),
                            '"},{"trait_type":"is closed","value":"',
                            _params[tokenId].isClosed ? "true" : "false",
                            '"},{"trait_type":"is achieved","value":"',
                            _params[tokenId].isAchieved ? "true" : "false",
                            '"}]}'
                        )
                    )
                )
            );
    }

    function _getVerifierAddress(
        uint256 tokenId
    ) internal view returns (address) {
        address verifierAddress = IHub(_hubAddress).getVerifierAddress(
            _params[tokenId].verificationRequirement
        );
        require(
            verifierAddress != address(0),
            Errors.NOT_FOUND_VERIFIER_FOR_GOAL_VERIFICATION_REQUIREMENT
        );
        return verifierAddress;
    }

    function _addVerificationData(
        uint256 tokenId,
        string[] memory verificationDataKeys,
        string[] memory verificationDataValues
    ) internal {
        require(
            verificationDataKeys.length == verificationDataValues.length,
            Errors.ARRAYS_MUST_HAVE_THE_SAME_LENGTH
        );
        for (uint i = 0; i < verificationDataKeys.length; i++) {
            _verificationData[tokenId][
                verificationDataKeys[i]
            ] = verificationDataValues[i];
        }
    }

    /**
     * Hook that is called before any token transfer.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721Upgradeable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        // Disable transfers except minting
        require(from == address(0), Errors.TOKEN_IS_NON_TRANSFERABLE);
    }
}
