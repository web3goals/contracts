// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IHub.sol";
import "./libraries/Errors.sol";

/**
 * Contract to store addresses of other contracts.
 */
contract Hub is IHub, OwnableUpgradeable {
    address private _goalAddress;
    address private _keeperAddress;
    address private _profileAddress;
    mapping(string => address) _verifierAddresses; // Key is a goal verification requirement

    function initialize(
        address goalAddress,
        address keeperAddress,
        address profileAddress,
        string[] memory verifierVerificationRequirement,
        address[] memory verifierAddresses
    ) public initializer {
        if (verifierVerificationRequirement.length != verifierAddresses.length)
            revert Errors.ArraysLengthInvalid();
        __Ownable_init();
        _goalAddress = goalAddress;
        _keeperAddress = keeperAddress;
        _profileAddress = profileAddress;
    }

    function getGoalAddress() public view returns (address) {
        return _goalAddress;
    }

    function setGoalAddress(address goalAddress) public onlyOwner {
        _goalAddress = goalAddress;
    }

    function getKeeperAddress() public view returns (address) {
        return _keeperAddress;
    }

    function setKeeperAddress(address keeperAddress) public onlyOwner {
        _keeperAddress = keeperAddress;
    }

    function getProfileAddress() public view returns (address) {
        return _profileAddress;
    }

    function setProfileAddress(address profileAddress) public onlyOwner {
        _profileAddress = profileAddress;
    }

    function getVerifierAddress(
        string memory verificationRequirement
    ) public view returns (address) {
        return _verifierAddresses[verificationRequirement];
    }

    function setVerifierAddress(
        string memory verificationRequirement,
        address verifierAddress
    ) public onlyOwner {
        _verifierAddresses[verificationRequirement] = verifierAddress;
    }
}
