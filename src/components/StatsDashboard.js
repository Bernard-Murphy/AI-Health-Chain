import React, { useState, useEffect, useMemo } from "react";
import "./StatsDashboard.css";
import { apiService } from "../services/apiService";

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getStats();
        if (isMounted) {
          setStats(response || null);
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

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize statItems to avoid recreation on every render
  const statItems = useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        label: "Total Patients",
        value: stats.totalPatients ?? 0,
        description: "Registered patients in the system",
        primary: true,
      },
      {
        label: "Total Records",
        value: stats.totalRecords ?? 0,
        description: "Medical records stored on blockchain",
        primary: true,
      },
      {
        label: "Total Consents",
        value: stats.totalConsents ?? 0,
        description: "Consent agreements created",
      },
      {
        label: "Active Consents",
        value: stats.activeConsents ?? 0,
        description: "Currently active consent agreements",
      },
      {
        label: "Pending Consents",
        value: stats.pendingConsents ?? 0,
        description: "Consents awaiting approval",
      },
      {
        label: "Total Transactions",
        value: stats.totalTransactions ?? 0,
        description: "Blockchain transactions processed",
      },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="stats-dashboard-container">
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-dashboard-container">
        <div className="error">
          Error loading statistics: {error || "No data available"}
        </div>
      </div>
    );
  }

  return (
    <div className="stats-dashboard-container">
      <h2>Platform Statistics</h2>

      <div className="stats-grid">
        {statItems.map((item, index) => (
          <div
            key={item.label}
            className={`stat-card ${item.primary ? "primary" : ""}`}
          >
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{item.value.toLocaleString()}</div>
            <div className="stat-description">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsDashboard;
