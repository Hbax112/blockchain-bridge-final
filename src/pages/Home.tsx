import React from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";

const Home: React.FC = () => {
    const navigate = useNavigate();
    return (
        <main className="flex flex-center home-container">
            <div>
                <h2>Welcome to Blockchain Bridge</h2>
                <p>Seamlessly transfer your IBT tokens between Ethereum and Sui blockchains.</p>
                <Button
                    label="Start Bridging"
                    onClick={() => navigate("/transfer")}
                />
            </div>
        </main>
    );
};

export default Home;
