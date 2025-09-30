use soroban_sdk::{contracterror, contracttype, Address};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TokenAddress,
    Winner,
    Roller(Address),
    EveryoneWins,
    NumDice,
    NumFaces,
}

#[contracttype]
#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct Roller {
    pub times_rolled: u32,
    pub high_roll: u32,
    pub ledger_number: u32,
    pub first_roll: u32,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// A winner has already been found.
    WinnerFound = 1,
    /// You can't be evil. The game has not been called.
    NotCalled = 2,
    /// The game has already been called.
    AlreadyCalled = 3,
}
