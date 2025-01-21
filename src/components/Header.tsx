import React from "react";
import { Link } from "react-router-dom";
import "../styles/styles.css"; 

const Header: React.FC = () => {
    return (
        <header style={{ margin: 0 }}>
            <h1>Blockchain Bridge</h1>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/transfer">Transfer</Link>
                <Link to="/history">History</Link>
            </nav>
        </header>
    );
};

export default Header;
