#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{testutils::Address as _, Env};
// use token::TokenInterface;

#[test]
fn test() {
    let env = Env::default();
    let contract_address = env.register_contract(None, HelloContract);
    let client = HelloContractClient::new(&env, &contract_address);

    // env.budget().reset_unlimited();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin);
    let token_client = token::TokenClient::new(&env, &token_contract.address());
    let sac_client = token::StellarAssetClient::new(&env, &token_contract.address());

    client.init(&admin, &token_contract.address());

    // let mut balance = token_client.balance(&roller);
    // std::println!("balance {}", balance);

    for i in 1..10 {
        let roller = Address::generate(&env);
        sac_client.mint(&roller, &(100 * 10_000_000));

        let total = client.roll(&roller);
        let balance = token_client.balance(&roller);
        let roller_storage = env.as_contract(&contract_address, || {
            env.storage()
                .persistent()
                .get::<DataKey, Roller>(&DataKey::Roller(roller.clone()))
                .unwrap()
        });
        if total.iter().all(|x| x == 18) {
            std::println!("JACKPOT! iteration {}", i);
        }

        // make sure all dice rolls are 6 or less
        assert!(total.iter().all(|x| x <= 6));
        assert!(total.iter().sum::<u32>() <= 18);

        // if i == 1 {
        // the first iteration, make sure the new balance is exactly `total`
        // less than the minted amount
        // assert_eq!(
        //     balance + (total.iter().sum::<u32>() * 10_000_000) as i128,
        //     100 * 10_000_000
        // );
        // } else {
        // other iterations, make sure the new balance is less than the
        // minted amount
        // assert!(balance < 100 * 10_000_000);
        // }

        // make sure the storage entry looks as expected
        assert_eq!(roller_storage.times_rolled, 1);
        assert_eq!(roller_storage.ledger_number, 0);
        assert!(roller_storage.high_roll >= total.iter().sum());
    }
}
