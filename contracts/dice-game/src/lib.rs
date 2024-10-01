#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, token, vec, Address,
    Env, Vec,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TokenAddress,
    Winner,
    Roller(Address),
    EveryoneWins,
}

#[contracttype]
#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct Roller {
    pub times_rolled: u32,
    pub high_roll: u32,
    pub ledger_number: u32,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    WinnerFound = 1,        // A winner has already been found.
    NotInitialized = 2,     // Contract has not been initialized yet.
    AlreadyInitialized = 3, // Contract has already been initialized yet.
}

fn check_if_winner(env: &Env) {
    if env.storage().instance().has(&DataKey::Winner) {
        panic_with_error!(env, Error::WinnerFound);
    }
}

fn check_initialized(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn init(env: Env, admin: Address, token_address: Address) -> Result<(), Error> {
        if check_initialized(&env) {
            panic_with_error!(env, Error::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenAddress, &token_address);
        Ok(())
    }

    pub fn roll(env: Env, roller: Address) -> Result<Vec<u32>, Error> {
        if !check_initialized(&env) {
            panic_with_error!(env, Error::NotInitialized);
        }

        if env.storage().instance().has(&DataKey::EveryoneWins) {
            return Ok(vec![&env, 6, 6, 6]);
        }

        check_if_winner(&env);
        roller.require_auth();

        let mut rolls = Vec::new(&env);
        let mut total = 0u32;

        // Iterate through the number of dice, generating a random number within
        // the specified range
        for _i in 1..=3 {
            let rolled_value: u64 = env.prng().gen_range(1..=6);
            rolls.push_back(rolled_value as u32);
            total += rolled_value as u32;
        }

        // check if user's first roll, if so, deposit from native SAC into the contract
        if !env
            .storage()
            .persistent()
            .has(&DataKey::Roller(roller.clone()))
        {
            token::Client::new(
                &env,
                &env.storage()
                    .instance()
                    .get(&DataKey::TokenAddress)
                    .unwrap(),
            )
            .transfer(
                &roller,
                &env.current_contract_address(),
                &((total * 10_000_000) as i128),
            );
        }

        let mut roller_store: Roller = env
            .storage()
            .persistent()
            .get(&DataKey::Roller(roller.clone()))
            .unwrap_or_default();
        roller_store.ledger_number = env.ledger().sequence();
        roller_store.times_rolled += 1;
        roller_store.high_roll = if total > roller_store.high_roll {
            total
        } else {
            roller_store.high_roll
        };

        env.storage()
            .persistent()
            .set(&DataKey::Roller(roller.clone()), &roller_store);

        // if not the first roll, just return the number
        // if they're the winner:
        // - send ALL the lumens to them
        // - brick the contract
        Ok(rolls)
    }

    pub fn call_it(env: Env) -> Result<(), Error> {
        check_if_winner(&env);
        if !check_initialized(&env) {
            panic_with_error!(env, Error::NotInitialized);
        }

        env.storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::Admin)
            .unwrap()
            .require_auth();
        env.storage().instance().set(&DataKey::EveryoneWins, &true);

        Ok(())
    }
}

mod test;