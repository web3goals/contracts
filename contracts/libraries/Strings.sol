// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

/**
 * @title Strings
 * @author Web3 Goals
 * @notice A standard library of help functions for string values used by the contracts.
 */
library Strings {
    /**
     * @dev A function that returns true if the two strings are equal.
     * @dev Source - https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Strings.sol.
     */
    function equal(
        string memory a,
        string memory b
    ) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}
