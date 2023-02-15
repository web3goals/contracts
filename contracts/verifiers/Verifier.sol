// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IVerifier.sol";

/**
 * Contract to verify a goal that shoul be extended.
 */
contract Verifier is IVerifier, Ownable {
    address internal _hubAddress;
    mapping(uint256 => bool) internal _goalsVerifiedAsAchieved;
    mapping(uint256 => bool) internal _goalsVerifiedAsFailed;

    constructor(address hubAddress) {
        _hubAddress = hubAddress;
    }

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
}
