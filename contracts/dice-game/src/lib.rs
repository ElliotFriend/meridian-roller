#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, token, vec, xdr::ToXdr,
    Address, Bytes, Env, Vec,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TokenAddress,
    Winner,
    Roller(Address),
    EveryoneWins,
    NumFaces,
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

fn roll_dice(env: &Env, num_faces: &u32) -> Vec<u32> {
    let mut rolls = Vec::new(&env);

    // Iterate through the number of dice, generating a random number within
    // the specified range
    for _i in 1..=3 {
        let rolled_value: u64 = env.prng().gen_range(1..=(*num_faces as u64));
        rolls.push_back(rolled_value as u32);
    }

    return rolls;
}

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn init(
        env: Env,
        admin: Address,
        token_address: Address,
        num_faces: u32,
    ) -> Result<(), Error> {
        if check_initialized(&env) {
            panic_with_error!(env, Error::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenAddress, &token_address);
        env.storage().instance().set(&DataKey::NumFaces, &num_faces);
        Ok(())
    }

    pub fn roll(env: Env, roller: Address) -> Result<Vec<u32>, Error> {
        if !check_initialized(&env) {
            panic_with_error!(env, Error::NotInitialized);
        }

        let num_faces: u32 = env.storage().instance().get(&DataKey::NumFaces).unwrap();
        let jackpot = num_faces * 3;

        if env.storage().instance().has(&DataKey::EveryoneWins) {
            return Ok(vec![&env, num_faces, num_faces, num_faces]);
        }

        check_if_winner(&env);
        roller.require_auth();

        let rolls: Vec<u32>;
        let total: u32;

        // check if user's first roll, if so, deposit from native SAC into the contract
        if !env
            .storage()
            .persistent()
            .has(&DataKey::Roller(roller.clone()))
        {
            let address_bytes = roller.clone().to_xdr(&env);
            let address_bytes = address_bytes.slice(address_bytes.len() - 32..);

            let mut slice = [0u8; 32];
            address_bytes.copy_into_slice(&mut slice);

            let seed = Bytes::from_array(&env, &slice);
            env.prng().seed(seed);

            rolls = roll_dice(&env, &num_faces);
            total = rolls.iter().sum();

            token::TokenClient::new(
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
        } else {
            rolls = roll_dice(&env, &num_faces);
            total = rolls.iter().sum();
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

        if total == jackpot {
            env.storage().instance().set(&DataKey::Winner, &roller);

            let token_client = token::TokenClient::new(
                &env,
                &env.storage()
                    .instance()
                    .get(&DataKey::TokenAddress)
                    .unwrap(),
            );

            let contract_address = env.current_contract_address();
            let contract_balance = token_client.balance(&contract_address);

            token_client.transfer(&contract_address, &roller, &contract_balance);
        }

        Ok(rolls)
    }

    pub fn call_it(env: Env) -> Result<(), Error> {
        if !check_initialized(&env) {
            panic_with_error!(env, Error::NotInitialized);
        }
        check_if_winner(&env);

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
