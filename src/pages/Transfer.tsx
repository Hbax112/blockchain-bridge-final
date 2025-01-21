import React, { useState, useEffect } from "react";
import { ConnectModal, useCurrentAccount, useDisconnectWallet, useWallets } from '@mysten/dapp-kit';
import { useNavigate } from 'react-router-dom';
import '@mysten/dapp-kit/dist/index.css';
import {bridgeTokens} from '../../scripts/bridgeUtils.ts'; 

const Transfer: React.FC = () => {
  const [sourceChain, setSourceChain] = useState<string>("Ethereum");
  const [destinationChain, setDestinationChain] = useState<string>("Sui");
  const [amount, setAmount] = useState<number>(0);

  const [connectedWalletType, setConnectedWalletType] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);      // pt. MetaMask 
  const [suiWalletAddress, setSuiWalletAddress] = useState<string | null>(null); // pt. Sui
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loggedOut, setLoggedOut] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const currentAccount = useCurrentAccount(); 
  const wallets = useWallets();
  const { mutate: disconnectSui } = useDisconnectWallet();

  useEffect(() => {
    if (currentAccount && !loggedOut) {
      setSuiWalletAddress(currentAccount.address);
      setConnectedWalletType('sui');
      console.log("Sui Wallet connected with address:", currentAccount.address);
    }
  }, [currentAccount, loggedOut]);

  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask and try again.");
      }
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
      });
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      setWalletAddress(accounts[0]);
      setConnectedWalletType('metamask');
      setErrorMessage("");
      console.log("MetaMask Account Connected:", accounts[0]);
    } catch (error) {
      setErrorMessage((error as Error).message || "An unknown error occurred with MetaMask.");
      console.error("MetaMask connection error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      if (connectedWalletType === "sui") {
        disconnectSui();  
      } else if (connectedWalletType === "metamask") {
        setWalletAddress(null);
      }

      setConnectedWalletType(null);
      setSuiWalletAddress(null);
      setErrorMessage("");
      setLoggedOut(true);

      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      setErrorMessage("Error during logout: " + (error as Error).message);
    }
  };


  const handleTransfer = async () => {
    try {

        if (sourceChain === destinationChain) {
            setErrorMessage(`Nu poți transfera de pe ${sourceChain} pe ${destinationChain} (același chain)!`);
            return;
          }

        console.log("Starting token bridge...");

        let walletType: string | null = null;
        let recvAddress: string | null = null;
        const bridgeAmount = amount; 

        if (sourceChain === "Ethereum") {
            walletType = "MetaMask";
            recvAddress = suiWalletAddress || "";
        } else if (sourceChain === "Sui") {
            walletType = "SuiWallet";
            recvAddress = walletAddress || "";
        }

        if (!walletType) {
            setErrorMessage("No wallet type could be determined from sourceChain.");
            return;
        }
        if (!recvAddress) {
            setErrorMessage("No receiving address found. Make sure the destination wallet is connected.");
            return;
        }

        console.log("Wallet type:", walletType);
        console.log("Source chain:", sourceChain);
        console.log("Destination chain:", destinationChain);
        console.log("Amount to bridge:", bridgeAmount);
        console.log("Receiver address:", recvAddress);

        let bridgeResult: any;

        if (walletType === "MetaMask") {
            console.log("MetaMask wallet detected. Initiating bridge process...");

            bridgeResult = await bridgeTokens(
                walletType,
                recvAddress,
                bridgeAmount,
                destinationChain,
                currentAccount
            );

            console.log("Bridge tokens result:", bridgeResult);

            const mintResponse = await fetch("http://localhost:3000/api/mint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recvAddress,
                    amount: bridgeAmount,
                    destinationChain: "Sui",
                }),
            });

            if (!mintResponse.ok) {
                throw new Error(await mintResponse.text());
            }

            const mintedData = await mintResponse.json();
            console.log("Minting response:", mintedData);
        } else if (walletType === "SuiWallet") {
            console.log("Sui wallet detected. Initiating bridge process...");

            bridgeResult = await bridgeTokens(
                walletType,
                recvAddress,
                bridgeAmount,
                destinationChain,
                currentAccount
            );
            console.log("Bridge tokens result:", bridgeResult);
        }

        const newTransaction = {
            date: new Date().toLocaleString(),
            source: sourceChain,
            destination: destinationChain,
            amount: bridgeAmount,
            status: "Success",
        };

        const existingTransactions = localStorage.getItem("transactions");
        const transactionsArray = existingTransactions ? JSON.parse(existingTransactions) : [];
        transactionsArray.push(newTransaction);
        localStorage.setItem("transactions", JSON.stringify(transactionsArray));

        console.log("Transaction saved:", newTransaction);
        setErrorMessage("");
    } catch (error: any) {
        console.error("Error in bridging:", error);

        const failedTransaction = {
            date: new Date().toLocaleString(),
            source: sourceChain,
            destination: destinationChain,
            amount: amount,
            status: "Failed",
        };

        const existingTransactions = localStorage.getItem("transactions");
        const transactionsArray = existingTransactions ? JSON.parse(existingTransactions) : [];
        transactionsArray.push(failedTransaction);
        localStorage.setItem("transactions", JSON.stringify(transactionsArray));

        setErrorMessage(error?.message || "Error occurred during bridging.");
    }
};

return (
    <div className="transfer-container">
      <h2 className="text-2xl font-bold mb-4">Transfer IBT Tokens</h2>

      {/* Connect Wallets */}
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">Connect Wallets</h3>
        <div className="flex">
          {/* Buton MetaMask */}
          <button
            onClick={connectMetaMask}
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
            disabled={!!walletAddress}
          >
            {walletAddress ? `Connected to MetaMask: ${walletAddress}` : "Connect MetaMask"}
          </button>

          {/* Buton Sui */}
          <ConnectModal
            trigger={
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                disabled={!!suiWalletAddress}
              >
                {suiWalletAddress ? "Connected to Sui Wallet: " + suiWalletAddress : "Connect with SuiWallet"}
              </button>
            }
            open={modalOpen}
            onOpenChange={(isOpen: boolean) => {
              setModalOpen(isOpen);
            }}
          />
        </div>
        {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
      </div>

      {/* Transfer Form */}
      <div className="mb-4">
        <label className="block mb-2">Source Chain</label>
        <select
          value={sourceChain}
          onChange={(e) => setSourceChain(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="Ethereum">Ethereum</option>
          <option value="Sui">Sui</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Destination Chain</label>
        <select
          value={destinationChain}
          onChange={(e) => setDestinationChain(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="Ethereum">Ethereum</option>
          <option value="Sui">Sui</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="p-2 border rounded w-full"
        />
      </div>

      {/* Logout Button */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      {/* Transfer Button */}
      <button
        onClick={handleTransfer}
        className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
        disabled={sourceChain === "Ethereum" ? !walletAddress : !suiWalletAddress}
      >
        Transfer
      </button>
    </div>
  );
};

export default Transfer;
