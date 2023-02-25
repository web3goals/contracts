// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

library Errors {
    // Common errors
    error TokenDoesNotExist();
    error TokenNotTransferable();
    error ArraysLengthInvalid();
    error UnableTransfer();

    // Goal errors
    error MessageValueMismatch();
    error StakeInvalid();
    error DeadlineMustBeAtLeast24HoursLater();
    error VerifierNotFound();
    error GoalClosed();
    error AuthorCannotBeWatcher();
    error AlreadyWatcher();
    error NotAuthor();
    error NotAchieved();
    error WatcherNotFound();
    error AlreadyAccepted();
    error SendingStakeToAuthorFailed();
    error SendingStakeToKeeperFailed();
    error SendingStakeToWatcherFailed();

    // Verifier errors
    error NotGoalContract();
    error AnyProofNotExists();
    error GitHubUsernameOrActivityDaysNotExist();
}
