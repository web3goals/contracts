// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

interface IHub {
    function getGoalAddress() external view returns (address);

    function getKeeperAddress() external view returns (address);

    function getProfileAddress() external view returns (address);

    function getVerifierAddress(
        string memory verifierName
    ) external view returns (address);
}
