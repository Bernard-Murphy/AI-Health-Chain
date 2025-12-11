import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ConsentManagement.css";
import { apiService } from "../services/apiService";
import { useWeb3 } from "../hooks/useWeb3";
import AnimatedButton from "./AnimatedButton";
import CopyableAddress from "./CopyableAddress";
import { pageVariants } from "../lib/transitions";

// Move pure utility function outside component
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ConsentManagement = ({ account }) => {
  const { signMessage } = useWeb3();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    purpose: "",
  });

  // Use ref to track initial load without causing re-renders
  const initialLoadedRef = useRef(false);

  const fetchConsents = useCallback(async () => {
    if (!initialLoadedRef.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const status = filterStatus === "all" ? null : filterStatus;
      const response = await apiService.getConsents(null, status);
      setConsents(response?.consents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      initialLoadedRef.current = true;
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchConsents();
  }, [fetchConsents]);

  const handleCreateConsent = useCallback(
    async (e) => {
      e.preventDefault();
      if (!account) {
        alert("Please connect your wallet first");
        return;
      }

      if (!formData.patientId || !formData.purpose) {
        alert("Please fill in all fields");
        return;
      }

      setCreating(true);
      try {
        const message = `I consent to: ${formData.purpose} for patient: ${formData.patientId}`;
        const signature = await signMessage(message);

        await apiService.createConsent({
          patientId: formData.patientId,
          purpose: formData.purpose,
          walletAddress: account,
          signature: signature,
        });

        setFormData({ patientId: "", purpose: "" });
        setShowCreateForm(false);
        await fetchConsents();
      } catch (err) {
        alert("Failed to create consent: " + err.message);
      } finally {
        setCreating(false);
      }
    },
    [account, formData, signMessage, fetchConsents]
  );

  const handleUpdateStatus = useCallback(
    async (consentId, newStatus) => {
      try {
        await apiService.updateConsent(consentId, { status: newStatus });
        await fetchConsents();
      } catch (err) {
        alert("Failed to update consent: " + err.message);
      }
    },
    [fetchConsents]
  );

  const handleFormChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleCreateForm = useCallback(() => {
    setShowCreateForm((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <div className="consent-management-container">
        <div className="loading">Loading consents...</div>
      </div>
    );
  }

  return (
    <div className="consent-management-container">
      <div className="consent-header">
        <h2>Consent Management</h2>
        <AnimatedButton
          className="create-btn"
          onClick={toggleCreateForm}
          disabled={!account}
        >
          {showCreateForm ? "Cancel" : "Create New Consent"}
        </AnimatedButton>
      </div>

      {!account && (
        <div className="warning">
          Please connect your MetaMask wallet to manage consents
        </div>
      )}
      <div className={showCreateForm && account ? "create-consent-form" : ""}>
        <AnimatePresence mode="wait">
          {showCreateForm && account && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              key="create-form"
              style={{ overflow: "hidden" }}
            >
              <h3>Create New Consent</h3>
              <form onSubmit={handleCreateConsent}>
                <div className="form-group">
                  <label>Patient ID</label>
                  <input
                    type="text"
                    value={formData.patientId}
                    onChange={(e) =>
                      handleFormChange("patientId", e.target.value)
                    }
                    required
                    placeholder="e.g., patient-001"
                  />
                </div>
                <div className="form-group">
                  <label>Purpose</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) =>
                      handleFormChange("purpose", e.target.value)
                    }
                    required
                  >
                    <option value="">Select purpose...</option>
                    <option value="Research Study Participation">
                      Research Study Participation
                    </option>
                    <option value="Data Sharing with Research Institution">
                      Data Sharing with Research Institution
                    </option>
                    <option value="Third-Party Analytics Access">
                      Third-Party Analytics Access
                    </option>
                    <option value="Insurance Provider Access">
                      Insurance Provider Access
                    </option>
                  </select>
                </div>
                <AnimatedButton
                  type="submit"
                  className="submit-btn"
                  disabled={creating}
                >
                  {creating ? "Signing..." : "Sign & Create Consent"}
                </AnimatedButton>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="consent-filters">
        <AnimatedButton
          className={filterStatus === "all" ? "active" : ""}
          onClick={() => setFilterStatus("all")}
        >
          All
        </AnimatedButton>
        <AnimatedButton
          className={filterStatus === "active" ? "active" : ""}
          onClick={() => setFilterStatus("active")}
        >
          Active
        </AnimatedButton>
        <AnimatedButton
          className={filterStatus === "pending" ? "active" : ""}
          onClick={() => setFilterStatus("pending")}
        >
          Pending
        </AnimatedButton>
      </div>

      <div className="consents-list">
        {error && <div className="error">Error: {error}</div>}
        <AnimatePresence mode="popLayout">
          {consents.length === 0 ? (
            <motion.div
              key="empty"
              className="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p>No consents found</p>
            </motion.div>
          ) : (
            <motion.div
              key={filterStatus}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="consents-list"
            >
              {consents.map((consent) => (
                <motion.div
                  key={consent.id}
                  className="consent-card"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                >
                  <div className="consent-header-info">
                    <div className="consent-purpose">{consent.purpose}</div>
                    <span
                      className={`consent-status ${consent.status?.toLowerCase()}`}
                    >
                      {consent.status}
                    </span>
                  </div>
                  <div className="consent-details">
                    <div className="consent-detail-item">
                      <strong>Patient ID:</strong>
                      <span>{consent.patientId}</span>
                    </div>
                    <div className="consent-detail-item">
                      <strong>Created:</strong>
                      <span>{formatDate(consent.createdAt)}</span>
                    </div>
                    {consent.walletAddress && (
                      <div className="consent-detail-item">
                        <strong>Wallet:</strong>
                        <CopyableAddress
                          address={consent.walletAddress}
                          className="small"
                        />
                      </div>
                    )}
                    {consent.blockchainTxHash && (
                      <div className="consent-detail-item">
                        <strong>TX Hash:</strong>
                        <CopyableAddress
                          address={consent.blockchainTxHash}
                          className="hash small"
                        />
                      </div>
                    )}
                  </div>
                  {consent.status === "pending" && account && (
                    <div className="consent-actions">
                      <AnimatedButton
                        className="action-btn primary"
                        onClick={() => handleUpdateStatus(consent.id, "active")}
                      >
                        Approve
                      </AnimatedButton>
                      <AnimatedButton
                        className="action-btn"
                        onClick={() =>
                          handleUpdateStatus(consent.id, "revoked")
                        }
                      >
                        Revoke
                      </AnimatedButton>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConsentManagement;
