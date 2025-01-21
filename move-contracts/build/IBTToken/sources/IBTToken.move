module Default::IBTToken {
    use 0x2::object::{Self, UID};
    use 0x2::tx_context::{Self, TxContext};
    use 0x2::transfer;
    use std::string::String;
    
    struct IBT has key, store {
        id: UID,
        value: u64
    }

    // Metadata for the token
    struct CoinMetadata has key, store {
        id: UID,
        decimals: u8,
        name: String,
        symbol: String,
        description: String
    }

    // Treasury capability for managing coin supply
    struct TreasuryCap has key, store {
        id: UID
    }

    public entry fun initialize(
        ctx: &mut TxContext
    ) {
        // Use tx_context::sender(ctx) to get the sender's address if needed.
        let metadata = CoinMetadata {
            id: object::new(ctx),
            decimals: 6,
            name: std::string::utf8(b"IBT Token"),
            symbol: std::string::utf8(b"IBT"),
            description: std::string::utf8(b"This is an IBT token"),
        };
        transfer::public_transfer(metadata, tx_context::sender(ctx));

        // Create treasury cap
        let treasury_cap = TreasuryCap { id: object::new(ctx) };
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    public entry fun mint(
        _treasury_cap: &mut TreasuryCap,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let new_coin = IBT { id: object::new(ctx), value: amount };
        transfer::public_transfer(new_coin, recipient);
    }

    public entry fun burn(
        coin_to_burn: IBT
    ) {
        // Here you would remove the coin from circulation. Since we don't have a treasury, just destroy it.
        let IBT { id, value: _ } = coin_to_burn;
        object::delete(id);
    }
}