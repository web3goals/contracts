// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "./Verifier.sol";
import "../libraries/Strings.sol";
import "../interfaces/IHub.sol";
import "../interfaces/IGoal.sol";
import "../libraries/Errors.sol";

/**
 * Contract to verify a goal by github activity.
 */
contract GitHubActivityVerifier is Verifier, ChainlinkClient {
    using Chainlink for Chainlink.Request;

    bytes32 private _jobId;
    uint256 private _fee;
    mapping(bytes32 => uint256) private _requestGoals;
    string _gitHubUsernameKey = "GITHUB_USERNAME";
    string _gitHubActivityDaysKey = "GITHUB_ACTIVITY_DAYS";

    event GoalVerified(
        bytes32 indexed requestId,
        uint256 indexed goalTokenId,
        bool isAchieved
    );

    constructor(
        address hubAddress,
        address chainlinkTokenAddress,
        address chainlinkOracleAddress,
        string memory jobId
    ) Verifier(hubAddress) {
        setChainlinkToken(chainlinkTokenAddress);
        setChainlinkOracle(chainlinkOracleAddress);
        _jobId = bytes32(bytes(jobId));
        _fee = (1 * LINK_DIVISIBILITY) / 10; // 0.1 * 10**18 (Varies by network and job)
    }

    function verify(uint256 goalTokenId) public override {
        // Check sender
        require(
            msg.sender == IHub(_hubAddress).getGoalAddress(),
            Errors.SENDER_IS_NOT_GOAL_CONTRACT
        );
        // Check verification data
        IGoal goalContract = IGoal(IHub(_hubAddress).getGoalAddress());
        string memory gitHubUsername = goalContract.getVerificationData(
            goalTokenId,
            _gitHubUsernameKey
        );
        string memory gitHubActivityDays = goalContract.getVerificationData(
            goalTokenId,
            _gitHubActivityDaysKey
        );
        require(
            !Strings.equal(gitHubUsername, "") ||
                !Strings.equal(gitHubActivityDays, ""),
            Errors.GOAL_DOES_NOT_HAVE_GITHUB_USERNAME_OR_ACTIVITY_DAYS
        );
        // Make chainlink request
        Chainlink.Request memory req = buildChainlinkRequest(
            _jobId,
            address(this),
            this.fulfill.selector
        );
        req.add(
            "get",
            string.concat(
                "https://web3goals.space/api/checker/github/activity/",
                gitHubUsername,
                "/",
                gitHubActivityDays
            )
        );
        req.add("path", "isSuccess");
        bytes32 requestId = sendChainlinkRequest(req, _fee);
        // Save chainlink request
        _requestGoals[requestId] = goalTokenId;
    }

    /**
     * Receive the response from chainlink.
     */
    function fulfill(
        bytes32 requestId,
        bool isSuccess
    ) public recordChainlinkFulfillment(requestId) {
        emit GoalVerified(requestId, _requestGoals[requestId], isSuccess);
        if (isSuccess) {
            _goalsVerifiedAsAchieved[_requestGoals[requestId]] = true;
        } else {
            _goalsVerifiedAsFailed[_requestGoals[requestId]] = true;
        }
    }

    /**
     * Allow withdraw of chainlink tokens from the contract.
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            Errors.UNABLE_TO_TRANSFER
        );
    }
}
