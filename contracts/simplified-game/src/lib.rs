#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, vec, Address, Env, Vec};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Roller(Address),
}

#[contracttype]
#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct Roller {
    pub times_rolled: u32,
    pub high_roll: u32,
    pub ledger_number: u32,
}

#[contract]
pub struct D20Contract;

#[contractimpl]
impl D20Contract {
    pub fn roll(env: Env, roller: Address) -> Vec<u32> {
        roller.require_auth();

        let num_faces: u32 = 20;
        let mut rolls: Vec<u32> = vec![&env];

        for _i in 1..=2 {
            let rolled_value: u64 = env.prng().gen_range(1..=num_faces as u64);
            rolls.push_back(rolled_value as u32);
        }

        let total = rolls.iter().sum();

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

        return rolls;
    }
}
