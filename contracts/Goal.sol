// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IHub.sol";
import "./interfaces/IVerifier.sol";
import "./interfaces/IPUSHCommInterface.sol";
import "./libraries/DataTypes.sol";
import "./libraries/Errors.sol";
import "./libraries/Constants.sol";

/**
 * Contract to set, verify, close goals and become a goals watcher.
 */
contract Goal is
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable
{
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
        string memory uri,
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
        // Set uri
        _setTokenURI(newTokenId, uri);
        emit URISet(newTokenId, uri);
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

    function uppause() public onlyOwner {
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
