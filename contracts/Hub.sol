// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IHub.sol";

/**
 * Contract to store addresses of other contracts.
 */
contract Hub is IHub, OwnableUpgradeable {
    address private _goalAddress;
    address private _usageAddress;
    address private _bioAddress;

    function initialize(
        address goalAddress,
        address usageAddress,
        address bioAddress
    ) public initializer {
        __Ownable_init();
        _goalAddress = goalAddress;
        _usageAddress = usageAddress;
        _bioAddress = bioAddress;
    }

    function getGoalAddress() public view returns (address) {
        return _goalAddress;
    }

    function setGoalAddress(address goalAddress) public onlyOwner {
        _goalAddress = goalAddress;
    }

    function getUsageAddress() public view returns (address) {
        return _usageAddress;
    }

    function setUsageAddress(address usageAddress) public onlyOwner {
        _usageAddress = usageAddress;
    }

    function getBioAddress() public view returns (address) {
        return _bioAddress;
    }

    function setBioAddress(address bioAddress) public onlyOwner {
        _bioAddress = bioAddress;
    }
}
