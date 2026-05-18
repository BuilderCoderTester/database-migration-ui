import React, { useEffect, useState } from "react";
import "../MigrateDB.css";

const API = "http://localhost:8081/api/migrations";

const ActivityLog = () => {
  const [dbInfo, setDbInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [connectionId, setConnectionId] = useState(null);

  // 🔹 Fetch active connection ID
  useEffect(() => {
    const fetchConnection = async () => {
      try {
        const res = await fetch(`${API}/get-connection`);
        const data = await res.json();
        setConnectionId(data);
      } catch (err) {
        console.error("Failed to fetch connection", err);
      }
    };

    fetchConnection();
  }, []);

  // 🔹 Fetch DB info (depends on connectionId)
  useEffect(() => {
    if (!connectionId) return;

    const fetchInfo = async () => {
      try {
        const res = await fetch(
          `${API}/info?connectionId=${connectionId}`
        );
        const data = await res.json();
        console.log(data)
        setDbInfo(data);
      } catch (err) {
        console.error("Failed to fetch DB info", err);
      }
    };

    fetchInfo();
  }, [connectionId]);

  // 🔹 Poll logs every 2s
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API}/logs`);
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load logs", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="activity-log">
      <div className="activity-header">Activity Log</div>

      <div className="activity-body">
        {/* 🔹 Logs */}
        {logs.length === 0 && (
          <div className="log-empty">No activity yet</div>
        )}

        {logs.map((log, i) => (
          <div key={i} className="log-item">
            <div className={`log-dot ${getDotClass(log.level)}`} />

            <div>
              <div className="log-text">{log.message}</div>
              <div className="log-time">
                {formatTime(log.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* 🔹 DB Info */}
        {dbInfo && (
          <>
            <div className="info-box">
              <InfoRow label="Host" value={dbInfo.host} />
              <InfoRow label="Database" value={dbInfo.database} />
              <InfoRow label="Port" value={dbInfo.port} />
            </div>

            <div className="schema-box">
              <div className="schema-title">
                Schema history table
              </div>
              <div className="schema-value">
                {dbInfo.schemaTable}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value}</span>
  </div>
);

// 🔹 Helpers
const getDotClass = (level) => {
  switch (level) {
    case "SUCCESS":
      return "dot-green";
    case "ERROR":
      return "dot-red";
    case "WARN":
      return "dot-amber";
    default:
      return "dot-blue";
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString();
};

export default ActivityLog;