// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

library Errors {
    // Common
    string internal constant TOKEN_DOES_NOT_EXIST = "Token does not exist";
    string internal constant TOKEN_IS_NON_TRANSFERABLE =
        "Token is non-transferable";

    // Goal contract
    string internal constant FEE_MUST_BE_EQUAL_TO_MESSAGE_VALUE =
        "Fee must equal to message value";
    string internal constant FEE_MUST_BE_GREATER_THAN_ZERO =
        "Fee must be greater than zero";
    string
        internal constant MUST_BE_MORE_THAN_24_HOURS_BEFORE_DEADLINE_TIMESTAMP =
        "Must be more than 24 hours before deadline timestamp";
    string internal constant GOAL_IS_CLOSED = "Goal is closed";
    string internal constant SENDER_IS_ALREADY_WATCHER =
        "Sender is already watcher";
}
