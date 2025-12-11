import React, { useState, useEffect, useCallback } from "react";
import "./PatientList.css";
import { apiService } from "../services/apiService";
import AnimatedButton from "./AnimatedButton";
import CopyableAddress from "./CopyableAddress";
import { pageVariants } from "../lib/transitions";
import { motion, AnimatePresence } from "framer-motion";

// Move pure utility functions outside component to avoid recreation
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const PatientList = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getPatients(
        currentPage,
        10,
        searchTerm
      );
      setPatients(response?.patients || []);
      setPagination(response?.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  // Use functional updates to avoid stale closures
  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const handleSelectPatient = useCallback(
    (patientId) => {
      onSelectPatient(patientId);
    },
    [onSelectPatient]
  );

  if (error) {
    return (
      <div className="patient-list-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h2>Patients</h2>
        <input
          type="text"
          placeholder="Search patients..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            key="loading"
            className="loading"
          >
            Loading patients...
          </motion.div>
        ) : (
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            key="patient-list"
            className="patient-list"
          >
            {patients.length === 0 ? (
              <div className="placeholder">
                <p>No patients found</p>
              </div>
            ) : (
              patients.map((patient) => (
                <AnimatedButton
                  key={patient.id}
                  className="patient-card"
                  onClick={() => handleSelectPatient(patient.id)}
                >
                  <div className="patient-card-header">
                    <div>
                      <div className="patient-name">{patient.name}</div>
                      <div className="patient-id">{patient.id}</div>
                    </div>
                  </div>
                  <div className="patient-info">
                    <div className="patient-info-item">
                      <span>📧</span>
                      <span>{patient.email}</span>
                    </div>
                    <div className="patient-info-item">
                      <span>🎂</span>
                      <span>{formatDate(patient.dateOfBirth)}</span>
                    </div>
                    <div className="patient-info-item">
                      <span>👤</span>
                      <span>{patient.gender}</span>
                    </div>
                    {patient.phone && (
                      <div className="patient-info-item">
                        <span>📞</span>
                        <span>{patient.phone}</span>
                      </div>
                    )}
                  </div>
                  {patient.walletAddress && (
                    <div className="patient-wallet">
                      <CopyableAddress
                        address={patient.walletAddress}
                        className="small"
                        label="🔗"
                      />
                    </div>
                  )}
                </AnimatedButton>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <AnimatedButton onClick={handlePrevPage} disabled={currentPage <= 1}>
            ← Previous
          </AnimatedButton>
          <span className="pagination-info">
            Page {currentPage} of {pagination.totalPages} ({pagination.total}{" "}
            patients)
          </span>
          <AnimatedButton
            onClick={handleNextPage}
            disabled={currentPage >= pagination.totalPages}
          >
            Next →
          </AnimatedButton>
        </div>
      )}
    </div>
  );
};

export default PatientList;
