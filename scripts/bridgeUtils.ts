import { SuiClient } from "@mysten/sui/client";
import Web3 from "web3";

/**
 * Interfață minimă pentru obiectul 'currentAccount' (Sui).
 * Poți adăuga mai multe câmpuri, dacă ai nevoie.
 */
interface CurrentAccount {
  address: string;
}

/**
 * @param walletType        Tipul portofelului: "MetaMask" | "SuiWallet"
 * @param recvAddress       Adresa de recepție (ex. dacă bridg-uiești către Ethereum, e adresa Ethereum)
 * @param amount            Cantitatea de tokeni de burn/mint
 * @param destinationChain  Numele chain-ului de destinație (ex. "Sui" / "Ethereum")
 * @param currentAccount    Informații cont curent (Sui) - poate fi null dacă nu e relevat
 */
export async function bridgeTokens(
  walletType: "MetaMask" | "SuiWallet",
  recvAddress: string,
  amount: number,
  destinationChain: string,
  currentAccount: CurrentAccount | null
): Promise<any> {
  if (walletType === "MetaMask") {
    return burnTokensOnEth(amount, destinationChain);
  } else if (walletType === "SuiWallet") {
    const burnResult = await burnTokensOnSui(amount, currentAccount);

    console.log("Minting tokens on Ethereum...");
    const mintResult = await mintTokensOnEth(recvAddress, amount);
    console.log("Minting complete:", mintResult);

    return { burnResult, mintResult };
  } else {
    throw new Error("Unsupported wallet type");
  }
}

/**
 * Mint tokens on Ethereum (prin server).
 * @param recvAddress  Adresa pe care se vor mint-ui tokenii
 * @param amount       Cantitatea
 */
async function mintTokensOnEth(recvAddress: string, amount: number): Promise<any> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const mintResponse = await fetch("http://localhost:3000/api/mint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        recvAddress, 
        amount, 
        destinationChain: "Ethereum"
      }),
    });

    if (!mintResponse.ok) {
      throw new Error(await mintResponse.text());
    }

    const result = await mintResponse.json();
    console.log("Mint for Bridge Transaction Successful via server:", result);
    return result;
  } catch (error) {
    console.error("Error minting tokens on Ethereum:", error);
    throw error; 
  }
}

/**
 * @param amount            Cantitatea
 * @param destinationChain  Chain-ul de destinație, ex. "Sui"
 */
async function burnTokensOnEth(amount: number, destinationChain: string): Promise<any> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const userAddress = accounts[0];
    console.log("Connected Address (MetaMask):", userAddress);

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; //deployed to metamask
    const web3 = new Web3(window.ethereum as any);

    const abi = [
      {
        constant: false,
        inputs: [
          { name: "amount", type: "uint256" },
          { name: "destinationChain", type: "string" },
        ],
        name: "burnForBridge",
        outputs: [],
        type: "function",
      },
    ];

    const contract = new web3.eth.Contract(abi as any, contractAddress);

    const weiAmount = web3.utils.toWei(amount.toString(), "ether");

    const gasEstimate = await contract.methods.burnForBridge(weiAmount, destinationChain).estimateGas({
      from: userAddress,
    });

    console.log("Estimated Gas:", gasEstimate);

    const tx = await contract.methods.burnForBridge(weiAmount, destinationChain).send({
      from: userAddress,
      gas: Math.round(Number(gasEstimate) * 1.2).toString(),
      
      gasPrice: web3.utils.toWei("20", "gwei"), 
    });

    console.log("Burn for Bridge Transaction Successful:", tx);
    return tx;
  } catch (error: any) {
    console.error("Error burning tokens on Ethereum:", error);

    if (error.message.includes("User denied transaction signature")) {
      console.error("Transaction rejected by the user.");
    } else if (error.message.includes("insufficient funds")) {
      console.error("Insufficient funds for gas or token balance.");
    } else if (error.message.includes("reverted")) {
      console.error("Transaction reverted. Check contract logic or balance.");
    }

    throw error; 
  }
}

/**
 * @param amount         Cantitatea de tokeni
 * @param currentAccount Obiect cont Sui (include adresa)
 */
export async function burnTokensOnSui(
  amount: number,
  currentAccount: CurrentAccount | null
): Promise<any> {
  try {
    if (!currentAccount || !currentAccount.address) {
      throw new Error("No account connected to Sui Wallet");
    }

    const userAddress = currentAccount.address;
    const client = new SuiClient({ url: "http://127.0.0.1:9000" });

    // pack ID după publish
    const IBTTOKEN_TYPE = 
      "0x45970a1a80f4083fbecfc406426a082e90d5c5d15e46fe801eb7b46b6b4096d1::IBTToken::IBTToken";

    const coins = await client.getCoins({
      owner: userAddress,
      coinType: IBTTOKEN_TYPE,
    });

    if (!coins.data || coins.data.length === 0) {
      throw new Error("No IBTToken coins found to burn");
    }

    const coinToBurn = coins.data[0].coinObjectId;

    // Apel endpoint-ul /api/burn de pe server
    const response = await fetch("http://localhost:3000/api/burn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        amount, 
        userAddress, 
        coinObjectId: coinToBurn 
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  } catch (error) {
    console.error("Error in burnTokensOnSui:", error);
    throw error;
  }
}
