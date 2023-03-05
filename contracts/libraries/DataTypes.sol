// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

library DataTypes {
    struct GoalParams {
        uint createdTimestamp;
        string description;
        address authorAddress;
        uint authorStake;
        uint deadlineTimestamp;
        bool isClosed;
        bool isAchieved;
        string verificationRequirement;
    }

    struct GoalWatcher {
        uint addedTimestamp;
        address accountAddress;
        bool isAccepted;
        string extraDataURI;
    }

    struct AccountReputation {
        uint achievedGoals;
        uint failedGoals;
        uint motivatedGoals;
    }
}
