// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

library DataTypes {
    struct IndieGoalParams {
        uint createdTimestamp;
        string description;
        address authorAddress;
        uint authorStake;
        uint deadlineTimestamp;
        bool isClosed;
        bool isAchieved;
    }

    struct IndieGoalProof {
        uint addedTimestamp;
        string extraDataURI;
    }

    struct IndieGoalMotivator {
        uint addedTimestamp;
        address accountAddress;
        bool isAccepted;
        string extraDataURI;
    }

    struct IndieGoalMessage {
        uint addedTimestamp;
        address authorAddress;
        string extraDataURI;
    }

    struct IndieGoalAccountReputation {
        uint achievedGoals;
        uint failedGoals;
        uint motivatedGoals;
        uint notMotivatedGoals;
    }
}
