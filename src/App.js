import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import WalletConnection from "./components/WalletConnection";
import PatientList from "./components/PatientList";
import PatientDetail from "./components/PatientDetail";
import ConsentManagement from "./components/ConsentManagement";
import TransactionHistory from "./components/TransactionHistory";
import StatsDashboard from "./components/StatsDashboard";
import AnimatedButton from "./components/AnimatedButton";
import { useWeb3 } from "./hooks/useWeb3";
import { apiService } from "./services/apiService";
import { pageVariants } from "./lib/transitions";

function App() {
  const { account, connectWallet, disconnectWallet, isConnected } = useWeb3();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("patients");

  useEffect(() => {
    // Check if wallet is already connected
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          // Wallet already connected
        }
      });
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>AI Health Chains</h1>
          <p className="subtitle">Web3 Healthcare Data Management Platform</p>
        </div>
        <WalletConnection
          account={account}
          isConnected={isConnected}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />
      </header>

      <nav className="App-nav">
        <AnimatedButton
          className={activeTab === "patients" ? "active" : ""}
          onClick={() => setActiveTab("patients")}
          data-text="Patients"
        >
          Patients
        </AnimatedButton>
        <AnimatedButton
          className={activeTab === "consents" ? "active" : ""}
          onClick={() => setActiveTab("consents")}
          data-text="Consents"
        >
          Consents
        </AnimatedButton>
        <AnimatedButton
          className={activeTab === "transactions" ? "active" : ""}
          onClick={() => setActiveTab("transactions")}
          data-text="Transactions"
        >
          Transactions
        </AnimatedButton>
        <AnimatedButton
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => setActiveTab("stats")}
          data-text="Statistics"
        >
          Statistics
        </AnimatedButton>
      </nav>

      <main className="App-main">
        <AnimatePresence mode="wait">
          {activeTab === "patients" && (
            <motion.div
              key="patients"
              className="patients-container"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AnimatePresence mode="wait">
                {selectedPatient ? (
                  <motion.div
                    key={`patient-${selectedPatient}`}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <PatientDetail
                      patientId={selectedPatient}
                      onBack={() => setSelectedPatient(null)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="patient-list"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <PatientList onSelectPatient={setSelectedPatient} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "consents" && (
            <motion.div
              key="consents"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ConsentManagement account={account} />
            </motion.div>
          )}

          {activeTab === "transactions" && (
            <motion.div
              key="transactions"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <TransactionHistory account={account} />
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StatsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
