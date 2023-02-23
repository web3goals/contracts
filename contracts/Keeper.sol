// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * Contract to receive usage fee from the goal contract.
 */
contract Keeper is OwnableUpgradeable {
    event Received(address sender, uint value);

    function initialize() public initializer {
        __Ownable_init();
    }

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
