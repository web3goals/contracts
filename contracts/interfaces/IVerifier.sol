// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface IVerifier {
    function verify(uint256 goalTokenId) external;

    function getVerificationStatus(
        uint256 goalTokenId
    ) external view returns (bool isAchieved, bool isFailed);
}
