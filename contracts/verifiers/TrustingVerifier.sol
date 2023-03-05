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
contract TrustingVerifier is Verifier {
    string _anyProofURIKey = "ANY_PROOF_URI";

    constructor(address hubAddress) Verifier(hubAddress) {}

    function verify(uint256 goalTokenId) public override {
        // Check sender
        if (msg.sender != IHub(_hubAddress).getGoalAddress())
            revert Errors.NotGoalContract();
        // Check verification data
        string memory proofURI = IGoal(IHub(_hubAddress).getGoalAddress())
            .getVerificationData(goalTokenId, _anyProofURIKey);
        if (Strings.equal(proofURI, "")) revert Errors.AnyProofURINotExists();
        // Update verification status
        _goalsVerifiedAsAchieved[goalTokenId] = true;
    }
}
