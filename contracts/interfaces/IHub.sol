// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface IHub {
    function getGoalAddress() external view returns (address);

    function getUsageAddress() external view returns (address);

    function getBioAddress() external view returns (address);

    function getVerifierAddress(
        string memory verifierName
    ) external view returns (address);
}
