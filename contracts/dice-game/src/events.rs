use soroban_sdk::{contractevent, Address};

// Publish an event about the game being ready
//
// The event has three topics:
//   - The "ROLLER" symbol
//   - The "ready" symbol
//   - The admin address
//   - The number of dice
// The event data is the number of faces on each die.
#[contractevent(topics = ["ROLLER", "ready"])]
pub struct Ready {
    #[topic]
    pub admin: Address,
    #[topic]
    pub num_dice: u32,
    pub num_faces: u32,
}

// Publish an event about the game being won
//
// The event has three topics:
//   - The "ROLLER" symbol
//   - The "rolled" symbol
//   - The roller's address
// The event data is the total rolled value
#[contractevent(topics = ["ROLLER", "rolled"])]
pub struct Rolled {
    #[topic]
    pub roller: Address,
    pub total: u32,
}

// Publish an event about the game being won
//
// The event has three topics:
//   - The "ROLLER" symbol
//   - The "winner" symbol
//   - The winner's address
// The event data is the prize pot that has been won
#[contractevent(topics = ["ROLLER", "winner"])]
pub struct Winner {
    #[topic]
    pub winner: Address,
    pub prize_pot: i128,
}

// Publish an event about the game being called
//
// The event has three topics:
//   - The "ROLLER" symbol
//   - The "called" symbol
//   - The admin address
// The event data is the prize pot at the time the game ended.
#[contractevent(topics = ["ROLLER", "called"])]
pub struct Called {
    #[topic]
    pub admin: Address,
    pub prize_pot: i128,
}

// Publish an event about the admin being evil
//
// The event has three topics:
//   - The "ROLLER" symbol
//   - The "eviladmin" symbol
//   - The admin address
// The event data is the prize pot the admin has stolen
#[contractevent(topics = ["ROLLER", "eviladmin"])]
pub struct EvilAdmin {
    #[topic]
    pub admin: Address,
    pub prize_pot: i128,
}
