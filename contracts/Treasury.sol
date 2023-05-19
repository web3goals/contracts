// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * A contract that holds funds received from other contracts.
 */
contract Treasury is OwnableUpgradeable {
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
