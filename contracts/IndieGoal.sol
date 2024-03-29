// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./libraries/DataTypes.sol";
import "./libraries/Constants.sol";
import "./libraries/Errors.sol";

/**
 * @title IndieGoal
 * @author Web3 Goals
 * @notice A contract that stores indie goals that can be closed with unverified proofs.
 */
contract IndieGoal is
    ERC721Upgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using Counters for Counters.Counter;

    /**
     * @dev Emitted when the goal is set.
     *
     * @param tokenId ID of the goal.
     * @param params The params data.
     */
    event Set(uint indexed tokenId, DataTypes.IndieGoalParams params);

    /**
     * @dev Emitted when the proof is posted.
     *
     * @param tokenId ID of the goal.
     * @param proof The proof data.
     */
    event ProofPosted(uint indexed tokenId, DataTypes.IndieGoalProof proof);

    /**
     * @dev Emitted when the motivator is added to the goal.
     *
     * @param tokenId ID of the goal.
     * @param motivatorAccountAddress Address of the motivator.
     * @param motivator The motivator data.
     */
    event MotivatorAdded(
        uint indexed tokenId,
        address indexed motivatorAccountAddress,
        DataTypes.IndieGoalMotivator motivator
    );

    /**
     * @dev Emitted when the motivator of the goal is updated.
     *
     * @param tokenId ID of the goal.
     * @param motivatorAccountAddress Address of the motivator.
     * @param motivator The motivator data.
     */
    event MotivatorUpdated(
        uint indexed tokenId,
        address indexed motivatorAccountAddress,
        DataTypes.IndieGoalMotivator motivator
    );

    /**
     * @dev Emitted when the message for the goal is posted.
     *
     * @param tokenId ID of the goal.
     * @param messageId ID of the message.
     * @param message The message data.
     */
    event MessagePosted(
        uint indexed tokenId,
        uint indexed messageId,
        DataTypes.IndieGoalMessage message
    );

    /**
     * @dev Emitted when the message for the goal is evaluated.
     *
     * @param tokenId ID of the goal.
     * @param messageId ID of the message.
     * @param message The message data.
     */
    event MessageEvaluated(
        uint indexed tokenId,
        uint indexed messageId,
        DataTypes.IndieGoalMessage message
    );

    /**
     * @dev Emitted when the goal is closed as achieved.
     *
     * @param tokenId ID of the goal.
     * @param params The params data.
     */
    event ClosedAsAchieved(
        uint indexed tokenId,
        DataTypes.IndieGoalParams params
    );

    /**
     * @dev Emitted when the goal is closed as failed.
     *
     * @param tokenId ID of the goal.
     * @param params The params data.
     */
    event ClosedAsFailed(
        uint indexed tokenId,
        DataTypes.IndieGoalParams params
    );

    address private _profileAddress;
    address private _treasuryAddress;
    string _imageSVG;
    Counters.Counter private _counter;
    mapping(uint => DataTypes.IndieGoalParams) private _params;
    mapping(uint => DataTypes.IndieGoalProof[]) private _proofs;
    mapping(uint => DataTypes.IndieGoalMotivator[]) private _motivators;
    mapping(uint => DataTypes.IndieGoalMessage[]) private _messages;

    function initialize(
        address profileAddress,
        address treasuryAddress
    ) public initializer {
        __ERC721_init("Web3 Goals - Indie Goals", "W3GIG");
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        _profileAddress = profileAddress;
        _treasuryAddress = treasuryAddress;
        _imageSVG = '<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="white"/><path d="M279.139 211.497V172.426C279.139 168.42 280.732 164.578 283.565 161.745L328.887 116.42C332.322 112.99 337.193 111.417 341.986 112.196C346.776 112.975 350.901 116.007 353.074 120.348L365.929 146.064L391.643 158.905C395.991 161.075 399.026 165.205 399.804 170.001C400.583 174.797 399.008 179.674 395.571 183.108L350.248 228.433C347.415 231.266 343.573 232.859 339.567 232.859H300.499L259.603 273.758C255.766 277.466 250.257 278.873 245.113 277.461C239.969 276.053 235.947 272.031 234.539 266.886C233.127 261.742 234.534 256.233 238.241 252.396L279.139 211.497ZM309.352 178.681V202.644H333.314L359.389 176.567L347.907 170.826C344.991 169.361 342.629 166.991 341.169 164.072L335.428 152.604L309.352 178.681Z" fill="#2B6EFD"/><path d="M248.5 127C253.918 127 258.925 129.892 261.635 134.584C264.344 139.277 264.344 145.058 261.635 149.75C258.925 154.443 253.918 157.334 248.5 157.334C220.342 157.334 193.339 168.519 173.431 188.431C153.519 208.34 142.334 235.343 142.334 263.5C142.334 291.657 153.519 318.661 173.431 338.569C193.34 358.481 220.343 369.666 248.5 369.666C276.657 369.666 303.661 358.481 323.569 338.569C343.481 318.66 354.665 291.657 354.665 263.5C354.665 258.082 357.558 253.075 362.25 250.365C366.942 247.656 372.723 247.656 377.416 250.365C382.108 253.075 385 258.082 385 263.5C385 299.702 370.619 334.422 345.019 360.019C319.42 385.619 284.701 400 248.5 400C212.299 400 177.578 385.619 151.981 360.019C126.381 334.42 112 299.701 112 263.5C112 227.299 126.381 192.578 151.981 166.981C177.58 141.381 212.299 127 248.5 127ZM248.5 187.666C253.918 187.666 258.925 190.558 261.635 195.251C264.344 199.943 264.344 205.724 261.635 210.417C258.925 215.109 253.918 218.001 248.5 218.001C236.432 218.001 224.859 222.795 216.327 231.329C207.793 239.86 203 251.433 203 263.501C203 275.569 207.793 287.143 216.327 295.674C224.859 304.208 236.432 309.002 248.5 309.002C260.568 309.002 272.141 304.208 280.673 295.674C289.207 287.143 294 275.569 294 263.501C294 258.083 296.892 253.076 301.585 250.367C306.277 247.657 312.058 247.657 316.751 250.367C321.443 253.076 324.335 258.083 324.335 263.501C324.335 283.613 316.344 302.903 302.123 317.124C287.901 331.346 268.612 339.336 248.5 339.336C228.388 339.336 209.099 331.346 194.877 317.124C180.656 302.903 172.665 283.613 172.665 263.501C172.665 243.389 180.656 224.1 194.877 209.878C209.099 195.657 228.388 187.666 248.5 187.666Z" fill="#FF4400"/></svg>';
    }

    /// *********************
    /// ***** MODIFIERS *****
    /// *********************

    /**
     * @dev This modifier reverts if the caller does not have a profile.
     */
    modifier onlyWithProfile() {
        if (IERC721Upgradeable(_profileAddress).balanceOf(msg.sender) == 0)
            revert Errors.ProfileNotExists();
        _;
    }

    /**
     * @dev This modifier reverts if the goal does not exist.
     */
    modifier whenExists(uint tokenId) {
        if (!_exists(tokenId)) revert Errors.TokenDoesNotExist();
        _;
    }

    /**
     * @dev This modifier reverts if the goal is closed.
     */
    modifier wnehNotClosed(uint tokenId) {
        if (_params[tokenId].isClosed) revert Errors.GoalClosed();
        _;
    }

    /**
     * @dev This modifier reverts if the caller is not the goal author.
     */
    modifier onlyAuthor(uint tokenId) {
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

    function setTreasuryAddress(address treasuryAddress) public onlyOwner {
        _treasuryAddress = treasuryAddress;
    }

    function setImageSVG(string memory imageSVG) public onlyOwner {
        _imageSVG = imageSVG;
    }

    /// **************************
    /// ***** USER FUNCTIONS *****
    /// **************************

    /**
     * @notice Set a goal with specified params.
     *
     * @param description Description for the goal.
     * @param stake Stake for the goal.
     * @param deadlineTimestamp Deadline for the goal.
     * @param extraDataURI URI with the goal extra data.
     */
    function set(
        string memory description,
        uint stake,
        uint deadlineTimestamp,
        string memory extraDataURI
    ) public payable whenNotPaused onlyWithProfile returns (uint) {
        // Check data
        if (msg.value != stake) revert Errors.MessageValueMismatch();
        if (stake <= 0) revert Errors.StakeInvalid();
        if (deadlineTimestamp < block.timestamp + Constants.SECONDS_PER_DAY)
            revert Errors.DeadlineMustBeAtLeast24HoursLater();
        // Update counter
        _counter.increment();
        // Mint token
        uint newTokenId = _counter.current();
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

    /**
     * @notice Post a proof for the goal.
     *
     * @param tokenId ID of the goal.
     * @param extraDataURI URI with the proof extra data.
     */
    function postProof(
        uint tokenId,
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

    /**
     * @notice Post a message for the goal.
     *
     * @param tokenId ID of the goal.
     * @param extraDataURI URI with the message extra data.
     */
    function postMessage(
        uint tokenId,
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

    /**
     * @notice Evaluate the message of the goal.
     *
     * @param tokenId ID of the goal.
     * @param messageId ID of the message.
     * @param isMotivating Boolean value that defines whether the message is motivating or not.
     * @param isSuperMotivating Boolean value that defines whether the message is super motivating or not.
     */
    function evaluateMessage(
        uint tokenId,
        uint messageId,
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

    /**
     * @notice Close the goal as successfull of failed depending on the goal state.
     *
     * @param tokenId ID of the goal.
     */
    function close(
        uint tokenId
    )
        public
        whenNotPaused
        whenExists(tokenId)
        wnehNotClosed(tokenId)
        nonReentrant
    {
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

    function getTreasuryAddress() public view returns (address) {
        return _treasuryAddress;
    }

    function getImageSVG() public view returns (string memory) {
        return _imageSVG;
    }

    function getCurrentCounter() public view returns (uint) {
        return _counter.current();
    }

    function getParams(
        uint tokenId
    ) public view returns (DataTypes.IndieGoalParams memory) {
        return _params[tokenId];
    }

    function getProofs(
        uint tokenId
    ) public view returns (DataTypes.IndieGoalProof[] memory) {
        return _proofs[tokenId];
    }

    function getMotivators(
        uint tokenId
    ) public view returns (DataTypes.IndieGoalMotivator[] memory) {
        return _motivators[tokenId];
    }

    function getMessages(
        uint tokenId
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
        uint tokenId
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

    function _addMotivator(uint tokenId, address accountAddress) internal {
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
        uint tokenId,
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
        uint tokenId
    ) internal onlyAuthor(tokenId) {
        // Check data
        if (_proofs[tokenId].length == 0) revert Errors.ProofsNotFound();
        // Update token
        _params[tokenId].isClosed = true;
        _params[tokenId].isAchieved = true;
        emit ClosedAsAchieved(tokenId, _params[tokenId]);
        // Send stake to author
        (bool sent, ) = _params[tokenId].authorAddress.call{
            value: _params[tokenId].authorStake
        }("");
        if (!sent) revert Errors.SendingStakeToAuthorFailed();
    }

    function _closeAsFailedAfterDeadline(uint tokenId) internal {
        // Update token
        _params[tokenId].isClosed = true;
        _params[tokenId].isAchieved = false;
        emit ClosedAsFailed(tokenId, _params[tokenId]);
        // Send stake to treasury
        (bool sent, ) = _treasuryAddress.call{
            value: _params[tokenId].authorStake
        }("");
        if (!sent) revert Errors.SendingStakeToTreasuryFailed();
    }

    /**
     * @dev A function that is called before any token transfer.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint firstTokenId,
        uint batchSize
    ) internal virtual override(ERC721Upgradeable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        // Disable transfers except minting
        if (from != address(0)) revert Errors.TokenNotTransferable();
    }
}
