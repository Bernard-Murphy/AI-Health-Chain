import React, { useState, useEffect, useCallback, useRef } from "react";
import "./TransactionHistory.css";
import { apiService } from "../services/apiService";
import CopyableAddress from "./CopyableAddress";
import AnimatedButton from "./AnimatedButton";
import { pageVariants } from "../lib/transitions";
import { motion, AnimatePresence } from "framer-motion";

// Move pure utility functions outside component
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTransactionTypeClass = (type) => {
  if (!type) return "";
  const normalizedType = type.toLowerCase().replace(/\s+/g, "_");
  if (normalizedType.includes("consent")) return "consent_approval";
  if (normalizedType.includes("data") || normalizedType.includes("access"))
    return "data_access";
  return normalizedType;
};

const TransactionHistory = ({ account }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterEnabled, setFilterEnabled] = useState(true);

  // Use ref to track initial load without causing dependency issues
  const initialLoadedRef = useRef(false);

  const fetchTransactions = useCallback(async () => {
    if (!initialLoadedRef.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const walletAddress = filterEnabled ? account : null;
      const response = await apiService.getTransactions(walletAddress, 20);
      setTransactions(response?.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      initialLoadedRef.current = true;
    }
  }, [account, filterEnabled]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const toggleFilter = useCallback(() => {
    setFilterEnabled((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <div className="transaction-history-container">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="transaction-history-container">
      <div className="transaction-header">
        <h2>Transaction History</h2>
        {account && (
          <div className="wallet-filter-controls">
            <AnimatedButton
              className={`filter-toggle ${filterEnabled ? "active" : ""}`}
              onClick={toggleFilter}
            >
              {filterEnabled ? "My Transactions" : "All Transactions"}
            </AnimatedButton>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {transactions.length === 0 ? (
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            key="empty"
            className="placeholder"
          >
            <p>No transactions found</p>
          </motion.div>
        ) : (
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            key={`transactions-${filterEnabled}`}
            className="transactions-list"
          >
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-card">
                <div className="transaction-header-info">
                  <span
                    className={`transaction-type ${getTransactionTypeClass(
                      transaction.type
                    )}`}
                  >
                    {transaction.type}
                  </span>
                  <span
                    style={{ textTransform: "capitalize" }}
                    className={`transaction-status ${transaction.status?.toLowerCase()}`}
                  >
                    {transaction.status === "confirmed" ? "✓" : "○"}{" "}
                    {transaction.status}
                  </span>
                </div>
                <div className="transaction-details">
                  <div className="transaction-detail-item">
                    <span className="transaction-detail-label">From</span>
                    <CopyableAddress
                      address={transaction.from}
                      className="small"
                    />
                  </div>
                  <div className="transaction-detail-item">
                    <span className="transaction-detail-label">To</span>
                    <CopyableAddress
                      address={transaction.to}
                      className="small"
                    />
                  </div>
                  {transaction.amount !== undefined &&
                    transaction.amount !== null && (
                      <div className="transaction-detail-item">
                        <span className="transaction-detail-label">Amount</span>
                        <span className="transaction-amount">
                          {transaction.amount} {transaction.currency || "ETH"}
                        </span>
                      </div>
                    )}
                  <div className="transaction-detail-item">
                    <span className="transaction-detail-label">Date</span>
                    <span className="transaction-timestamp">
                      {formatDate(
                        transaction.timestamp || transaction.createdAt
                      )}
                    </span>
                  </div>
                </div>
                {transaction.blockchainTxHash && (
                  <div
                    className="transaction-detail-item"
                    style={{ marginTop: "0.5rem" }}
                  >
                    <span className="transaction-detail-label">TX Hash</span>
                    <CopyableAddress
                      address={transaction.blockchainTxHash}
                      className="hash small"
                    />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionHistory;
