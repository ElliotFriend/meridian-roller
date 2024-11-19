//! # Dice Roller Game
//!
//! A Soroban smart contract that simulates a dice-rolling game, where each player is attempting to
//! roll a "jackpot": all three dice at the highest value.
//!
//! On the first roll, a user will pay into the "prize pot" an amount of tokens
//! equal to their roll. On subsequent rolls no payment is made.
//!
//! If a user does roll a "jackpot," they are henceforth eligible to claim the
//! total sum of tokens in the "prize pot," by invoking the `claim_prize`
//! function of the contract.
//!
//! Admin logic exists to allow the user to "call" the game off, and

#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, symbol_short, token,
    vec, xdr::ToXdr, Address, Bytes, Env, Vec,
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
    PrizePot,
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
    WinnerFound = 1,        // A winner has already been found.
    NotInitialized = 2,     // Contract has not been initialized yet.
    AlreadyInitialized = 3, // Contract has already been initialized.
    NotCalled = 4,          // You can't be evil. The game has not been called.
    AlreadyCalled = 5,      // The game has already been called.
}

/// Panic if a winning roll has already occurred.
fn check_no_winner(env: &Env) {
    if is_winner(env) {
        panic_with_error!(env, Error::WinnerFound);
    }
}

/// Return whether or not the instance storage contains a winner's address.
fn is_winner(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Winner)
}

/// Panic if the game has not been initialized.
fn check_is_initialized(env: &Env) {
    if !is_initialized(env) {
        panic_with_error!(env, Error::NotInitialized);
    }
}

/// Panic if the game has not been initialized.
fn check_not_initialized(env: &Env) {
    if is_initialized(env) {
        panic_with_error!(env, Error::AlreadyInitialized);
    }
}

/// Return whether or not the instance storage contains an admin's address.
fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

/// Panic if the game has not been "called" by the admin.
fn check_everyone_does_win(env: &Env) {
    if !does_everyone_win(env) {
        panic_with_error!(env, Error::NotCalled);
    }
}

/// Panic if the game has been "called" by the admin.
fn check_everyone_does_not_win(env: &Env) {
    if does_everyone_win(env) {
        panic_with_error!(env, Error::AlreadyCalled);
    }
}

/// Returns whether or not the instance storage contains the everyone wins key.
fn does_everyone_win(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::EveryoneWins)
}

/// Returns a dice roll simulation
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
pub struct RollerContract;

#[contractimpl]
impl RollerContract {
    /// Initialize a new game contract.
    ///
    /// # Arguments
    ///
    /// * `admin` - address corresponding to the deployer of this game.
    /// * `token_address` - address for the asset contract that will be used for
    ///   payments to and from the prize pot.
    /// * `num_faces` - number of faces on each die that will be rolled during
    ///   the course of the game.
    ///
    /// # Panics
    ///
    /// * If the contract is already initialized
    ///
    /// # Events
    ///
    /// Emits an event with the topics `["ROLLER", "ready", admin: Address],
    /// data = num_faces: u32`
    pub fn init(
        env: Env,
        admin: Address,
        token_address: Address,
        num_faces: u32,
    ) -> Result<(), Error> {
        // Check for various contract states, where we don't want to proceed:
        check_not_initialized(&env); // already initialized game,

        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NumFaces, &num_faces);
        env.storage()
            .instance()
            .set(&DataKey::TokenAddress, &token_address);
        env.storage().instance().set(&DataKey::PrizePot, &0i128);

        // Publish an event about the game being ready
        // The event has three topics:
        //   - The "ROLLER" symbol
        //   - The "ready" symbol
        //   - The admin address
        // The event data is the number of faces on each die.
        env.events().publish(
            (symbol_short!("ROLLER"), symbol_short!("ready"), admin),
            num_faces,
        );

        Ok(())
    }

    /// Roll the dice
    ///
    /// # Arguments
    ///
    /// * `roller` - address rolling the dice during this turn.
    ///
    /// # Panics
    ///
    /// * If the contract has not yet been initialized
    /// * If a winner has already been found, and they've claimed the prize pot
    ///
    /// # Events
    ///
    /// Emits one of two events, depending on the rolled value:
    ///
    /// * For a non-winning roll, emits an event with topics `["ROLLER",
    ///   "rolled", roller: Address], data = total: u32`
    /// * For a winning roll, emits an event with topics `["ROLLER", "winner",
    ///   roller: Address], data = prize_pot: u32`
    ///
    /// If the game has already been "called" by the admin, and therefore
    /// everyone is henceforth a winner, no event is emitted and a "jackpot"
    /// roll is simply returned to the user.
    pub fn roll(env: Env, roller: Address) -> Result<Vec<u32>, Error> {
        // Check for various contract states, where we don't want to proceed:
        check_is_initialized(&env); // uninitialized game,
        check_no_winner(&env); // a game that has been won,

        let num_faces: u32 = env.storage().instance().get(&DataKey::NumFaces).unwrap();

        // If the game has already been called by the admin, return a jackpot
        // vec to the roller
        if does_everyone_win(&env) {
            return Ok(vec![&env, num_faces, num_faces, num_faces]);
        }

        // Require auth from the roller address
        roller.require_auth();

        let jackpot = num_faces * 3;
        let rolls: Vec<u32>;
        let total: u32;

        let mut roller_store: Roller = env
            .storage()
            .persistent()
            .get(&DataKey::Roller(roller.clone()))
            .unwrap_or_default();

        // Reseed the env's PRNG, so as to avoid a non-determinative
        // invocation and deposit. Essentially, we're singing a transaction
        // that will deposit tokens from the roller's balance, and the
        // amount is dependant on their roll. If the simulation returns one
        // result, and the _actual_ invocation another, then the signed auth
        // will be invalid, since the resulting PRNG roll will (likely) be
        // different.
        let address_bytes = roller.clone().to_xdr(&env);
        let mut address_slice = [0u8; 40];
        address_bytes.copy_into_slice(&mut address_slice);
        let rs_bytes = roller_store.clone().to_xdr(&env);
        let mut rs_slice = [0u8; 128];
        rs_bytes.copy_into_slice(&mut rs_slice);
        rs_slice[..40].copy_from_slice(&address_slice);
        // env.prng().seed(env.Bytes::from_array(&env, &rs_slice));
        env.prng().seed(
            env.crypto()
                .sha256(&Bytes::from_array(&env, &rs_slice))
                .to_xdr(&env)
                .slice(8..),
        );

        // roller_store_bytes[..40]
        // let address_bytes = address_bytes.slice(address_bytes.len() - 32..);
        // let mut slice = [0u8; 32];

        // let rolled_ledger_bytes = roller_store.ledger_number.to_xdr(&env);
        // let times_rolled_bytes = roller_store.times_rolled.to_xdr(&env);
        // let roller_store_bytes = roller_store.to_xdr(&env);

        rolls = roll_dice(&env, &num_faces);
        total = rolls.iter().sum();
        // Check if roller's first roll. If so, deposit from native SAC into the
        // game contract, according to their roll.
        if !env
            .storage()
            .persistent()
            .has(&DataKey::Roller(roller.clone()))
        {
            // let address_bytes = roller.clone().to_xdr(&env);
            // let address_bytes = address_bytes.slice(address_bytes.len() - 32..);
            // let mut slice = [0u8; 32];
            // address_bytes.copy_into_slice(&mut slice);
            // let seed = Bytes::from_array(&env, &slice);
            // env.prng().seed(seed);

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

            // let prize_pot: i128 = env.storage().instance().get(&DataKey::PrizePot).unwrap();
            // env.storage().instance().set(&DataKey::PrizePot, &(prize_pot + ((total * 10_000_000) as i128)));
        }
        // } else {
        //     // It's not the first roll. Just roll the dice.
        //     rolls = roll_dice(&env, &num_faces);
        //     total = rolls.iter().sum();
        // }

        // Retrieve and update the roller's data in persistent storage.
        // let mut roller_store: Roller = env
        //     .storage()
        //     .persistent()
        //     .get(&DataKey::Roller(roller.clone()))
        //     .unwrap_or_default();
        roller_store.ledger_number = env.ledger().sequence();
        roller_store.times_rolled += 1;
        roller_store.high_roll = if total > roller_store.high_roll {
            total
        } else {
            roller_store.high_roll
        };
        roller_store.first_roll = if roller_store.first_roll == 0 {
            total
        } else {
            roller_store.first_roll
        };

        // Store the updated roller data in persistent storage.
        env.storage()
            .persistent()
            .set(&DataKey::Roller(roller.clone()), &roller_store);

        // Emit a "winner" or "rolled" event, depending on the rolled value.
        if total == jackpot {
            // let prize_pot: i128 = env.storage().instance().get(&DataKey::PrizePot).unwrap();
            let token_client = token::TokenClient::new(
                &env,
                &env.storage()
                    .instance()
                    .get(&DataKey::TokenAddress)
                    .unwrap(),
            );

            let prize_pot = token_client.balance(&env.current_contract_address());
            token_client.transfer(&env.current_contract_address(), &roller, &prize_pot);
            env.storage().instance().set(&DataKey::Winner, &roller);

            // Publish an event about the game being won
            // The event has three topics:
            //   - The "ROLLER" symbol
            //   - The "winner" symbol
            //   - The winner's address
            // The event data is the prize pot that has been won
            env.events().publish(
                (symbol_short!("ROLLER"), symbol_short!("winner"), roller),
                prize_pot,
            );
        } else {
            // Publish an event about the game being won
            // The event has three topics:
            //   - The "ROLLER" symbol
            //   - The "rolled" symbol
            //   - The roller's address
            // The event data is the total rolled value
            env.events().publish(
                (symbol_short!("ROLLER"), symbol_short!("rolled"), roller),
                total,
            );
        }

        // Return the vector of rolled values
        Ok(rolls)
    }

    /// Call the game off
    ///
    /// # Panics
    ///
    /// * If the contract has not yet been initialized
    /// * If a winner has already been found, and they've claimed the prize pot
    /// * If the game has already been "called" by the admin
    ///
    /// # Events
    ///
    /// Emits an event with topics `["ROLLER", "called", admin: Address], data
    /// = prize_pot: i128`
    pub fn call_it(env: Env) -> Result<(), Error> {
        // Check for various contract states, where we don't want to proceed:
        check_is_initialized(&env); // uninitialized game,
        check_no_winner(&env); // a game that has been won,
        check_everyone_does_not_win(&env); // a game that has already been called,

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();

        admin.require_auth();
        env.storage().instance().set(&DataKey::EveryoneWins, &true);

        let prize_pot: i128 = env.storage().instance().get(&DataKey::PrizePot).unwrap();

        // Publish an event about the game being called
        // The event has three topics:
        //   - The "ROLLER" symbol
        //   - The "called" symbol
        //   - The admin address
        // The event data is the prize pot at the time the game ended.
        env.events().publish(
            (symbol_short!("ROLLER"), symbol_short!("called"), admin),
            prize_pot,
        );

        Ok(())
    }

    /// Sssshhh... Nothing to see here.
    pub fn be_evil(env: Env) -> Result<i128, Error> {
        // Check for various contract states, where we don't want to proceed:
        check_is_initialized(&env); // uninitialized game,
        check_everyone_does_win(&env); // a game that has not yet been called,

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let token_client = token::TokenClient::new(
            &env,
            &env.storage()
                .instance()
                .get(&DataKey::TokenAddress)
                .unwrap(),
        );
        let prize_pot: i128 = token::TokenClient::new(
            &env,
            &env.storage()
                .instance()
                .get(&DataKey::TokenAddress)
                .unwrap(),
        )
        .balance(&env.current_contract_address());
        token_client.transfer(&env.current_contract_address(), &admin, &prize_pot);

        // Publish an event about the admin being evil
        // The event has three topics:
        //   - The "ROLLER" symbol
        //   - The "eviladmin" symbol
        //   - The admin address
        // The event data is the prize pot the admin has stolen
        env.events().publish(
            (symbol_short!("ROLLER"), symbol_short!("eviladmin"), admin),
            prize_pot,
        );

        Ok(prize_pot)
    }
}

mod test;
