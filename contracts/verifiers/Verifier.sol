// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IVerifier.sol";
import "../interfaces/IHub.sol";
import "../libraries/Errors.sol";

/**
 * Contract to verify a goal that shoul be extended.
 */
abstract contract Verifier is IVerifier, Ownable {
    address internal _hubAddress;
    mapping(address => mapping(uint256 => bool))
        private _goalsVerifiedAsAchieved; // Key is goal contract address
    mapping(address => mapping(uint256 => bool)) private _goalsVerifiedAsFailed; // Key is goal contract address

    event GoalVerifiedAsAchieved(uint256 indexed goalTokenId);
    event GoalVerifiedAsFailed(uint256 indexed goalTokenId);
    event GoalVerifiedAsNotAchievedYet(uint256 indexed goalTokenId);

    constructor(address hubAddress) {
        _hubAddress = hubAddress;
    }

    /// ****************************
    /// ***** PUBLIC FUNCTIONS *****
    /// ****************************

    function verify(uint256 goalTokenId) public virtual;

    function getVerificationStatus(
        uint256 goalTokenId
    ) public view returns (bool isAchieved, bool isFailed) {
        return (
            _goalsVerifiedAsAchieved[_getGoalAddress()][goalTokenId],
            _goalsVerifiedAsFailed[_getGoalAddress()][goalTokenId]
        );
    }

    function getHubAddress() public view returns (address) {
        return _hubAddress;
    }

    function setHubAddress(address hubAddress) public onlyOwner {
        _hubAddress = hubAddress;
    }

    /// ******************************
    /// ***** INTERNAL FUNCTIONS *****
    /// ******************************

    function _setGoalVerifiedAsAchieved(uint256 goalTokenId) internal {
        _validateGoalIsNotVerified(goalTokenId);
        _goalsVerifiedAsAchieved[_getGoalAddress()][goalTokenId] = true;
        emit GoalVerifiedAsAchieved(goalTokenId);
    }

    function _setGoalVerifiedAsFailed(uint256 goalTokenId) internal {
        _validateGoalIsNotVerified(goalTokenId);
        _goalsVerifiedAsFailed[_getGoalAddress()][goalTokenId] = true;
        emit GoalVerifiedAsFailed(goalTokenId);
    }

    function _setGoalVerifiedAsNotAchievedYet(uint256 goalTokenId) internal {
        emit GoalVerifiedAsNotAchievedYet(goalTokenId);
    }

    function _validateSenderIsGoalContract() internal view {
        if (msg.sender != _getGoalAddress()) revert Errors.NotGoalContract();
    }

    function _validateGoalIsNotVerified(uint256 goalTokenId) internal view {
        if (
            _goalsVerifiedAsAchieved[_getGoalAddress()][goalTokenId] ||
            _goalsVerifiedAsFailed[_getGoalAddress()][goalTokenId]
        ) revert Errors.GoalAlreadyVerified();
    }

    function _getGoalAddress() internal view returns (address goalAddress) {
        return IHub(_hubAddress).getGoalAddress();
    }
}
