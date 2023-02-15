// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./Verifier.sol";
import "../libraries/Strings.sol";
import "../interfaces/IHub.sol";
import "../interfaces/IGoal.sol";
import "../libraries/Errors.sol";

/**
 * Contract to verify a goal by any proof uri.
 */
contract AnyProofURIVerifier is Verifier {
    string _anyProofUriKey = "ANY_PROOF_URI";

    constructor(address hubAddress) Verifier(hubAddress) {}

    function verify(uint256 goalTokenId) public override {
        // Check sender
        require(
            msg.sender == IHub(_hubAddress).getGoalAddress(),
            Errors.SENDER_IS_NOT_GOAL_CONTRACT
        );
        // Check verification data
        string memory anyProofUri = IGoal(IHub(_hubAddress).getGoalAddress())
            .getVerificationData(goalTokenId, _anyProofUriKey);
        require(
            !Strings.equal(anyProofUri, ""),
            Errors.GOAL_DOES_NOT_HAVE_ANY_PROOF_URI
        );
        // Update verification status
        _goalsVerifiedAsAchieved[goalTokenId] = true;
        _goalsVerifiedAsFailed[goalTokenId] = true;
    }
}
