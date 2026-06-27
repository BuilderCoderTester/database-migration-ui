import React, { useEffect, useState } from "react";
import {
  History,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import "../../styles/primitives/history/RunHistory.css";

const API = "http://localhost:8081/api/migrations";

const RunHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const connRes = await fetch(`${API}/get-connection`);
      const connectionId = await connRes.json();

      const res = await fetch(`${API}/history?connectionId=${connectionId}`);

      const data = await res.json();

      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="history-loading">
        <Clock3 size={22} />
        Loading Run History...
      </div>
    );
  }

  return (
    <div className="run-history-page">
      {/* Header */}

      <section className="history-header">
        <div>
          <span className="history-chip">EXECUTION HISTORY</span>

          <h1>Migration Run History</h1>

          <p>
            Review previous migration executions, execution time, failures and
            database changes.
          </p>
        </div>

        <div className="history-counter">
          <History size={18} />

          {history.length}

          <span>Executions</span>
        </div>
      </section>

      {/* Cards */}

      {history.length === 0 ? (
        <div className="history-empty">
          <History size={52} />

          <h2>No Run History</h2>

          <p>Execute your first migration to populate the history.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, index) => (
            <div key={index} className="history-card">
              <div className="history-card-header">
                <div>
                  <div className="version-pill">V{item.version}</div>

                  <h3>{item.description}</h3>
                </div>

                <span
                  className={`status-pill ${
                    item.success ? "success" : "failed"
                  }`}
                >
                  {item.success ? (
                    <>
                      <CheckCircle2 size={14} />
                      SUCCESS
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      FAILED
                    </>
                  )}
                </span>
              </div>

              <div className="history-grid">
                <div>
                  <label>Executed At</label>

                  <strong>
                    {item.executedAt
                      ? new Date(item.executedAt).toLocaleString()
                      : "-"}
                  </strong>
                </div>

                <div>
                  <label>Duration</label>

                  <strong>
                    {item.executionTime ? `${item.executionTime} ms` : "-"}
                  </strong>
                </div>
              </div>

              {item.errorMessage && (
                <div className="history-error">
                  <AlertTriangle size={18} />

                  <span>{item.errorMessage}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RunHistory;
