// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./libraries/DataTypes.sol";
import "./libraries/Errors.sol";
import "./libraries/Constants.sol";

/**
 * Contract to set, close goals and become a goals watcher.
 */
contract Goal is
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable
{
    using Counters for Counters.Counter;

    event ParamsSet(uint256 indexed tokenId, DataTypes.GoalParams params);
    event WatcherSet(
        uint256 indexed tokenId,
        address indexed watcherAccountAddress,
        DataTypes.GoalWatcher watcher
    );
    event URISet(uint256 indexed tokenId, string tokenURI);
    event ClosedAsAchieved(uint256 indexed tokenId);

    address private _hubAddress;
    uint private _usageFeePercent;
    Counters.Counter private _counter;
    mapping(uint256 => DataTypes.GoalParams) private _params;
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
        uint deadlineTimestamp
    ) public payable returns (uint256) {
        // Checks
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
            ""
        );
        _params[newTokenId] = tokenParams;
        emit ParamsSet(newTokenId, tokenParams);
        // Set uri
        _setTokenURI(newTokenId, uri);
        emit URISet(newTokenId, uri);
        // Return
        return newTokenId;
    }

    function watch(uint256 tokenId, string memory extraDataURI) public {
        // Checks
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
        emit WatcherSet(tokenId, msg.sender, tokenWatcher);
    }

    function acceptWatcher(uint256 tokenId, address watcherAddress) public {
        // Checks
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
        emit WatcherSet(tokenId, msg.sender, watcher);
    }

    function closeAsAchieved(uint256 tokenId, string memory proofURI) public {
        // Checks
        _requireNotPaused();
        require(_exists(tokenId), Errors.TOKEN_DOES_NOT_EXIST);
        require(!_params[tokenId].isClosed, Errors.GOAL_IS_CLOSED);
        require(
            _params[tokenId].authorAddress == msg.sender,
            Errors.SENDER_IS_NOT_GOAL_AUTHOR
        );
        require(
            _params[tokenId].deadlineTimestamp > block.timestamp,
            Errors.GOAL_DEADLINE_HAS_PASSED
        );
        // Update params
        _params[tokenId].isClosed = true;
        _params[tokenId].isAchieved = true;
        _params[tokenId].proofURI = proofURI;
        // Emit events
        emit ParamsSet(tokenId, _params[tokenId]);
        emit ClosedAsAchieved(tokenId);
        // Return stake
        (bool sent, ) = _params[tokenId].authorAddress.call{
            value: _params[tokenId].authorStake
        }("");
        require(sent, Errors.FAIL_TO_RETURN_AUTHOR_STAKE);
    }

    // TODO: Implement
    function closeAsFailed() public {}

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

    function getWatchers(
        uint256 tokenId
    ) public view returns (DataTypes.GoalWatcher[] memory) {
        return _watchers[tokenId];
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
