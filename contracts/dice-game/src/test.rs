#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_including_winner() {
    let env = Env::default();

    env.mock_all_auths();
    env.cost_estimate().budget().reset_unlimited();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let token_client = token::TokenClient::new(&env, &token_contract.address());
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    let contract_address = env.register(
        RollerContract,
        (&admin, &token_contract.address(), &3u32, &6u32),
    );
    let client = RollerContractClient::new(&env, &contract_address);

    for i in 0..103 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));

        let rolls = client.roll(&roller);
        let total = rolls.iter().sum::<u32>();

        if rolls.iter().all(|x| x == 6) {
            std::println!("JACKPOT! iteration {}", i);
        }

        let roller_balance = token_client.balance(&roller);
        let roller_storage: Roller = env.as_contract(&contract_address, || {
            env.storage()
                .persistent()
                .get(&DataKey::Roller(roller.clone()))
                .unwrap()
        });

        // make sure all dice rolls are 6 or less
        assert!(rolls.iter().all(|x| x <= 6));
        assert!(total <= 18);

        // make sure the new balance is exactly `total` less than the minted
        // amount
        assert_eq!(
            roller_balance + (total * 10_000_000) as i128,
            100 * 10_000_000
        );

        // make sure the storage entries looks as expected
        assert_eq!(roller_storage.times_rolled, 1);
        assert_eq!(roller_storage.ledger_number, 0);
        assert!(roller_storage.high_roll >= total);
        assert_eq!(roller_storage.first_roll, total);
    }

    // now let's check that the winner experience is what we want it to be.
    let winner = Address::generate(&env);
    sac_client.mint(&winner, &(100 * 10_000_000));
    let mut contract_balance = token_client.balance(&contract_address);

    let rolls = client.roll(&winner);
    let total = rolls.iter().sum::<u32>();

    // client.claim_prize(&winner);
    let winner_balance = token_client.balance(&winner);

    assert_eq!(total, 18);
    assert_eq!(
        winner_balance,
        (100 * 10_000_000) as i128 + contract_balance
    );

    contract_balance = token_client.balance(&contract_address);
    assert_eq!(contract_balance, 0);
}

#[test]
fn test_with_four_dice() {
    let env = Env::default();

    env.mock_all_auths();
    env.cost_estimate().budget().reset_unlimited();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let token_client = token::TokenClient::new(&env, &token_contract.address());
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    let contract_address = env.register(
        RollerContract,
        (&admin, &token_contract.address(), &4u32, &6u32),
    );
    let client = RollerContractClient::new(&env, &contract_address);

    for i in 0..226 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));

        let rolls = client.roll(&roller);
        let total = rolls.iter().sum::<u32>();

        if rolls.iter().all(|x| x == 6) {
            std::println!("JACKPOT! iteration {}", i);
        }

        let roller_balance = token_client.balance(&roller);
        let roller_storage: Roller = env.as_contract(&contract_address, || {
            env.storage()
                .persistent()
                .get(&DataKey::Roller(roller.clone()))
                .unwrap()
        });

        // make sure all dice rolls are 6 or less
        assert!(rolls.iter().all(|x| x <= 6));
        assert!(total <= 24);

        // make sure the new balance is exactly `total` less than the minted
        // amount
        assert_eq!(
            roller_balance + (total * 10_000_000) as i128,
            100 * 10_000_000
        );

        // make sure the storage entries looks as expected
        assert_eq!(roller_storage.times_rolled, 1);
        assert_eq!(roller_storage.ledger_number, 0);
        assert!(roller_storage.high_roll >= total);
        assert_eq!(roller_storage.first_roll, total);
    }

    // now let's check that the winner experience is what we want it to be.
    let winner = Address::generate(&env);
    sac_client.mint(&winner, &(100 * 10_000_000));
    let mut contract_balance = token_client.balance(&contract_address);

    let rolls = client.roll(&winner);
    let total = rolls.iter().sum::<u32>();

    // client.claim_prize(&winner);
    let winner_balance = token_client.balance(&winner);

    assert_eq!(total, 24);
    assert_eq!(
        winner_balance,
        (100 * 10_000_000) as i128 + contract_balance
    );

    contract_balance = token_client.balance(&contract_address);
    assert_eq!(contract_balance, 0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_past_winner() {
    let env = Env::default();

    env.mock_all_auths();
    env.cost_estimate().budget().reset_unlimited();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    let contract_address = env.register(
        RollerContract,
        (&admin, &token_contract.address(), &3u32, &6u32),
    );
    let client = RollerContractClient::new(&env, &contract_address);

    // the tests work out so that on iteration 103, we have a winner. everything
    // should work as predicted until then.
    for _i in 0..103 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));
        let _rolls = client.roll(&roller);
    }

    // roll and claim the prize
    let winner = Address::generate(&env);
    sac_client.mint(&winner, &(100 * 10_000_000));
    client.roll(&winner);

    let next_roller = Address::generate(&env);
    sac_client.mint(&next_roller, &(100 * 10_000_000));
    client.roll(&next_roller);
}

#[test]
fn test_everyone_wins() {
    let env = Env::default();

    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let token_client = token::TokenClient::new(&env, &token_contract.address());
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    let contract_address = env.register(
        RollerContract,
        (&admin, &token_contract.address(), &3u32, &6u32),
    );
    let client = RollerContractClient::new(&env, &contract_address);

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
#[should_panic(expected = "HostError: Error(Contract, #3)")]
fn test_cannot_call_game_twice() {
    let env = Env::default();

    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);

    let contract_address = env.register(
        RollerContract,
        (&admin, &token_contract.address(), &3u32, &6u32),
    );
    let client = RollerContractClient::new(&env, &contract_address);

    client.call_it();
    client.call_it();
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #2")]
fn test_cannot_be_evil_with_uncalled_game() {
    let env = Env::default();

    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    let contract_address = env.register(
        RollerContract,
        (&admin, &token_contract.address(), &3u32, &6u32),
    );
    let client = RollerContractClient::new(&env, &contract_address);
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

    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let token_client = token::TokenClient::new(&env, &token_contract.address());
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    let contract_address = env.register(
        RollerContract,
        (&admin, &token_contract.address(), &3u32, &6u32),
    );
    let client = RollerContractClient::new(&env, &contract_address);

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
