import React, { useEffect, useState } from "react";
import {
  Activity,
  Database,
  Server,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";
import "../../styles/primitives/activity/ActivityLog.css";

const API = "http://localhost:8081/api/migrations";

const ActivityLog = () => {
  const [dbInfo, setDbInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [connectionId, setConnectionId] = useState(null);

  useEffect(() => {
    const fetchConnection = async () => {
      try {
        const res = await fetch(`${API}/get-connection`);
        const data = await res.json();
        setConnectionId(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchConnection();
  }, []);

  useEffect(() => {
    if (!connectionId) return;

    const fetchInfo = async () => {
      try {
        const res = await fetch(`${API}/info?connectionId=${connectionId}`);

        const data = await res.json();

        setDbInfo(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInfo();
  }, [connectionId]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API}/logs`);
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLogs();

    const interval = setInterval(fetchLogs, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="activity-panel">
      <div className="activity-panel-header">
        <div className="activity-title">
          <span className="activity-chip">LIVE</span>
          <h2>Activity Log</h2>
        </div>

        <Activity className="activity-icon" size={22} />
      </div>

      {/* DATABASE */}

      {dbInfo && (
        <div className="database-card">
          <div className="database-card-title">
            <Database size={18} />
            Connected Database
          </div>

          <InfoRow label="Host" value={dbInfo.host} />

          <InfoRow label="Database" value={dbInfo.database} />

          <InfoRow label="Port" value={dbInfo.port} />

          <InfoRow label="Schema" value={dbInfo.schemaTable} />
        </div>
      )}

      {/* TIMELINE */}

      <div className="timeline">
        {logs.length === 0 && (
          <div className="timeline-empty">No recent activity</div>
        )}

        {logs.map((log, index) => (
          <div key={index} className="timeline-item">
            <div className={`timeline-icon ${getDotClass(log.level)}`}>
              {getIcon(log.level)}
            </div>

            <div className="timeline-content">
              <div className="timeline-message">{log.message}</div>

              <div className="timeline-time">
                <Clock3 size={12} />

                {formatTime(log.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="db-row">
    <div className="db-label">{label}</div>

    <div className="db-value">{value}</div>
  </div>
);

const getIcon = (level) => {
  switch (level) {
    case "SUCCESS":
      return <CheckCircle2 size={16} />;

    case "ERROR":
      return <XCircle size={16} />;

    case "WARN":
      return <AlertTriangle size={16} />;

    default:
      return <Info size={16} />;
  }
};

const getDotClass = (level) => {
  switch (level) {
    case "SUCCESS":
      return "success";

    case "ERROR":
      return "error";

    case "WARN":
      return "warn";

    default:
      return "info";
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return "-";

  return new Date(timestamp).toLocaleString();
};

export default ActivityLog;
