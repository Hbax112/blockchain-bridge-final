import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Home from "./pages/Home";
import Transfer from "./pages/Transfer";
import History from "./pages/History";
import Header from "./components/Header";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl("mainnet") },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider>
          <Router>
            <div className="app-container">
              <Header />
              <main>
                <Routes>
                  {/* Păstrezi exact rutele tale */}
                  <Route path="/" element={<Home />} />
                  <Route path="/transfer" element={<Transfer />} />
                  <Route path="/history" element={<History />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};

export default App;
