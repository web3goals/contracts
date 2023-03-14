// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IVerifier.sol";

/**
 * Contract to verify a goal that shoul be extended.
 */
contract Verifier is IVerifier, Ownable {
    address internal _hubAddress;
    mapping(uint256 => bool) private _goalsVerifiedAsAchieved;
    mapping(uint256 => bool) private _goalsVerifiedAsFailed;

    event GoalVerifiedAsAchieved(uint256 indexed goalTokenId);
    event GoalVerifiedAsFailed(uint256 indexed goalTokenId);
    event GoalVerifiedAsNotAchievedYet(uint256 indexed goalTokenId);

    constructor(address hubAddress) {
        _hubAddress = hubAddress;
    }

    /// ****************************
    /// ***** PUBLIC FUNCTIONS *****
    /// ****************************

    function verify(uint256 goalTokenId) public virtual {}

    function getVerificationStatus(
        uint256 goalTokenId
    ) public view returns (bool isAchieved, bool isFailed) {
        return (
            _goalsVerifiedAsAchieved[goalTokenId],
            _goalsVerifiedAsFailed[goalTokenId]
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
        _goalsVerifiedAsAchieved[goalTokenId] = true;
        emit GoalVerifiedAsAchieved(goalTokenId);
    }

    function _setGoalVerifiedAsFailed(uint256 goalTokenId) internal {
        _goalsVerifiedAsFailed[goalTokenId] = true;
        emit GoalVerifiedAsFailed(goalTokenId);
    }

    function _setGoalVerifiedAsNotAchievedYet(uint256 goalTokenId) internal {
        emit GoalVerifiedAsNotAchievedYet(goalTokenId);
    }
}
