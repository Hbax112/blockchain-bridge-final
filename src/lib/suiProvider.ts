export class JsonRpcProvider {
    private endpoint: string;

    constructor(endpoint: string = "http://127.0.0.1:9000") {
        this.endpoint = endpoint;
    }

    async request(method: string, params: any = []) {
        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method,
                params,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.error) {
            throw new Error(result.error.message);
        }

        return result.result;
    }

    async getNetworkStatus() {
        return this.request("sui_getLatestCheckpointSequenceNumber");
    }

    async getObject(objectId: string) {
        return this.request("sui_getObject", [objectId]);
    }

    async executeMoveCall(
        packageObjectId: string,
        module: string,
        functionName: string,
        typeArguments: string[],
        argumentsList: any[],
        gasBudget: number
    ) {
        const transaction = {
            package_object_id: packageObjectId,
            module,
            function: functionName,
            type_arguments: typeArguments,
            arguments: argumentsList,
            gas_budget: gasBudget,
        };

        const transactionString = JSON.stringify(transaction);
        console.log("Serialized transaction:", transactionString);

        return this.request("sui_executeTransactionBlock", [transactionString]);
    }
}
