// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "./Verifier.sol";
import "../libraries/Strings.sol";
import "../interfaces/IGoal.sol";
import "../libraries/Errors.sol";

/**
 * Contract to verify a goal by github activity using chainlink oracle.
 */
contract GitHubActivityVerifier is Verifier, ChainlinkClient {
    using Chainlink for Chainlink.Request;

    bytes32 private _jobId;
    uint256 private _fee;
    mapping(bytes32 => uint256) private _requestGoals;
    string private _gitHubUsernameKey = "GITHUB_USERNAME";
    string private _gitHubActivityDaysKey = "GITHUB_ACTIVITY_DAYS";

    constructor(
        address hubAddress,
        address chainlinkTokenAddress,
        address chainlinkOracleAddress,
        string memory chainlinkJobId
    ) Verifier(hubAddress) {
        setChainlinkToken(chainlinkTokenAddress);
        setChainlinkOracle(chainlinkOracleAddress);
        _jobId = bytes32(bytes(chainlinkJobId));
        _fee = (1 * LINK_DIVISIBILITY) / 10; // 0.1 * 10**18 (Varies by network and job)
    }

    function verify(uint256 goalTokenId) public override {
        // Validations
        _validateSenderIsGoalContract();
        // Check verification data
        IGoal goalContract = IGoal(_getGoalAddress());
        string memory gitHubUsername = goalContract.getVerificationData(
            goalTokenId,
            _gitHubUsernameKey
        );
        string memory gitHubActivityDays = goalContract.getVerificationData(
            goalTokenId,
            _gitHubActivityDaysKey
        );
        if (
            Strings.equal(gitHubUsername, "") ||
            Strings.equal(gitHubActivityDays, "")
        ) revert Errors.GitHubUsernameOrActivityDaysNotExist();
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
        if (isSuccess) {
            _setGoalVerifiedAsAchieved(_requestGoals[requestId]);
        } else {
            _setGoalVerifiedAsNotAchievedYet(_requestGoals[requestId]);
        }
    }

    /**
     * Allow withdraw of chainlink tokens from the contract.
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        if (!link.transfer(msg.sender, link.balanceOf(address(this))))
            revert Errors.UnableTransfer();
    }
}
