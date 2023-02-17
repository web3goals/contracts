// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

library Errors {
    // Common
    string internal constant TOKEN_DOES_NOT_EXIST = "Token does not exist";
    string internal constant TOKEN_IS_NON_TRANSFERABLE =
        "Token is non-transferable";
    string internal constant ARRAYS_MUST_HAVE_THE_SAME_LENGTH =
        "Arrays must have the same length";
    string internal constant UNABLE_TO_TRANSFER = "Unable to transfer";

    // Goal contract
    string internal constant STAKE_MUST_BE_EQUAL_TO_MESSAGE_VALUE =
        "Stake must equal to message value";
    string internal constant STAKE_MUST_BE_GREATER_THAN_ZERO =
        "Stake must be greater than zero";
    string
        internal constant MUST_BE_MORE_THAN_24_HOURS_BEFORE_DEADLINE_TIMESTAMP =
        "Must be more than 24 hours before deadline timestamp";
    string
        internal constant NOT_FOUND_VERIFIER_FOR_GOAL_VERIFICATION_REQUIREMENT =
        "Not found verifier for goal verification requirement";
    string internal constant GOAL_IS_CLOSED = "Goal is closed";
    string internal constant GOAL_AUTHOR_CAN_NOT_BE_A_WATCHER =
        "Goal author can not be a watcher";
    string internal constant SENDER_IS_ALREADY_WATCHER =
        "Sender is already watcher";
    string internal constant SENDER_IS_NOT_GOAL_AUTHOR =
        "Sender is not goal author";
    string internal constant GOAL_VERIFICATION_STATUS_IS_NOT_ACHIEVED =
        "Goal verification status is not achieved";
    string internal constant WATCHER_IS_NOT_FOUND = "Watcher is not found";
    string internal constant WATCHER_IS_ALREADY_ACCEPTED =
        "Watcher is already accepted";
    string internal constant FAIL_TO_RETURN_AUTHOR_STAKE =
        "Fail to return author stake";
    string internal constant FAIL_TO_SEND_PART_OF_STAKE_TO_WATCHER =
        "Fail send a part of stake to watcher";

    // Verifier contracts
    string internal constant SENDER_IS_NOT_GOAL_CONTRACT =
        "Sender is not goal contract";
    string internal constant GOAL_DOES_NOT_HAVE_ANY_PROOF =
        "Goal does not have any proof";
    string
        internal constant GOAL_DOES_NOT_HAVE_GITHUB_USERNAME_OR_ACTIVITY_DAYS =
        "Goal does not have github username or activity days";
}
