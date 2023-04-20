// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./libraries/DataTypes.sol";
import "./libraries/Constants.sol";
import "./libraries/Errors.sol";

/**
 * A contract that stores goals that can be closed with unverified proofs.
 */
contract IndieGoal is
    ERC721Upgradeable,
    OwnableUpgradeable,
    PausableUpgradeable
{
    using Counters for Counters.Counter;

    event Set(uint256 indexed tokenId, DataTypes.IndieGoalParams params);
    event ProofPosted(uint256 indexed tokenId, DataTypes.IndieGoalProof proof);
    event MotivatorAdded(
        uint256 indexed tokenId,
        address indexed motivatorAccountAddress,
        DataTypes.IndieGoalMotivator motivator
    );
    event MotivatorAccepted(
        uint256 indexed tokenId,
        address indexed motivatorAccountAddress,
        DataTypes.IndieGoalMotivator motivator
    );
    event MessagePosted(
        uint256 indexed tokenId,
        DataTypes.IndieGoalMessage message
    );
    event ClosedAsAchieved(
        uint256 indexed tokenId,
        DataTypes.IndieGoalParams params
    );
    event ClosedAsFailed(
        uint256 indexed tokenId,
        DataTypes.IndieGoalParams params
    );
    event AccountReputationSet(
        address indexed accountAddress,
        DataTypes.IndieGoalAccountReputation accountReputation
    );

    address private _profileAddress;
    address private _keeperAddress;
    uint private _usageFeePercent;
    string _imageSVG;
    Counters.Counter private _counter;
    mapping(uint256 => DataTypes.IndieGoalParams) private _params;
    mapping(uint256 => DataTypes.IndieGoalProof[]) private _proofs;
    mapping(uint256 => DataTypes.IndieGoalMotivator[]) private _motivators;
    mapping(address => DataTypes.IndieGoalAccountReputation)
        private _accountReputations;

    function initialize(
        address profileAddress,
        address keeperAddress,
        uint usageFeePercent
    ) public initializer {
        __ERC721_init("Web3 Goals - Indie Goals", "W3GIG");
        __Ownable_init();
        __Pausable_init();
        _profileAddress = profileAddress;
        _keeperAddress = keeperAddress;
        _usageFeePercent = usageFeePercent;
        _imageSVG = '<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="white"/><path d="M279.139 211.497V172.426C279.139 168.42 280.732 164.578 283.565 161.745L328.887 116.42C332.322 112.99 337.193 111.417 341.986 112.196C346.776 112.975 350.901 116.007 353.074 120.348L365.929 146.064L391.643 158.905C395.991 161.075 399.026 165.205 399.804 170.001C400.583 174.797 399.008 179.674 395.571 183.108L350.248 228.433C347.415 231.266 343.573 232.859 339.567 232.859H300.499L259.603 273.758C255.766 277.466 250.257 278.873 245.113 277.461C239.969 276.053 235.947 272.031 234.539 266.886C233.127 261.742 234.534 256.233 238.241 252.396L279.139 211.497ZM309.352 178.681V202.644H333.314L359.389 176.567L347.907 170.826C344.991 169.361 342.629 166.991 341.169 164.072L335.428 152.604L309.352 178.681Z" fill="#2B6EFD"/><path d="M248.5 127C253.918 127 258.925 129.892 261.635 134.584C264.344 139.277 264.344 145.058 261.635 149.75C258.925 154.443 253.918 157.334 248.5 157.334C220.342 157.334 193.339 168.519 173.431 188.431C153.519 208.34 142.334 235.343 142.334 263.5C142.334 291.657 153.519 318.661 173.431 338.569C193.34 358.481 220.343 369.666 248.5 369.666C276.657 369.666 303.661 358.481 323.569 338.569C343.481 318.66 354.665 291.657 354.665 263.5C354.665 258.082 357.558 253.075 362.25 250.365C366.942 247.656 372.723 247.656 377.416 250.365C382.108 253.075 385 258.082 385 263.5C385 299.702 370.619 334.422 345.019 360.019C319.42 385.619 284.701 400 248.5 400C212.299 400 177.578 385.619 151.981 360.019C126.381 334.42 112 299.701 112 263.5C112 227.299 126.381 192.578 151.981 166.981C177.58 141.381 212.299 127 248.5 127ZM248.5 187.666C253.918 187.666 258.925 190.558 261.635 195.251C264.344 199.943 264.344 205.724 261.635 210.417C258.925 215.109 253.918 218.001 248.5 218.001C236.432 218.001 224.859 222.795 216.327 231.329C207.793 239.86 203 251.433 203 263.501C203 275.569 207.793 287.143 216.327 295.674C224.859 304.208 236.432 309.002 248.5 309.002C260.568 309.002 272.141 304.208 280.673 295.674C289.207 287.143 294 275.569 294 263.501C294 258.083 296.892 253.076 301.585 250.367C306.277 247.657 312.058 247.657 316.751 250.367C321.443 253.076 324.335 258.083 324.335 263.501C324.335 283.613 316.344 302.903 302.123 317.124C287.901 331.346 268.612 339.336 248.5 339.336C228.388 339.336 209.099 331.346 194.877 317.124C180.656 302.903 172.665 283.613 172.665 263.501C172.665 243.389 180.656 224.1 194.877 209.878C209.099 195.657 228.388 187.666 248.5 187.666Z" fill="#FF4400"/></svg>';
    }

    /// ***************************
    /// ***** OWNER FUNCTIONS *****
    /// ***************************

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setProfileAddress(address profileAddress) public onlyOwner {
        _profileAddress = profileAddress;
    }

    function setKeeperAddress(address keeperAddress) public onlyOwner {
        _keeperAddress = keeperAddress;
    }

    function setUsageFeePercent(uint usageFeePercent) public onlyOwner {
        _usageFeePercent = usageFeePercent;
    }

    function setImageSVG(string memory imageSVG) public onlyOwner {
        _imageSVG = imageSVG;
    }

    /// **************************
    /// ***** USER FUNCTIONS *****
    /// **************************

    function set(
        string memory description,
        uint stake,
        uint deadlineTimestamp
    ) public payable whenNotPaused returns (uint256) {
        // Base checks
        if (!_isHasProfile(msg.sender)) revert Errors.ProfileNotExists();
        if (msg.value != stake) revert Errors.MessageValueMismatch();
        if (stake <= 0) revert Errors.StakeInvalid();
        if (deadlineTimestamp < block.timestamp + Constants.SECONDS_PER_DAY)
            revert Errors.DeadlineMustBeAtLeast24HoursLater();
        // Update counter
        _counter.increment();
        // Mint token
        uint256 newTokenId = _counter.current();
        _mint(msg.sender, newTokenId);
        // Set params
        DataTypes.IndieGoalParams memory tokenParams = DataTypes
            .IndieGoalParams(
                block.timestamp,
                description,
                msg.sender,
                stake,
                deadlineTimestamp,
                false,
                false
            );
        _params[newTokenId] = tokenParams;
        emit Set(newTokenId, tokenParams);
        // Return
        return newTokenId;
    }

    function postProof(
        uint256 tokenId,
        string memory extraDataURI
    ) public whenNotPaused {
        // Base checks
        if (!_exists(tokenId)) revert Errors.TokenDoesNotExist();
        if (_params[tokenId].isClosed) revert Errors.GoalClosed();
        if (_params[tokenId].authorAddress != msg.sender)
            revert Errors.NotAuthor();
        // Add proof
        DataTypes.IndieGoalProof memory proof = DataTypes.IndieGoalProof(
            block.timestamp,
            extraDataURI
        );
        _proofs[tokenId].push(proof);
        emit ProofPosted(tokenId, proof);
    }

    function becomeMotivator(
        uint256 tokenId,
        string memory extraDataURI
    ) public whenNotPaused {
        // Base checks
        if (!_isHasProfile(msg.sender)) revert Errors.ProfileNotExists();
        if (!_exists(tokenId)) revert Errors.TokenDoesNotExist();
        if (_params[tokenId].isClosed) revert Errors.GoalClosed();
        if (_params[tokenId].authorAddress == msg.sender)
            revert Errors.AuthorCannotBeMotivator();
        if (_isMotivator(tokenId, msg.sender)) revert Errors.AlreadyMotivator();
        // Add motivator
        DataTypes.IndieGoalMotivator memory motivator = DataTypes
            .IndieGoalMotivator(
                block.timestamp,
                msg.sender,
                false,
                extraDataURI
            );
        _motivators[tokenId].push(motivator);
        emit MotivatorAdded(tokenId, motivator.accountAddress, motivator);
    }

    function acceptMotivator(
        uint256 tokenId,
        address motivatorAddress
    ) public whenNotPaused {
        // Base checks
        if (!_exists(tokenId)) revert Errors.TokenDoesNotExist();
        if (_params[tokenId].isClosed) revert Errors.GoalClosed();
        if (_params[tokenId].authorAddress != msg.sender)
            revert Errors.NotAuthor();
        if (!_isMotivator(tokenId, motivatorAddress))
            revert Errors.MotivatorNotFound();
        if (_isAcceptedMotivator(tokenId, motivatorAddress))
            revert Errors.AlreadyAccepted();
        // Update motivator
        for (uint i = 0; i < _motivators[tokenId].length; i++) {
            if (_motivators[tokenId][i].accountAddress == motivatorAddress) {
                _motivators[tokenId][i].isAccepted = true;
                emit MotivatorAccepted(
                    tokenId,
                    _motivators[tokenId][i].accountAddress,
                    _motivators[tokenId][i]
                );
                return;
            }
        }
    }

    function postMessage(
        uint256 tokenId,
        string memory extraDataURI
    ) public whenNotPaused {
        // Base checks
        if (!_isHasProfile(msg.sender)) revert Errors.ProfileNotExists();
        if (!_exists(tokenId)) revert Errors.TokenDoesNotExist();
        if (_params[tokenId].isClosed) revert Errors.GoalClosed();
        if (
            _params[tokenId].authorAddress != msg.sender &&
            !_isAcceptedMotivator(tokenId, msg.sender)
        ) revert Errors.NotAuthorNotAcceptedMotivator();
        // Emit event
        DataTypes.IndieGoalMessage memory message = DataTypes.IndieGoalMessage(
            block.timestamp,
            msg.sender,
            extraDataURI
        );
        emit MessagePosted(tokenId, message);
    }

    function close(uint256 tokenId) public whenNotPaused {
        // Base checks
        if (!_exists(tokenId)) revert Errors.TokenDoesNotExist();
        if (_params[tokenId].isClosed) revert Errors.GoalClosed();
        // Close
        if (_params[tokenId].deadlineTimestamp > block.timestamp) {
            _closeAsAchievedBeforeDeadline(tokenId);
        } else {
            _closeAsFailedAfterDeadline(tokenId);
        }
    }

    /// *********************************
    /// ***** PUBLIC VIEW FUNCTIONS *****
    /// *********************************

    function getProfileAddress() public view returns (address) {
        return _profileAddress;
    }

    function getKeeperAddress() public view returns (address) {
        return _keeperAddress;
    }

    function getUsageFeePercent() public view returns (uint) {
        return _usageFeePercent;
    }

    function getImageSVG() public view returns (string memory) {
        return _imageSVG;
    }

    function getCurrentCounter() public view returns (uint) {
        return _counter.current();
    }

    function getParams(
        uint256 tokenId
    ) public view returns (DataTypes.IndieGoalParams memory) {
        return _params[tokenId];
    }

    function getMotivators(
        uint256 tokenId
    ) public view returns (DataTypes.IndieGoalMotivator[] memory) {
        return _motivators[tokenId];
    }

    function getAccountReputation(
        address accountAddress
    ) public view returns (DataTypes.IndieGoalAccountReputation memory) {
        return _accountReputations[accountAddress];
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        abi.encodePacked(
                            '{"name":"Web3 Goals - Indie Goal #',
                            Strings.toString(tokenId),
                            '","image":"data:image/svg+xml;base64,',
                            Base64.encode(abi.encodePacked(_imageSVG)),
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

    /// ******************************
    /// ***** INTERNAL FUNCTIONS *****
    /// ******************************

    function _isHasProfile(
        address accountAddress
    ) internal view returns (bool) {
        return
            IERC721Upgradeable(_profileAddress).balanceOf(accountAddress) > 0;
    }

    function _isMotivator(
        uint256 tokenId,
        address accountAddress
    ) internal view returns (bool) {
        for (uint i = 0; i < _motivators[tokenId].length; i++) {
            if (_motivators[tokenId][i].accountAddress == accountAddress) {
                return true;
            }
        }
        return false;
    }

    function _isAcceptedMotivator(
        uint256 tokenId,
        address accountAddress
    ) internal view returns (bool) {
        for (uint i = 0; i < _motivators[tokenId].length; i++) {
            if (
                _motivators[tokenId][i].accountAddress == accountAddress &&
                _motivators[tokenId][i].isAccepted == true
            ) {
                return true;
            }
        }
        return false;
    }

    function _closeAsAchievedBeforeDeadline(uint256 tokenId) internal {
        // Check author
        if (_params[tokenId].authorAddress != msg.sender)
            revert Errors.NotAuthor();
        // Check proofs
        if (_proofs[tokenId].length == 0) revert Errors.ProofsNotFound();
        // Update token
        _params[tokenId].isClosed = true;
        _params[tokenId].isAchieved = true;
        emit ClosedAsAchieved(tokenId, _params[tokenId]);
        // Update reputation for creator
        _accountReputations[_params[tokenId].authorAddress].achievedGoals++;
        emit AccountReputationSet(
            _params[tokenId].authorAddress,
            _accountReputations[_params[tokenId].authorAddress]
        );
        // Update reputation for accepted motivators
        for (uint i = 0; i < _motivators[tokenId].length; i++) {
            if (_motivators[tokenId][i].isAccepted) {
                _accountReputations[_motivators[tokenId][i].accountAddress]
                    .motivatedGoals++;
                emit AccountReputationSet(
                    _motivators[tokenId][i].accountAddress,
                    _accountReputations[_motivators[tokenId][i].accountAddress]
                );
            }
        }
        // Return stake
        (bool sent, ) = _params[tokenId].authorAddress.call{
            value: _params[tokenId].authorStake
        }("");
        if (!sent) revert Errors.SendingStakeToAuthorFailed();
    }

    function _closeAsFailedAfterDeadline(uint256 tokenId) internal {
        // Update token
        _params[tokenId].isClosed = true;
        _params[tokenId].isAchieved = false;
        emit ClosedAsFailed(tokenId, _params[tokenId]);
        // Update reputation for creator
        _accountReputations[_params[tokenId].authorAddress].failedGoals++;
        emit AccountReputationSet(
            _params[tokenId].authorAddress,
            _accountReputations[_params[tokenId].authorAddress]
        );
        // Update reputation for accepted motivators
        for (uint i = 0; i < _motivators[tokenId].length; i++) {
            if (_motivators[tokenId][i].isAccepted) {
                _accountReputations[_motivators[tokenId][i].accountAddress]
                    .notMotivatedGoals++;
                emit AccountReputationSet(
                    _motivators[tokenId][i].accountAddress,
                    _accountReputations[_motivators[tokenId][i].accountAddress]
                );
            }
        }
        // Define number of accepted motivators
        uint acceptedMotivatorNumber = 0;
        for (uint i = 0; i < _motivators[tokenId].length; i++) {
            if (_motivators[tokenId][i].isAccepted) {
                acceptedMotivatorNumber++;
            }
        }
        // If there are no accepted motivators, then send stake to keeper
        if (acceptedMotivatorNumber == 0) {
            (bool sentToKepper, ) = _keeperAddress.call{
                value: _params[tokenId].authorStake
            }("");
            if (!sentToKepper) revert Errors.SendingStakeToKeeperFailed();
        }
        // If accepted motivators exist, then send part of stake to them and part to keeper
        else {
            // Send stake to keeper
            uint stakeForKeeper = (_params[tokenId].authorStake *
                _usageFeePercent) / 100;
            (bool sentToKepper, ) = _keeperAddress.call{value: stakeForKeeper}(
                ""
            );
            if (!sentToKepper) revert Errors.SendingStakeToKeeperFailed();
            // Send stake to motivators
            uint stakeForMotivators = _params[tokenId].authorStake -
                stakeForKeeper;
            for (uint i = 0; i < _motivators[tokenId].length; i++) {
                if (_motivators[tokenId][i].isAccepted) {
                    (bool sentToMotivator, ) = _motivators[tokenId][i]
                        .accountAddress
                        .call{
                        value: stakeForMotivators / acceptedMotivatorNumber
                    }("");
                    if (!sentToMotivator)
                        revert Errors.SendingStakeToMotivatorFailed();
                }
            }
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
        if (from != address(0)) revert Errors.TokenNotTransferable();
    }
}
