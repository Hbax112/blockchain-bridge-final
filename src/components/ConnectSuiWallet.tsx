import React, { useState } from "react";
import { JsonRpcProvider } from "../lib/suiProvider";

const ConnectSuiWallet: React.FC = () => {
    const [suiObjectDetails, setSuiObjectDetails] = useState<string | null>(null);

    const connectSuiWallet = async () => {
        try {
            const suiProvider = new JsonRpcProvider("http://127.0.0.1:9000");
            const objectId = "0x34e84f77bd09c5a57e4bc27ffc909a5bef565210a574b0764f0f53312df61997"; //obj id
            const objectDetails = await suiProvider.request("sui_getObject", [objectId]);
            setSuiObjectDetails(JSON.stringify(objectDetails, null, 2));
            alert("Connected to SUI Wallet!");
        } catch (error) {
            console.error("Failed to connect to SUI Wallet:", error);
            alert("Failed to connect to SUI Wallet.");
        }
    };

    return (
        <div>
            <button
                onClick={connectSuiWallet}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
                {suiObjectDetails ? "Connected" : "Connect SUI Wallet"}
            </button>
            {suiObjectDetails && (
                <pre className="mt-4 bg-gray-100 p-2 rounded">{suiObjectDetails}</pre>
            )}
        </div>
    );
};

export default ConnectSuiWallet;
