// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

/**
 * String utils.
 */
library Strings {
    /**
     * Returns true if the two strings are equal.
     *
     * Source - https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Strings.sol
     */
    function equal(
        string memory a,
        string memory b
    ) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}
