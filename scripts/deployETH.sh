#!/bin/bash
if [ -z "$1" ]; then
echo "Usage: $0 <private_key>"
exit 1
fi
# Set variables
PRIVATE_KEY=$1
RPC_URL="http://127.0.0.1:8545" # Default Anvil RPC URL
CONTRACT_PATH="contracts/IBTToken.sol:MyToken"
# Deploy the contract using forge create
echo "Deploying contract from $CONTRACT_PATH to $RPC_URL with provided private
key..."
forge create \
--broadcast \
--rpc-url $RPC_URL \
--private-key $PRIVATE_KEY \
$CONTRACT_PATH
# Check for errors
if [ $? -eq 0 ]; then
echo "Contract deployed successfully!"
else
echo "Deployment failed!"
fi