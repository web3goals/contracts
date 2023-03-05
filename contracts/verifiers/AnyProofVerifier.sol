// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./Verifier.sol";
import "../libraries/Strings.sol";
import "../interfaces/IHub.sol";
import "../interfaces/IGoal.sol";
import "../libraries/Errors.sol";

/**
 * Contract that verify a goal with any existing proof uri as achieved.
 */
contract AnyProofVerifier is Verifier {
    string _proofURIKey = "PROOF_URI";

    constructor(address hubAddress) Verifier(hubAddress) {}

    function verify(uint256 goalTokenId) public override {
        // Check sender
        if (msg.sender != IHub(_hubAddress).getGoalAddress())
            revert Errors.NotGoalContract();
        // Check verification data
        string memory proofURI = IGoal(IHub(_hubAddress).getGoalAddress())
            .getVerificationData(goalTokenId, _proofURIKey);
        if (Strings.equal(proofURI, "")) revert Errors.ProofURINotExists();
        // Update verification status
        _goalsVerifiedAsAchieved[goalTokenId] = true;
    }
}
