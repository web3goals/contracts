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
    event MotivatorUpdated(
        uint256 indexed tokenId,
        address indexed motivatorAccountAddress,
        DataTypes.IndieGoalMotivator motivator
    );
    event MessagePosted(
        uint256 indexed tokenId,
        uint256 indexed messageId,
        DataTypes.IndieGoalMessage message
    );
    event MessageEvaluated(
        uint256 indexed tokenId,
        uint256 indexed messageId,
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

    address private _profileAddress;
    address private _keeperAddress;
    uint private _usageFeePercent;
    string _imageSVG;
    Counters.Counter private _counter;
    mapping(uint256 => DataTypes.IndieGoalParams) private _params;
    mapping(uint256 => DataTypes.IndieGoalProof[]) private _proofs;
    mapping(uint256 => DataTypes.IndieGoalMotivator[]) private _motivators;
    mapping(uint256 => DataTypes.IndieGoalMessage[]) private _messages;

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

    /// *********************
    /// ***** MODIFIERS *****
    /// *********************

    modifier onlyWithProfile() {
        if (IERC721Upgradeable(_profileAddress).balanceOf(msg.sender) == 0)
            revert Errors.ProfileNotExists();
        _;
    }

    modifier whenExists(uint256 tokenId) {
        if (!_exists(tokenId)) revert Errors.TokenDoesNotExist();
        _;
    }

    modifier wnehNotClosed(uint256 tokenId) {
        if (_params[tokenId].isClosed) revert Errors.GoalClosed();
        _;
    }

    modifier onlyAuthor(uint256 tokenId) {
        if (_params[tokenId].authorAddress != msg.sender)
            revert Errors.NotAuthor();
        _;
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
        uint deadlineTimestamp,
        string memory extraDataURI
    ) public payable whenNotPaused onlyWithProfile returns (uint256) {
        // Check data
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
                false,
                extraDataURI
            );
        _params[newTokenId] = tokenParams;
        emit Set(newTokenId, tokenParams);
        // Return
        return newTokenId;
    }

    function postProof(
        uint256 tokenId,
        string memory extraDataURI
    )
        public
        whenNotPaused
        whenExists(tokenId)
        wnehNotClosed(tokenId)
        onlyAuthor(tokenId)
    {
        DataTypes.IndieGoalProof memory proof = DataTypes.IndieGoalProof(
            block.timestamp,
            extraDataURI
        );
        _proofs[tokenId].push(proof);
        emit ProofPosted(tokenId, proof);
    }

    function postMessage(
        uint256 tokenId,
        string memory extraDataURI
    )
        public
        whenNotPaused
        whenExists(tokenId)
        wnehNotClosed(tokenId)
        onlyWithProfile
    {
        // Add message
        DataTypes.IndieGoalMessage memory message = DataTypes.IndieGoalMessage(
            block.timestamp,
            msg.sender,
            false,
            false,
            extraDataURI
        );
        _messages[tokenId].push(message);
        emit MessagePosted(tokenId, _messages[tokenId].length - 1, message);
        // Add motivator
        _addMotivator(tokenId, msg.sender);
    }

    function evaluateMessage(
        uint256 tokenId,
        uint256 messageId,
        bool isMotivating,
        bool isSuperMotivating
    )
        public
        whenNotPaused
        whenExists(tokenId)
        wnehNotClosed(tokenId)
        onlyAuthor(tokenId)
    {
        if (
            (isMotivating && isSuperMotivating) ||
            (!isMotivating && !isSuperMotivating)
        ) revert Errors.EvaluationIncorrect();
        if (_messages[tokenId].length - 1 < messageId)
            revert Errors.MessageNotExists();
        if (_messages[tokenId][messageId].authorAddress == msg.sender)
            revert Errors.AuthorCannotEvaluateOwnMessage();
        if (
            _messages[tokenId][messageId].isMotivating ||
            _messages[tokenId][messageId].isSuperMotivating
        ) revert Errors.MessageAlreadyEvaluated();
        // Update message
        _messages[tokenId][messageId].isMotivating = isMotivating;
        _messages[tokenId][messageId].isSuperMotivating = isSuperMotivating;
        emit MessageEvaluated(
            tokenId,
            messageId,
            _messages[tokenId][messageId]
        );
        // Update motivator
        _updateMotivator(
            tokenId,
            _messages[tokenId][messageId].authorAddress,
            isMotivating ? 1 : 0,
            isSuperMotivating ? 1 : 0
        );
    }

    function close(
        uint256 tokenId
    ) public whenNotPaused whenExists(tokenId) wnehNotClosed(tokenId) {
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

    function getProofs(
        uint256 tokenId
    ) public view returns (DataTypes.IndieGoalProof[] memory) {
        return _proofs[tokenId];
    }

    function getMotivators(
        uint256 tokenId
    ) public view returns (DataTypes.IndieGoalMotivator[] memory) {
        return _motivators[tokenId];
    }

    function getMessages(
        uint256 tokenId
    ) public view returns (DataTypes.IndieGoalMessage[] memory) {
        return _messages[tokenId];
    }

    function getReputation(
        address accountAddress
    ) public view returns (uint, uint, uint) {
        uint goals;
        uint achievedGoals;
        uint failedGoals;
        for (uint i = 1; i <= _counter.current(); i++) {
            if (_params[i].authorAddress == accountAddress) {
                goals++;
            }
            if (
                _params[i].authorAddress == accountAddress &&
                _params[i].isClosed &&
                _params[i].isAchieved
            ) {
                achievedGoals++;
            }
            if (
                _params[i].authorAddress == accountAddress &&
                _params[i].isClosed &&
                !_params[i].isAchieved
            ) {
                failedGoals++;
            }
        }
        return (goals, achievedGoals, failedGoals);
    }

    function getMotivatorReputation(
        address accountAddress
    ) public view returns (uint, uint) {
        uint motivations;
        uint superMotivations;
        for (uint i = 1; i <= _counter.current(); i++) {
            for (uint j = 0; j < _motivators[i].length; j++) {
                if (_motivators[i][j].accountAddress == accountAddress) {
                    motivations += _motivators[i][j].motivations;
                    superMotivations += _motivators[i][j].superMotivations;
                }
            }
        }
        return (motivations, superMotivations);
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

    function _addMotivator(uint256 tokenId, address accountAddress) internal {
        // Check if author
        if (_params[tokenId].authorAddress == accountAddress) return;
        // Check if already exists
        for (uint i = 0; i < _motivators[tokenId].length; i++) {
            if (_motivators[tokenId][i].accountAddress == accountAddress) {
                return;
            }
        }
        // Add motivator
        DataTypes.IndieGoalMotivator memory motivator = DataTypes
            .IndieGoalMotivator(msg.sender, 0, 0);
        _motivators[tokenId].push(motivator);
        emit MotivatorAdded(tokenId, accountAddress, motivator);
    }

    function _updateMotivator(
        uint256 tokenId,
        address accountAddress,
        uint additionalMotivations,
        uint additionalSuperMotivations
    ) internal {
        for (uint i = 0; i < _motivators[tokenId].length; i++) {
            if (_motivators[tokenId][i].accountAddress == accountAddress) {
                _motivators[tokenId][i].motivations += additionalMotivations;
                _motivators[tokenId][i]
                    .superMotivations += additionalSuperMotivations;
                emit MotivatorUpdated(
                    tokenId,
                    accountAddress,
                    _motivators[tokenId][i]
                );
            }
        }
    }

    function _getMotivatorPoints(
        DataTypes.IndieGoalMotivator memory motivator
    ) internal pure returns (uint) {
        return 1 * motivator.motivations + 3 * motivator.superMotivations;
    }

    function _closeAsAchievedBeforeDeadline(
        uint256 tokenId
    ) internal onlyAuthor(tokenId) {
        // Check data
        if (_proofs[tokenId].length == 0) revert Errors.ProofsNotFound();
        // Update token
        _params[tokenId].isClosed = true;
        _params[tokenId].isAchieved = true;
        emit ClosedAsAchieved(tokenId, _params[tokenId]);
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
        // Calculate total motivator points
        uint totalMotivatorPoints;
        for (uint i = 0; i < _motivators[tokenId].length; i++) {
            totalMotivatorPoints += _getMotivatorPoints(
                _motivators[tokenId][i]
            );
        }
        // If there are no motivators with points, then send stake to keeper
        if (totalMotivatorPoints == 0) {
            (bool sentToKepper, ) = _keeperAddress.call{
                value: _params[tokenId].authorStake
            }("");
            if (!sentToKepper) revert Errors.SendingStakeToKeeperFailed();
        }
        // If motivators with points exist, then send part of stake to them and part to keeper
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
                uint stakeForMotivator = (_getMotivatorPoints(
                    _motivators[tokenId][i]
                ) * stakeForMotivators) / totalMotivatorPoints;
                (bool sentToMotivator, ) = _motivators[tokenId][i]
                    .accountAddress
                    .call{value: stakeForMotivator}("");
                if (!sentToMotivator)
                    revert Errors.SendingStakeToMotivatorFailed();
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
