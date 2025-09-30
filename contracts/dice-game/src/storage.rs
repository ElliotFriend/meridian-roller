use crate::types::{DataKey, Error};
use soroban_sdk::{panic_with_error, Env};

/// Return whether or not the instance storage contains a winner's address.
pub fn is_winner(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Winner)
}

/// Panic if a winning roll has already occurred.
pub fn check_no_winner(env: &Env) {
    if is_winner(env) {
        panic_with_error!(env, Error::WinnerFound);
    }
}

/// Returns whether or not the instance storage contains the everyone wins key.
pub fn does_everyone_win(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::EveryoneWins)
}

/// Panic if the game has not been "called" by the admin.
pub fn check_everyone_does_win(env: &Env) {
    if !does_everyone_win(env) {
        panic_with_error!(env, Error::NotCalled);
    }
}

/// Panic if the game has been "called" by the admin.
pub fn check_everyone_does_not_win(env: &Env) {
    if does_everyone_win(env) {
        panic_with_error!(env, Error::AlreadyCalled);
    }
}
