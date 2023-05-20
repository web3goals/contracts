// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

/**
 * @title DataTypes
 * @author Web3 Goals
 * @notice A standard library of data types used by the contracts.
 */
library DataTypes {
    struct IndieGoalParams {
        uint createdTimestamp;
        string description;
        address authorAddress;
        uint authorStake;
        uint deadlineTimestamp;
        bool isClosed;
        bool isAchieved;
        string extraDataURI;
    }

    struct IndieGoalProof {
        uint addedTimestamp;
        string extraDataURI;
    }

    struct IndieGoalMotivator {
        address accountAddress;
        uint motivations;
        uint superMotivations;
    }

    struct IndieGoalMessage {
        uint addedTimestamp;
        address authorAddress;
        bool isMotivating;
        bool isSuperMotivating;
        string extraDataURI;
    }
}
