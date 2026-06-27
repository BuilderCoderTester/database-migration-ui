import React, { useEffect, useState, useCallback } from "react";

const API = "http://localhost:8081/api/migrations";

import "../../styles/primitives/connections/Connections.css";

const EMPTY_FORM = {
  name: "",
  host: "",
  port: 5432,
  database: "",
  username: "",
  password: "",
  schema: "public",
};

// ─── CONNECTIONS COMPONENT ──────────────────────────────────────────────────
const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [testing, setTesting] = useState(false);
  // FIX: Added saving state so the Save button can show feedback and prevent
  //      double-submission just like testConnection already did for testing.
  const [saving, setSaving] = useState(false);
  // FIX: Track per-field errors instead of a single alert() call so the UI
  //      can highlight the broken field inline.
  const [formErrors, setFormErrors] = useState({});

  const [form, setForm] = useState(EMPTY_FORM);

  // ─── LOAD FROM LOCAL STORAGE ──────────────────────────────────────────
  useEffect(() => {
    try {
      // FIX: Wrapped in try/catch — localStorage.getItem can throw in
      //      private/incognito mode or when storage quota is exceeded.
      const saved = JSON.parse(localStorage.getItem("connections") || "[]");
      const active = localStorage.getItem("activeConnection");
      // FIX: Validate that `saved` is actually an array before setting state,
      //      guarding against corrupted localStorage values.
      setConnections(Array.isArray(saved) ? saved : []);
      setActiveId(active || null);
    } catch (err) {
      console.error("Failed to read connections from localStorage:", err);
      setConnections([]);
    }
  }, []);

  // ─── CLOSE MODAL & RESET ──────────────────────────────────────────────
  // FIX: Centralised close logic so both Cancel and backdrop-click reset
  //      both the form AND formErrors, not just the visibility flag.
  const closeModal = useCallback(() => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setFormErrors({});
  }, []);

  // ─── FIELD CHANGE HELPER ──────────────────────────────────────────────
  // FIX: Clears the error for a field as soon as the user edits it, giving
  //      immediate positive feedback instead of waiting for re-submission.
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // ─── VALIDATION ───────────────────────────────────────────────────────
  // FIX: Returns an errors object (all problems at once) instead of the
  //      first error string, so every invalid field can be flagged at once.
  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.host.trim()) errors.host = "Host is required";
    if (!form.port) errors.port = "Port is required";
    if (Number(form.port) < 1 || Number(form.port) > 65535)
      errors.port = "Port must be 1–65535";
    if (!form.database.trim()) errors.database = "Database is required";
    if (!form.username.trim()) errors.username = "Username is required";
    return errors;
  };

  // ─── SAVE CONNECTION ──────────────────────────────────────────────────
  const saveConnection = async () => {
    if (saving) return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSaving(true);

      const newConn = {
        id: Date.now().toString(),
        ...form,
        port: Number(form.port),
      };

      const updated = [...connections, newConn];
      setConnections(updated);

      // FIX: Wrapped in try/catch — localStorage.setItem throws when storage
      //      quota is exceeded. Without this, the state update succeeds but
      //      the save silently fails.
      try {
        localStorage.setItem("connections", JSON.stringify(updated));
      } catch (storageErr) {
        console.error("Failed to persist connection:", storageErr);
        alert("Connection added but could not be saved to local storage.");
      }

      closeModal();
    } finally {
      setSaving(false);
    }
  };

  // ─── TEST CONNECTION ──────────────────────────────────────────────────
  const testConnection = async () => {
    if (testing) return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    console.log(form);
    try {
      setTesting(true);

      const res = await fetch(`${API}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, port: Number(form.port) }),
      });

      // FIX: Check res.ok before parsing JSON — a non-2xx response (e.g. 500)
      //      would otherwise crash on data.success access.
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      console.log(data.Connections);
      if (data.success) {
        alert("✅ Connection successful");
      } else {
        alert("❌ " + (data.message || "Connection failed"));
      }
    } catch (err) {
      alert("Connection failed: " + err.message);
    } finally {
      setTesting(false);
    }
  };

  // ─── SET ACTIVE + CONNECT ─────────────────────────────────────────────
  const setActive = async (conn) => {
    if (conn.id === activeId) return;

    try {
      const res = await fetch(`${API}/set-active`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          database: conn.database,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      if (!data.success) {
        alert("❌ " + (data.message || "Failed"));

        return;
      }

      setActiveId(data.data);

      localStorage.setItem("activeConnection", data.data);

      console.info("Active connection set:", conn.database);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ─── DELETE ───────────────────────────────────────────────────────────
  // FIX: Added a confirmation prompt before deleting — destructive actions
  //      should always require confirmation.
  const deleteConnection = (id) => {
    if (!window.confirm("Delete this connection? This cannot be undone."))
      return;

    const updated = connections.filter((c) => c.id !== id);
    setConnections(updated);

    try {
      localStorage.setItem("connections", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to persist after delete:", err);
    }

    if (id === activeId) {
      setActiveId(null);
      try {
        localStorage.removeItem("activeConnection");
      } catch (err) {
        console.error("Failed to clear active connection:", err);
      }
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────
  return (
    <div className="connections-page">
      {/* HEADER */}
      <section className="connection-header">
        <div>
          <span className="connection-chip">DATABASE</span>

          <h1>Database Connections</h1>

          <p>Manage PostgreSQL connections used by the migration engine.</p>
        </div>

        <button className="primary-btn" onClick={() => setShowModal(true)}>
          + New Connection
        </button>
      </section>

      {/* CONNECTION CARDS */}
      {connections.length === 0 ? (
        <div className="empty-state">
          <p>No connections yet.</p>
          <p>
            Click <strong>+ Add Connection</strong> to get started.
          </p>
        </div>
      ) : (
        <div className="connections-list">
          {connections.map((conn) => (
            <div
              key={conn.id}
              className={`db-card ${activeId === conn.id ? "active" : ""}`}
            >
              <div className="db-card-header">
                <div>
                  <h3>{conn.name}</h3>
                  <p>
                    {conn.host}:{conn.port}
                  </p>
                </div>

                {activeId === conn.id && (
                  <div className="active-chip">ACTIVE</div>
                )}
              </div>

              <div className="db-grid">
                <div>
                  <label>Database</label>
                  <strong>{conn.database}</strong>
                </div>

                <div>
                  <label>Schema</label>
                  <strong>{conn.schema}</strong>
                </div>

                <div>
                  <label>Username</label>
                  <strong>{conn.username}</strong>
                </div>
              </div>

              <div className="db-actions">
                <button className="primary-btn" onClick={() => setActive(conn)}>
                  {activeId === conn.id ? "Connected" : "Set Active"}
                </button>

                <button
                  className="danger-btn"
                  onClick={() => deleteConnection(conn.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {/* FIX: Moved modal rendering outside the list so it's always in the DOM
               when showModal is true, regardless of whether connections is empty.
               Also added backdrop click to close. */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            // FIX: Only close when clicking the backdrop itself, not the card.
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="connection-modal">
            {/* Header */}

            <div className="connection-modal-header">
              <div>
                <span className="connection-chip">NEW CONNECTION</span>

                <h2>Add Database Connection</h2>

                <p>
                  Configure a PostgreSQL connection that can be used by the
                  migration engine.
                </p>
              </div>

              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

            {/* Body */}

            <div className="connection-modal-body">
              <div className="connection-grid">
                <div className="form-group">
                  <label>Connection Name</label>

                  <FormField
                    placeholder="Production Database"
                    value={form.name}
                    onChange={handleChange("name")}
                    error={formErrors.name}
                  />
                </div>

                <div className="form-group">
                  <label>Host</label>

                  <FormField
                    placeholder="localhost"
                    value={form.host}
                    onChange={handleChange("host")}
                    error={formErrors.host}
                  />
                </div>

                <div className="form-group">
                  <label>Port</label>

                  <FormField
                    placeholder="5432"
                    type="number"
                    value={form.port}
                    onChange={handleChange("port")}
                    error={formErrors.port}
                  />
                </div>

                <div className="form-group">
                  <label>Database</label>

                  <FormField
                    placeholder="migration_db"
                    value={form.database}
                    onChange={handleChange("database")}
                    error={formErrors.database}
                  />
                </div>

                <div className="form-group">
                  <label>Username</label>

                  <FormField
                    placeholder="postgres"
                    value={form.username}
                    onChange={handleChange("username")}
                    error={formErrors.username}
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>

                  <FormField
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange("password")}
                    error={formErrors.password}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Schema</label>

                  <FormField
                    placeholder="public"
                    value={form.schema}
                    onChange={handleChange("schema")}
                    error={formErrors.schema}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="connection-modal-footer">
              <button className="secondary-btn" onClick={closeModal}>
                Cancel
              </button>

              <button
                className="outline-btn"
                onClick={testConnection}
                disabled={testing}
              >
                {testing ? "Testing..." : "Test Connection"}
              </button>

              <button
                className="primary-btn"
                onClick={saveConnection}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Connection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── FORM FIELD HELPER ───────────────────────────────────────────────────────
// FIX: Extracted repeated input+error markup into a small helper so the modal
//      doesn't repeat the same pattern 7 times with no error display.
const FormField = ({ placeholder, type = "text", value, onChange, error }) => (
  <div className="modern-field">
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={error ? "input-error" : ""}
    />

    {error && <span className="field-error">{error}</span>}
  </div>
);

export default Connections;
