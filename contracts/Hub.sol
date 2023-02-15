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
    address private _usageAddress;
    address private _bioAddress;
    mapping(string => address) _verifierAddresses; // Key is a goal verification requirement

    function initialize(
        address goalAddress,
        address usageAddress,
        address bioAddress,
        string[] memory verifierVerificationRequirement,
        address[] memory verifierAddresses
    ) public initializer {
        // Base checks
        require(
            verifierVerificationRequirement.length == verifierAddresses.length,
            Errors.ARRAYS_MUST_HAVE_THE_SAME_LENGTH
        );
        // Init
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
