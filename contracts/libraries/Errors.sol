// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

library Errors {
    // Common errors
    error TokenDoesNotExist();
    error TokenNotTransferable();

    // Goal errors
    error ProfileNotExists();
    error MessageValueMismatch();
    error StakeInvalid();
    error DeadlineMustBeAtLeast24HoursLater();
    error GoalClosed();
    error NotAuthor();
    error ProofsNotFound();
    error MessageNotExists();
    error EvaluationIncorrect();
    error AuthorCannotEvaluateOwnMessage();
    error MessageAlreadyEvaluated();
    error SendingStakeToAuthorFailed();
    error SendingStakeToKeeperFailed();
    error SendingStakeToMotivatorFailed();
}
