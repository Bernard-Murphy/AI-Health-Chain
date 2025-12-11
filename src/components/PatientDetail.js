import React, { useState, useEffect, useCallback } from "react";
import "./PatientDetail.css";
import { apiService } from "../services/apiService";
import AnimatedButton from "./AnimatedButton";
import CopyableAddress from "./CopyableAddress";

// Move pure utility functions outside component to avoid recreation
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRecordTypeClass = (type) => {
  if (!type) return "";
  const normalizedType = type.toLowerCase().replace(/\s+/g, "_");
  if (
    normalizedType.includes("diagnostic") ||
    normalizedType.includes("diagnosis")
  )
    return "diagnostic";
  if (
    normalizedType.includes("treatment") ||
    normalizedType.includes("procedure")
  )
    return "treatment";
  if (normalizedType.includes("lab") || normalizedType.includes("test"))
    return "lab";
  return "";
};

const PatientDetail = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [patientResponse, recordsResponse] = await Promise.all([
          apiService.getPatient(patientId),
          apiService.getPatientRecords(patientId),
        ]);
        if (isMounted) {
          setPatient(patientResponse || null);
          setRecords(recordsResponse?.records || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (patientId) {
      fetchPatientData();
    }

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  if (loading) {
    return (
      <div className="patient-detail-container">
        <div className="loading">Loading patient details...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="patient-detail-container">
        <div className="error">
          Error loading patient: {error || "Patient not found"}
        </div>
        <AnimatedButton onClick={handleBack} className="back-btn">
          Back to List
        </AnimatedButton>
      </div>
    );
  }

  return (
    <div className="patient-detail-container">
      <div className="patient-detail-header">
        <AnimatedButton onClick={handleBack} className="back-btn">
          ← Back to List
        </AnimatedButton>
      </div>

      <div className="patient-detail-content">
        <div className="patient-info-section">
          <h2>Patient Information</h2>
          <div className="patient-info-grid">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">{patient.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{patient.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">
                {formatDate(patient.dateOfBirth)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{patient.gender}</span>
            </div>
            {patient.phone && (
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{patient.phone}</span>
              </div>
            )}
            {patient.address && (
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">{patient.address}</span>
              </div>
            )}
            {patient.walletAddress && (
              <div className="info-item">
                <span className="info-label">Wallet Address</span>
                <CopyableAddress
                  address={patient.walletAddress}
                  truncate={false}
                />
              </div>
            )}
          </div>
        </div>

        <div className="patient-records-section">
          <h2>Medical Records ({records.length})</h2>
          {records.length === 0 ? (
            <div className="placeholder">
              <p>No medical records found for this patient</p>
            </div>
          ) : (
            <div className="records-list">
              {records.map((record) => (
                <div key={record.id} className="record-card">
                  <div className="record-header">
                    <div className="record-title">{record.title}</div>
                    <span
                      className={`record-type ${getRecordTypeClass(
                        record.type
                      )}`}
                    >
                      {record.type}
                    </span>
                  </div>
                  {record.description && (
                    <p className="record-description">{record.description}</p>
                  )}
                  <div className="record-meta">
                    <div className="record-meta-item">
                      <span>📅</span>
                      <span>
                        {formatDateTime(record.date || record.createdAt)}
                      </span>
                    </div>
                    {record.doctor && (
                      <div className="record-meta-item">
                        <span>👨‍⚕️</span>
                        <span>{record.doctor}</span>
                      </div>
                    )}
                    {record.hospital && (
                      <div className="record-meta-item">
                        <span>🏥</span>
                        <span>{record.hospital}</span>
                      </div>
                    )}
                    {record.status && (
                      <span
                        className={`record-status ${record.status.toLowerCase()}`}
                      >
                        {record.status === "verified" ? "✓" : "○"}{" "}
                        {record.status}
                      </span>
                    )}
                  </div>
                  {record.blockchainHash && (
                    <div
                      className="record-meta"
                      style={{ marginTop: "0.5rem" }}
                    >
                      <div className="record-meta-item">
                        <CopyableAddress
                          address={record.blockchainHash}
                          className="hash small"
                          label="🔗"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
