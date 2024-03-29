// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./libraries/Errors.sol";

/**
 * @title Profile
 * @author Web3 Goals
 * @notice A contract that stores profiles.
 */
contract Profile is ERC721URIStorageUpgradeable, AccessControlUpgradeable {
    using Counters for Counters.Counter;

    /**
     * @dev Emitted when the URI for the profile is set.
     *
     * @param tokenId ID of the profile.
     * @param tokenURI URI of the profile.
     */
    event URISet(uint indexed tokenId, string tokenURI);

    bytes32 public constant EARLY_ADOPTER_ROLE =
        keccak256("EARLY_ADOPTER_ROLE");

    Counters.Counter private _counter;
    mapping(address => uint) private _owners;

    function initialize() public initializer {
        __ERC721_init("Web3 Goals - Profiles", "W3GP");
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// ***********************************
    /// ***** EARLY ADOPTER FUNCTIONS *****
    /// ***********************************

    /**
     * @notice Create or update a profile for the caller using the specified URI.
     *
     * @param tokenURI URI for the profile.
     */
    function setURI(
        string memory tokenURI
    ) public onlyRole(EARLY_ADOPTER_ROLE) {
        // Mint token if sender does not have it yet
        if (_owners[msg.sender] == 0) {
            // Update counter
            _counter.increment();
            // Mint token
            uint tokenId = _counter.current();
            _mint(msg.sender, tokenId);
            _owners[msg.sender] = tokenId;
            // Set URI
            _setURI(tokenId, tokenURI);
        }
        // Set URI if sender already have token
        else {
            _setURI(_owners[msg.sender], tokenURI);
        }
    }

    /// *********************************
    /// ***** PUBLIC VIEW FUNCTIONS *****
    /// *********************************

    function getTokenId(address owner) public view returns (uint) {
        return _owners[owner];
    }

    function getURI(address owner) public view returns (string memory) {
        uint tokenId = _owners[owner];
        if (_exists(tokenId)) {
            return tokenURI(tokenId);
        } else {
            return "";
        }
    }

    function getCurrentCounter() public view returns (uint) {
        return _counter.current();
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// ****************************************
    /// ***** PRIVATE & INTERNAL FUNCTIONS *****
    /// ****************************************

    function _setURI(uint tokenId, string memory tokenURI) private {
        _setTokenURI(tokenId, tokenURI);
        emit URISet(tokenId, tokenURI);
    }

    /**
     * @dev A function that is called before any token transfer.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint firstTokenId,
        uint batchSize
    ) internal virtual override(ERC721Upgradeable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
        // Disable transfers except minting
        if (from != address(0)) revert Errors.TokenNotTransferable();
    }
}
