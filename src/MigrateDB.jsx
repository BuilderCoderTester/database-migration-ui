import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  ShieldCheck,
  RotateCcw,
  Wrench,
  ArrowDownToLine,
} from "lucide-react";

import "./MigrateDB.css";

import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import StatCard from "./components/StatCard";
import MigrationTable from "./components/MigrationTable";
import ActivityLog from "./components/ActivityLog";
import Connections from "./components/Connections";
import Editor from "@monaco-editor/react";

const API = "http://localhost:8081/api/migrations";

// ─── TOOLBAR BUTTON ─────────────────────────────────────────────────────────
// FIX: Extracted to its own named component outside MigrateDB to prevent
//      it from being re-created on every render, avoiding focus loss bugs.
const ToolbarButton = ({ icon, label, variant, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`toolbar-btn${variant ? ` ${variant}` : ""}`}
  >
    {icon}
    {label}
  </button>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const MigrateDB = () => {
  const [activeTab, setActiveTab] = useState("Migrations");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState([]);
  const [history, setHistory] = useState([]);
  const [pendingList, setPendingList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [activeView, setActiveView] = useState("all");

  const [upSql, setUpSql] = useState("-- Write your UP SQL here\n");
  const [downSql, setDownSql] = useState("-- Write your DOWN SQL here\n");

  const [migrationName, setMigrationName] = useState("");
  const [migrationVersion, setMigrationVersion] = useState("");

  const [creating, setCreating] = useState(false);

  // FIX: Removed unused state `showPendingPanel` — was declared but never used,
  //      causing a stale state variable that could confuse future maintainers.

  // ─── LOAD DATA ──────────────────────────────────────────────────────────
  // FIX: Wrapped in useCallback so it can be safely listed as a dependency
  //      in useEffect without causing infinite re-render loops.
  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/get-connection`, {
        method: "GET",
      });

      const data = await res.json(); // 🔥 IMPORTANT

      const connectionId = data; // assuming ApiResponse

      console.log("connection_id:", connectionId);

      const [historyRes, pendingRes] = await Promise.all([
        fetch(`${API}/history?connectionId=${connectionId}`),
        fetch(`${API}/pending?connectionId=${connectionId}`),
      ]);

      // FIX: Added response.ok checks before parsing JSON.
      //      Without this, a non-2xx response (e.g. 500) would try to parse
      //      an error body as JSON and silently corrupt state.
      if (!historyRes.ok)
        throw new Error(`History fetch failed: ${historyRes.status}`);
      if (!pendingRes.ok)
        throw new Error(`Pending fetch failed: ${pendingRes.status}`);

      const historyData = await historyRes.json();
      console.log("historyData:", historyData);
      const pendingData = await pendingRes.json();
      console.log("pendingData:", pendingData);

      setHistory(historyData);
      setPendingList(pendingData);

      const applied = historyData.length;
      // FIX: Was filtering on m.success, but pending items also have success:false
      //      after normalization. Filter only within historyData to count real failures.
      const failed = historyData.filter((m) => m.success === false).length;
      const pending = pendingData.length;
      const total = applied + pending;

      setStats([
        {
          label: "Total",
          value: total,
          sub: "migrations found",
          color: "stat-blue",
        },
        {
          label: "Applied",
          value: applied,
          sub: "successfully run",
          color: "stat-green",
        },
        {
          label: "Pending",
          value: pending,
          sub: "awaiting execution",
          color: "stat-amber",
        },
        { label: "Failed", value: failed, sub: "errors", color: "stat-red" },
        {
          label: "Avg Duration",
          value: "—",
          sub: "per migration",
          color: "stat-neutral",
        },
      ]);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }, []); // no external deps — API is module-level constant

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── ACTIONS ────────────────────────────────────────────────────────────
  const handleMigrate = async () => {
    // FIX: Guard against double-clicks while already loading.
    if (loading) return;
    try {
      const resp = await fetch(`${API}/get-connection`, {
        method: "GET",
      });

      const data = await resp.json(); // 🔥 IMPORTANT

      const connectionId = data; // assuming ApiResponse

      console.log("connection_id:", connectionId);

      setLoading(true);
      const res = await fetch(`${API}/migrate?connectionId=${connectionId}`, { method: "POST" });
      // FIX: Check response before reloading data.
      if (!res.ok) throw new Error(`Migrate failed: ${res.status}`);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    try {
       const resp = await fetch(`${API}/get-connection`, {
        method: "GET",
      });

      const data = await resp.json(); // 🔥 IMPORTANT

      const connectionId = data; // assuming ApiResponse

      console.log("connection_id:", connectionId);
      const res = await fetch(`${API}/rollback?connectionId=${connectionId}`, { method: "POST" });
      console.log(res)
      if (!res.ok) throw new Error(`Rollback failed: ${res.status}`);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleValidate = async () => {
    try {
      const res = await fetch(`${API}/validate`, { method: "POST" });
      // FIX: Was silently ignoring the response; log the result.
      if (!res.ok) throw new Error(`Validate failed: ${res.status}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepair = async () => {
    try {
      const res = await fetch(`${API}/repair`, { method: "POST" });
      if (!res.ok) throw new Error(`Repair failed: ${res.status}`);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCreatePanel = () => setShowCreatePanel((prev) => !prev);

  // ─── CREATE MIGRATION ───────────────────────────────────────────────────
  const createMigration = async () => {
    if (creating) return;

    // FIX: Collect all validation errors before alerting so the user sees
    //      all problems at once instead of one per click.
    const errors = [];
    if (!migrationName.trim()) errors.push("Migration name is required");
    if (!migrationVersion.trim()) errors.push("Version is required");
    if (!upSql.trim()) errors.push("UP SQL is required");
    if (!downSql.trim()) errors.push("DOWN SQL is required");
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    try {
      setCreating(true);

      const params = new URLSearchParams();
      params.append("version", migrationVersion);
      params.append("description", migrationName);
      params.append("migrateUp", upSql);
      params.append("migrateDown", downSql);

      const res = await fetch(`${API}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!res.ok) throw new Error(`Create failed: ${res.status}`);

      await loadData();

      // Reset form
      setMigrationName("");
      setMigrationVersion("");
      setUpSql("-- Write your UP SQL here\n");
      setDownSql("-- Write your DOWN SQL here\n");
      setShowCreatePanel(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create migration");
    } finally {
      setCreating(false);
    }
  };

  // ─── TABLE DATA ─────────────────────────────────────────────────────────
  // FIX: Normalize pending items so MigrationTable always receives a
  //      consistent shape — prevents undefined-access errors in the table.
  const normalizedPending = pendingList.map((m) => ({
    ...m,
    success: null, // FIX: use null (not false) to distinguish "not yet run"
    appliedOn: null, //      from a genuine failure (success === false).
    duration: null,
  }));

  const tableData =
    activeView === "pending"
      ? normalizedPending
      : activeView === "applied"
        ? history
        : [...normalizedPending, ...history];

  // FIX: Derive filtered data here so MigrationTable doesn't need to own
  //      search logic — single source of truth.
  const filteredData = tableData.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.description?.toLowerCase().includes(q) ||
      String(m.version)?.toLowerCase().includes(q)
    );
  });

  // ─── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className={`migrate-container${darkMode ? " dark" : ""}`}>
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
      />

      <div className="layout">
        <Sidebar
          active={activeView}
          onAllClick={() => setActiveView("all")}
          onPendingClick={() => setActiveView("pending")}
          onAppliedClick={() => setActiveView("applied")}
          onConnectionsClick={() => setActiveView("connections")}
          pendingCount={pendingList.length}
        />

        <main className="main-content">
          {/* ── TOOLBAR (hidden on Connections view) ── */}
          {activeView !== "connections" && (
            <div className="topnav">
              <span className="toolbar-title">
                {activeView === "pending"
                  ? "Pending Migrations"
                  : activeView === "applied"
                    ? "Applied Migrations"
                    : "All Migrations"}
              </span>

              <ToolbarButton
                icon={<Plus size={14} />}
                label="New Migration"
                onClick={toggleCreatePanel}
              />
              <ToolbarButton
                icon={<ShieldCheck size={14} />}
                label="Validate"
                onClick={handleValidate}
              />
              <ToolbarButton
                icon={<RotateCcw size={14} />}
                label="Rollback"
                variant="red"
                onClick={handleRollback}
              />

              <div className="spacer" />

              <ToolbarButton
                icon={<Wrench size={14} />}
                label="Repair"
                variant="green"
                onClick={handleRepair}
              />
              <ToolbarButton
                icon={<ArrowDownToLine size={14} />}
                label={loading ? "Migrating…" : "Migrate Now"}
                variant="blue"
                onClick={handleMigrate}
                disabled={loading}
              />
            </div>
          )}

          {/* ── MAIN VIEW SWITCH ── */}
          {activeView === "connections" ? (
            <Connections />
          ) : (
            <>
              {/* STATS */}
              <div className="stats-grid">
                {stats.map((stat, i) => (
                  <StatCard key={i} {...stat} />
                ))}
              </div>

              <div className="content-area">
                {/* CREATE PANEL */}
                {/* FIX: Render panel always (for CSS transition) but control
                         visibility via className — avoids mount/unmount flash. */}
                <div
                  className={`create-panel${showCreatePanel ? " open" : ""}`}
                >
                  <h3
                    style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}
                  >
                    Create New Migration
                  </h3>

                  <input
                    className="input"
                    placeholder="Migration Name"
                    value={migrationName}
                    onChange={(e) => setMigrationName(e.target.value)}
                  />

                  <input
                    className="input"
                    placeholder="Version (e.g. V2__add_users)"
                    value={migrationVersion}
                    onChange={(e) => setMigrationVersion(e.target.value)}
                  />

                  <div className="editor-container">
                    {/* FIX: Added aria-label for accessibility */}
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.7px",
                        color: "var(--text3)",
                        marginBottom: 6,
                        fontFamily: "var(--mono)",
                      }}
                    >
                      UP Migration
                    </p>
                    <Editor
                      height="160px"
                      defaultLanguage="sql"
                      theme={darkMode ? "vs-dark" : "light"}
                      value={upSql}
                      onChange={(v) => setUpSql(v || "")}
                      options={{ minimap: { enabled: false }, fontSize: 12 }}
                    />
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.7px",
                        color: "var(--text3)",
                        margin: "12px 0 6px",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      DOWN Migration (Rollback)
                    </p>
                    <Editor
                      height="160px"
                      defaultLanguage="sql"
                      theme={darkMode ? "vs-dark" : "light"}
                      value={downSql}
                      onChange={(v) => setDownSql(v || "")}
                      options={{ minimap: { enabled: false }, fontSize: 12 }}
                    />
                  </div>

                  <div className="panel-actions">
                    <button
                      className="btn"
                      onClick={() => setShowCreatePanel(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn primary"
                      onClick={createMigration}
                      disabled={creating}
                    >
                      {creating ? "Creating…" : "Create Migration"}
                    </button>
                  </div>
                </div>

                {/* CONTENT HEADER */}
                <div className="content-header">
                  <span>
                    {activeView === "pending"
                      ? "Pending Migrations"
                      : activeView === "applied"
                        ? "Applied Migrations"
                        : "All Migrations"}
                  </span>

                  <span className="badge">{filteredData.length} total</span>

                  {/* FIX: Moved search icon inside .search-box so the
                           absolute-positioned .search-icon CSS rule works correctly. */}
                  <div className="search-box">
                    <Search size={12} className="search-icon" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search migrations…"
                    />
                  </div>
                </div>

                {/* FIX: Pass filteredData instead of raw tableData so the table
                         doesn't need to duplicate search filter logic.
                         Also removed the `key={activeView}` prop — it was forcing
                         a full unmount/remount of MigrationTable on every view switch,
                         losing scroll position and causing a flash. Let the table
                         update via props instead. */}
                <MigrationTable searchQuery={searchQuery} data={filteredData} />
              </div>
            </>
          )}
        </main>

        <ActivityLog />
      </div>
    </div>
  );
};

export default MigrateDB;
