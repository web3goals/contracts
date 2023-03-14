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

    struct GoalMotivator {
        uint addedTimestamp;
        address accountAddress;
        bool isAccepted;
        string extraDataURI;
    }

    struct GoalAccountReputation {
        uint achievedGoals;
        uint failedGoals;
        uint motivatedGoals;
        uint notMotivatedGoals;
    }

    struct GoalMessage {
        uint addedTimestamp;
        address authorAddress;
        string extraDataURI;
    }
}
