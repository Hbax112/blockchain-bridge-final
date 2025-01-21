#!/bin/bash

# Script parameters
action=$1
amount=$2
receiver_address=$3
coin_object_id=$4

# Ethereum settings
ETH_RPC_URL="http://127.0.0.1:8545"  # Adjust if different
ETH_CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"  # Use the correct contract address adica deployed to
DEPLOYER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" #primu cont anvil 

# Sui settings
SUI_PACKAGE_ID="0x45970a1a80f4083fbecfc406426a082e90d5c5d15e46fe801eb7b46b6b4096d1"
SUI_ADMIN_CAP_OBJECT_ID="0x72f4de2fe48c373ee972e39179b5987ec567fbdb30d131c6c5df05d784adcc74" #obj id de la cup

echo "Received Address: $receiver_address"

if [ "$action" == "mint" ]; then
    echo "Minting $amount IBT on Sui for Ethereum"
    sui client call --package "$SUI_PACKAGE_ID" --module IBTToken --function mint_to_destination --args "$SUI_ADMIN_CAP_OBJECT_ID" "$receiver_address" "$amount" --gas-budget 10000000
elif [ "$action" == "burn" ]; then
    echo "Switching to the connected account address: $receiver_address"
    sui client switch --address $receiver_address

    echo "Burning $amount IBT on Sui for Ethereum"
    sui client call --package "$SUI_PACKAGE_ID" --module IBTToken --function burn_exact_for_bridge --args "$SUI_ADMIN_CAP_OBJECT_ID" "$coin_object_id" "$amount" "\"Ethereum\"" --gas-budget 10000000
elif [ "$action" == "eth" ]; then
    echo "Minting $amount IBT on Ethereum for $receiver_address"
    wei_amount=$(cast --to-wei $amount ether)
    cast send --rpc-url $ETH_RPC_URL --private-key $DEPLOYER_PRIVATE_KEY $ETH_CONTRACT_ADDRESS "mintForBridge(address,uint256,string)" $receiver_address $wei_amount "\"Sui\""
else
    echo "Invalid action. Use 'mint', 'burn', or 'eth'."
    exit 1
fi