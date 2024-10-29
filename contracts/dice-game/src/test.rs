#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{testutils::Address as _, Env};
// use token::TokenInterface;

#[test]
fn test_including_winner() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let token_client = token::TokenClient::new(&env, &token_contract.address());
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    client.init(&admin, &token_contract.address(), &6);
    let mut rollers_vec: Vec<Address>;

    for i in 0..42 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));

        let rolls = client.roll(&roller);
        let total = rolls.iter().sum::<u32>();

        if rolls.iter().all(|x| x == 6) {
            std::println!("JACKPOT! iteration {}", i);
        }

        let roller_balance = token_client.balance(&roller);
        let contract_balance = token_client.balance(&contract_address);

        let prize_pot: i128 = env.as_contract(&contract_address, || {
            env.storage()
                .instance()
                .get(&DataKey::PrizePot)
                .unwrap()
        });
        let roller_storage: Roller = env.as_contract(&contract_address, || {
            env.storage()
                .persistent()
                .get(&DataKey::Roller(roller.clone()))
                .unwrap()
        });
        rollers_vec = env.as_contract(&contract_address, || {
            env.storage()
                .persistent()
                .get(&DataKey::Rollers)
                .unwrap()
        });

        // make sure all dice rolls are 6 or less
        assert!(rolls.iter().all(|x| x <= 6));
        assert!(total <= 18);

        // make sure the new balance is exactly `total` less than the minted
        // amount
        assert_eq!(roller_balance + (total * 10_000_000) as i128, 100 * 10_000_000);

        // make sure the storage entries looks as expected
        assert_eq!(roller_storage.times_rolled, 1);
        assert_eq!(roller_storage.ledger_number, 0);
        assert!(roller_storage.high_roll >= total);
        assert_eq!(roller_storage.first_roll, total);
        assert_eq!(contract_balance, prize_pot);
        assert_eq!(rollers_vec.len(), i + 1);
        assert!(rollers_vec.contains(roller));
    }

    // now let's check that the winner experience is what we want it to be.
    let winner = Address::generate(&env);
    sac_client.mint(&winner, &(100 * 10_000_000));
    let mut contract_balance = token_client.balance(&contract_address);

    let rolls = client.roll(&winner);
    let total = rolls.iter().sum::<u32>();

    rollers_vec = env.as_contract(&contract_address, || {
        env.storage()
            .persistent()
            .get(&DataKey::Rollers)
            .unwrap()
    });

    client.claim_prize(&winner);
    let winner_balance = token_client.balance(&winner);

    assert_eq!(total, 18);
    assert_eq!(
        winner_balance,
        (100 * 10_000_000) as i128 + contract_balance
    );
    assert_eq!(rollers_vec.len(), 43);
    assert!(rollers_vec.contains(winner));

    contract_balance = token_client.balance(&contract_address);
    assert_eq!(contract_balance, 0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_past_winner() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    // env.budget().reset_unlimited();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    client.init(&admin, &token_contract.address(), &6);

    // the tests work out so that on iteration 42, we have a winner. everything
    // should work as predicted until then.
    for _i in 0..42 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));
        let _rolls = client.roll(&roller);
    }

    // roll and claim the prize
    let winner = Address::generate(&env);
    sac_client.mint(&winner, &(100 * 10_000_000));
    client.roll(&winner);
    client.claim_prize(&winner);

    let next_roller = Address::generate(&env);
    sac_client.mint(&next_roller, &(100 * 10_000_000));
    client.roll(&next_roller);
}

#[test]
fn test_everyone_wins() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    // env.budget().reset_unlimited();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let token_client = token::TokenClient::new(&env, &token_contract.address());
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    client.init(&admin, &token_contract.address(), &6);

    // the tests work out so that on iteration 42, we have a winner. everything
    // should work as predicted until then.
    for _i in 0..10 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));
        let _rolls = client.roll(&roller);
    }

    let pre_called_balance = token_client.balance(&contract_address);
    client.call_it();
    let post_called_balance = token_client.balance(&contract_address);
    assert_eq!(pre_called_balance, post_called_balance);

    for _i in 0..10 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));
        let rolls = client.roll(&roller);

        assert_eq!(rolls.iter().sum::<u32>(), 18);
        assert!(rolls.iter().all(|x| x == 6));
    }

    let yet_another_post_called_balance = token_client.balance(&contract_address);
    assert_eq!(pre_called_balance, yet_another_post_called_balance);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #6)")]
fn test_cannot_call_game_twice() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin);

    client.init(&admin, &token_contract.address(), &6);
    client.call_it();
    client.call_it();
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_cannot_call_uninitialized_game() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    env.mock_all_auths();

    client.call_it();
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_cannot_initialize_twice() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin);

    client.init(&admin, &token_contract.address(), &6);
    client.init(&admin, &token_contract.address(), &6);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_cannot_roll_uninitialized_game() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    env.mock_all_auths();

    let roller = Address::generate(&env);
    client.roll(&roller);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #4")]
fn test_cannot_claim_with_no_winner() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin);

    client.init(&admin, &token_contract.address(), &6);
    let not_winner = Address::generate(&env);
    client.claim_prize(&not_winner);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #5")]
fn test_cannot_be_evil_with_uncalled_game() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    client.init(&admin, &token_contract.address(), &6);
    for _i in 0..10 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));
        client.roll(&roller);
    }

    client.be_evil();
}

#[test]
fn test_can_be_evil_with_called_game() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let token_client = token::TokenClient::new(&env, &token_contract.address());
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    client.init(&admin, &token_contract.address(), &6);

    for _i in 0..10 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));
        client.roll(&roller);
    }

    let mut contract_balance = token_client.balance(&contract_address);
    assert!(contract_balance > 0);

    client.call_it();
    let evil_balance = client.be_evil();
    assert_eq!(contract_balance, evil_balance);

    contract_balance = token_client.balance(&contract_address);
    assert_eq!(contract_balance, 0);

    let admin_balance = token_client.balance(&admin);
    assert_eq!(admin_balance, evil_balance);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #5")]
fn test_cannot_be_kind_with_uncalled_game() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    client.init(&admin, &token_contract.address(), &6);
    for _i in 0..10 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));
        client.roll(&roller);
    }

    client.be_kind();
}

#[test]
fn test_can_be_kind_with_called_game() {
    let env = Env::default();
    let contract_address = env.register_contract(None, RollerContract);
    let client = RollerContractClient::new(&env, &contract_address);

    // env.budget().reset_unlimited();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let token_client = token::TokenClient::new(&env, &token_contract.address());
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    client.init(&admin, &token_contract.address(), &6);

    for _i in 0..10 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));
        client.roll(&roller);
    }

    let contract_balance = token_client.balance(&contract_address);
    assert!(contract_balance > 0);

    client.call_it();

    let rollers_vec: Vec<Address> = env.as_contract(&contract_address, || {
        env.storage()
            .persistent()
            .get(&DataKey::Rollers)
            .unwrap()
    });

    // make sure each roller's balance is _less than_ when we started
    for roller in rollers_vec.iter() {
        let roller_balance = token_client.balance(&roller);
        assert!(roller_balance < 100 * 10_000_000);
    }
    // redistribute tokens
    client.be_kind();
    // make sure each roller's balance is _the same as_ when we started
    for roller in rollers_vec.iter() {
        let roller_balance = token_client.balance(&roller);
        assert_eq!(roller_balance, (100 * 10_000_000) as i128);
    }
    // let evil_balance = client.be_evil();
    // assert_eq!(contract_balance, evil_balance);

    // contract_balance = token_client.balance(&contract_address);
    // assert_eq!(contract_balance, 0);

    // let admin_balance = token_client.balance(&admin);
    // assert_eq!(admin_balance, evil_balance);
}
