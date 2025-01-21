import React, { useState } from "react";
import { ethers } from "ethers";

const ConnectWallet: React.FC = () => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    const connectMetaMask = async () => {
        if (!window.ethereum) {
            alert("MetaMask is not installed. Please install it to continue.");
            return;
        }
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []); 
            setWalletAddress(accounts[0]);

            alert(`Connected to MetaMask: ${accounts[0]}`);
        } catch (error) {
            console.error("Failed to connect MetaMask:", error);
            alert("Failed to connect MetaMask.");
        }
    };

    return (
        <div>
            <button
                onClick={connectMetaMask}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                {walletAddress ? "Connected" : "Connect MetaMask"}
            </button>
            {walletAddress && (
                <div className="mt-4">
                    <p>Wallet Address: {walletAddress}</p>
                </div>
            )}
        </div>
    );
};

export default ConnectWallet;
