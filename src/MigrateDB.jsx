import React, { useEffect, useState } from "react";
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

const API = "http://localhost:8080/api/migrations";

const MigrateDB = () => {
  const [activeTab, setActiveTab] = useState("Migrations");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState([]);
  const [history, setHistory] = useState([]);
  const [pendingList, setPendingList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showPendingPanel, setShowPendingPanel] = useState(false);
  const [activeView, setActiveView] = useState("all");
  const [Upsql, setUpSql] = useState("-- Write your UP SQL here\n");
  const [Downsql, setDownSql] = useState("-- Write your DOWN SQL here\n");

  const [migrationName, setMigrationName] = useState("");
  const [migrationVersion, setMigrationVersion] = useState("");

  const [creating, setCreating] = useState(false);

  // ─── LOAD DATA ───────────────────────────────
  const loadData = async () => {
    try {
      const [historyRes, pendingRes] = await Promise.all([
        fetch(`${API}/history`),
        fetch(`${API}/pending`),
      ]);

      const historyData = await historyRes.json();
      const pendingData = await pendingRes.json();

      setHistory(historyData);
      setPendingList(pendingData);

      const applied = historyData.length;
      const failed = historyData.filter((m) => !m.success).length;
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
      console.error("Failed to load data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── ACTIONS ────────────────────────────────
  const handleMigrate = async () => {
    try {
      setLoading(true);
      await fetch(`${API}/migrate`, { method: "POST" });
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    await fetch(`${API}/rollback`, { method: "POST" });
    loadData();
  };

  const handleValidate = async () => {
    await fetch(`${API}/validate`, { method: "POST" });
  };

  const handleRepair = async () => {
    await fetch(`${API}/repair`, { method: "POST" });
    loadData();
  };

  const toggleCreatePanel = () => {
    setShowCreatePanel((prev) => !prev);
  };

  // ─── CREATE MIGRATION ───────────────────────
  const createMigration = async () => {
    if (creating) return;

    try {
      if (!migrationName.trim()) return alert("Migration name required");
      if (!migrationVersion.trim()) return alert("Version required");
      if (!Upsql.trim()) return alert("UP SQL required");
      if (!Downsql.trim()) return alert("DOWN SQL required");

      setCreating(true);

      const params = new URLSearchParams();
      params.append("version", migrationVersion);
      params.append("description", migrationName);
      params.append("migrateUp", Upsql);
      params.append("migrateDown", Downsql);

      const res = await fetch(`${API}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!res.ok) throw new Error();

      await loadData();

      setMigrationName("");
      setMigrationVersion("");
      setUpSql("-- Write your UP SQL here\n");
      setDownSql("-- Write your DOWN SQL here\n");
      setShowCreatePanel(false);
    } catch {
      alert("Failed to create migration");
    } finally {
      setCreating(false);
    }
  };

  // ─── NORMALIZE PENDING DATA (IMPORTANT FIX) ───
  const normalizedPending = pendingList.map((m) => ({
    ...m,
    success: false,
    appliedOn: null,
    duration: null,
  }));

  const tableData =
    activeView === "pending"
      ? normalizedPending
      : activeView === "applied"
        ? history
        : [...normalizedPending, ...history];

  // ─── RENDER ────────────────────────────────
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
          onConnectionsClick={() => setActiveView("connections")} // 🔥 ADD THIS
          pendingCount={pendingList.length}
        />
        <main className="main-content">
          {/* ONLY SHOW TOOLBAR FOR MIGRATIONS */}
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
                label={loading ? "Migrating..." : "Migrate Now"}
                variant="blue"
                onClick={handleMigrate}
              />
            </div>
          )}

          {/* SWITCH VIEW */}
          {activeView === "connections" ? (
            <Connections />
          ) : (
            <>
              {/* STATS (ONLY ONCE) */}
              <div className="stats-grid">
                {stats.map((stat, i) => (
                  <StatCard key={i} {...stat} />
                ))}
              </div>

              <div className="content-area">
                {/* CREATE PANEL */}
                <div
                  className={`create-panel ${showCreatePanel ? "open" : ""}`}
                >
                  <h3>Create New Migration</h3>

                  <input
                    className="input"
                    placeholder="Migration Name"
                    value={migrationName}
                    onChange={(e) => setMigrationName(e.target.value)}
                  />

                  <input
                    className="input"
                    placeholder="Migration version"
                    value={migrationVersion}
                    onChange={(e) => setMigrationVersion(e.target.value)}
                  />

                  <div className="editor-container">
                    <Editor
                      height="200px"
                      defaultLanguage="sql"
                      theme="vs-dark"
                      value={Upsql}
                      onChange={(v) => setUpSql(v || "")}
                    />
                    <Editor
                      height="200px"
                      defaultLanguage="sql"
                      theme="vs-dark"
                      value={Downsql}
                      onChange={(v) => setDownSql(v || "")}
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
                      {creating ? "Creating..." : "Create Migration"}
                    </button>
                  </div>
                </div>

                {/* HEADER */}
                <div className="content-header">
                  <span>
                    {activeView === "pending"
                      ? "Pending Migrations"
                      : activeView === "applied"
                        ? "Applied Migrations"
                        : "All Migrations"}
                  </span>

                  <span className="badge">{tableData.length} total</span>

                  <div className="search-box">
                    <Search size={14} />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                    />
                  </div>
                </div>

                <MigrationTable
                  key={activeView}
                  searchQuery={searchQuery}
                  data={tableData}
                />
              </div>
            </>
          )}
        </main>

        <ActivityLog />
      </div>
    </div>
  );
};

const ToolbarButton = ({ icon, label, variant, onClick }) => (
  <button onClick={onClick} className={`toolbar-btn ${variant || ""}`}>
    {icon} {label}
  </button>
);

export default MigrateDB;
