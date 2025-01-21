import React, { useEffect, useState } from "react";

interface Transaction {
    date: string; 
    source: string; 
    destination: string; 
    amount: number; 
    status: string; 
}

const History: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const storedTransactions = localStorage.getItem("transactions");
        if (storedTransactions) {
            setTransactions(JSON.parse(storedTransactions));
        }
    }, []);

    return (
        <div className="history-container">
            <h2 className="history-title">Transaction History</h2>
            {transactions.length === 0 ? (
                <p className="history-empty">No transactions found.</p>
            ) : (
                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => {
                                const [date, time] = transaction.date.split(" ");
                                return (
                                    <tr key={index} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                                        <td>{date}</td>
                                        <td>{time}</td>
                                        <td>{transaction.source}</td>
                                        <td>{transaction.destination}</td>
                                        <td>{transaction.amount}</td>
                                        <td className={transaction.status === "Success" ? "status-success" : "status-failure"}>
                                            {transaction.status}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default History;
