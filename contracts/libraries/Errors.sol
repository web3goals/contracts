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
    error AuthorCannotBeMotivator();
    error AlreadyMotivator();
    error NotAuthor();
    error NotAuthorNotAcceptedMotivator();
    error ProofsNotFound();
    error MotivatorNotFound();
    error AlreadyAccepted();
    error SendingStakeToAuthorFailed();
    error SendingStakeToKeeperFailed();
    error SendingStakeToMotivatorFailed();
}
