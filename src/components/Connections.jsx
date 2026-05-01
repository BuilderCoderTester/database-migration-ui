import React, { useEffect, useState } from "react";

const API = "http://localhost:8080/api/migrations";

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [testing, setTesting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    host: "",
    port: 5432,
    database: "",
    username: "",
    password: "",
    schema: "public",
  });

  // ─── LOAD FROM LOCAL STORAGE ─────────────────
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("connections")) || [];
    const active = localStorage.getItem("activeConnection");

    setConnections(saved);
    setActiveId(active);
  }, []);

  // ─── VALIDATION ─────────────────────────────
  const validate = () => {
    if (!form.name.trim()) return "Name required";
    if (!form.host.trim()) return "Host required";
    if (!form.port) return "Port required";
    if (!form.database.trim()) return "Database required";
    if (!form.username.trim()) return "Username required";
    return null;
  };

  // ─── SAVE CONNECTION ────────────────────────
  const saveConnection = () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    const newConn = {
      id: Date.now().toString(),
      ...form,
      port: Number(form.port), // 🔥 fix type
    };

    const updated = [...connections, newConn];
    setConnections(updated);

    localStorage.setItem("connections", JSON.stringify(updated));

    setForm({
      name: "",
      host: "",
      port: 5432,
      database: "",
      username: "",
      password: "",
      schema: "public",
    });

    setShowModal(false);
  };

  // ─── TEST CONNECTION ────────────────────────
  const testConnection = async () => {
    const error = validate();
    if (error) return alert(error);

    try {
      setTesting(true);

      const res = await fetch(`${API}/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          port: Number(form.port),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Connection successful");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("Connection failed");
    } finally {
      setTesting(false);
    }
  };

  // ─── SET ACTIVE + CONNECT ───────────────────
  const setActive = async (conn) => {
    try {
      const res = await fetch(`${API}/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conn),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Connection failed");
        return;
      }

      setActiveId(conn.id);
      localStorage.setItem("activeConnection", conn.id);

      alert("✅ Connected & Active");
    } catch {
      alert("Connection error");
    }
  };

  // ─── DELETE ────────────────────────────────
  const deleteConnection = (id) => {
    const updated = connections.filter((c) => c.id !== id);
    setConnections(updated);
    localStorage.setItem("connections", JSON.stringify(updated));

    if (id === activeId) {
      setActiveId(null);
      localStorage.removeItem("activeConnection");
    }
  };

  return (
    <div className="connections-page">
      <div className="header">
        <h2>Connections</h2>
        <button onClick={() => setShowModal(true)}>+ Add Connection</button>
      </div>

      <div className="connections-list">
        {connections.map((conn) => (
          <div
            key={conn.id}
            className={`connection-card ${
              activeId === conn.id ? "active" : ""
            }`}
          >
            <h3>{conn.name}</h3>
            <p>{conn.host}:{conn.port}</p>
            <p>{conn.database}</p>

            <div className="actions">
              <button onClick={() => setActive(conn)}>
                {activeId === conn.id ? "Active" : "Set Active"}
              </button>

              <button onClick={() => deleteConnection(conn.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Connection</h3>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Host"
              value={form.host}
              onChange={(e) =>
                setForm({ ...form, host: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Port"
              value={form.port}
              onChange={(e) =>
                setForm({ ...form, port: e.target.value })
              }
            />

            <input
              placeholder="Database"
              value={form.database}
              onChange={(e) =>
                setForm({ ...form, database: e.target.value })
              }
            />

            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <input
              placeholder="Schema"
              value={form.schema}
              onChange={(e) =>
                setForm({ ...form, schema: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>

              <button onClick={testConnection} disabled={testing}>
                {testing ? "Testing..." : "Test"}
              </button>

              <button onClick={saveConnection}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;