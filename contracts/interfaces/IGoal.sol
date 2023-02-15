// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface IGoal {
    function getVerificationData(
        uint256 tokenId,
        string memory key
    ) external view returns (string memory);
}
