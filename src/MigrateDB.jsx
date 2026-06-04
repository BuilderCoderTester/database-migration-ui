import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

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

const API =
  "http://localhost:8081/api/migrations";

// =====================================================
// SAFE JSON
// =====================================================

const safeJson = async (response) => {

  try {

    const text = await response.text();

    if (!text || text.trim() === "") {
      return [];
    }

    return JSON.parse(text);

  } catch (err) {

    console.error(
      "JSON Parse Error:",
      err
    );

    return [];
  }
};

// =====================================================
// TOOLBAR BUTTON
// =====================================================

const ToolbarButton = ({
  icon,
  label,
  variant,
  onClick,
  disabled,
}) => (

  <button
    onClick={onClick}
    disabled={disabled}
    className={`toolbar-btn${variant ? ` ${variant}` : ""
      }`}
  >
    {icon}
    {label}
  </button>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

const MigrateDB = () => {

  const [activeTab, setActiveTab] =
    useState("Migrations");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [stats, setStats] =
    useState([]);

  const [history, setHistory] =
    useState([]);

  const [pendingList, setPendingList] =
    useState([]);

  const [tables, setTables] =
    useState([]);

  const [selectedTable, setSelectedTable] =
    useState(null);

  const [tableData, setTableData] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(false);

  const [showCreatePanel, setShowCreatePanel] =
    useState(false);

  const [activeView, setActiveView] =
    useState("all");

  const [upSql, setUpSql] =
    useState(
      "-- Write your UP SQL here\n"
    );

  const [downSql, setDownSql] =
    useState(
      "-- Write your DOWN SQL here\n"
    );

  const [migrationName, setMigrationName] =
    useState("");

  const [migrationVersion, setMigrationVersion] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = useCallback(
    async () => {

      try {

        const res = await fetch(
          `${API}/get-connection`
        );

        const connectionId =
          await safeJson(res);

        if (!connectionId) return;

        const [historyRes, pendingRes] =
          await Promise.all([
            fetch(
              `${API}/history?connectionId=${connectionId}`
            ),

            fetch(
              `${API}/pending?connectionId=${connectionId}`
            ),
          ]);

        const historyData =
          await safeJson(historyRes);

        const pendingData =
          await safeJson(pendingRes);

        const safeHistory =
          Array.isArray(historyData)
            ? historyData
            : [];

        const safePending =
          Array.isArray(pendingData)
            ? pendingData
            : [];

        setHistory(safeHistory);

        setPendingList(safePending);

        const applied =
          safeHistory.length;

        const failed =
          safeHistory.filter(
            (m) => m.success === false
          ).length;

        const pending =
          safePending.length;

        const total =
          applied + pending;

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

          {
            label: "Failed",
            value: failed,
            sub: "errors",
            color: "stat-red",
          },
        ]);

      } catch (err) {

        console.error(err);

        setHistory([]);
        setPendingList([]);
      }
    },
    []
  );

  // =====================================================
  // LOAD TABLES
  // =====================================================

  const loadTables = async () => {

    try {

      const res = await fetch(
        `${API}/tables`
      );

      if (!res.ok) {
        setTables([]);
        return;
      }

      const data =
        await safeJson(res);

      setTables(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(err);

      setTables([]);
    }
  };

  // =====================================================
  // LOAD TABLE DATA
  // =====================================================

  const loadTableData = async (
    tableName
  ) => {

    try {

      setSelectedTable(tableName);

      const res = await fetch(
        `${API}/table-data/${tableName}`
      );

      const data =
        await safeJson(res);

      setTableData(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(err);

      setTableData([]);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadData();
    loadTables();

  }, [loadData]);

  // =====================================================
  // MIGRATE
  // =====================================================

  const handleMigrate = async () => {

    try {

      const resp = await fetch(
        `${API}/get-connection`
      );

      const connectionId =
        await safeJson(resp);


      setLoading(true);

      await fetch(
        `${API}/migrate?connectionId=${connectionId}`,
        {
          method: "POST",
        }
      );

      await loadData();
      await loadTables();

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // ROLLBACK
  // =====================================================

  const handleRollback = async () => {

    try {

      const resp = await fetch(
        `${API}/get-connection`
      );

      const connectionId =
        await safeJson(resp);


      await fetch(
        `${API}/rollback?connectionId=${connectionId}`,
        {
          method: "POST",
        }
      );

      await loadData();
      await loadTables();

    } catch (err) {

      console.error(err);
    }
  };

  // =====================================================
  // VALIDATE
  // =====================================================

  const handleValidate = async () => {

    try {

      await fetch(
        `${API}/validate`,
        {
          method: "POST",
        }
      );

    } catch (err) {

      console.error(err);
    }
  };

  // =====================================================
  // REPAIR
  // =====================================================

  const handleRepair = async () => {

    try {

      await fetch(
        `${API}/repair`,
        {
          method: "POST",
        }
      );

      await loadData();

    } catch (err) {

      console.error(err);
    }
  };

  // =====================================================
  // CREATE MIGRATION
  // =====================================================

  const createMigration = async () => {

    if (
      !migrationName ||
      !migrationVersion
    ) {

      alert(
        "Please fill all fields"
      );

      return;
    }

    try {

      setCreating(true);

      const params =
        new URLSearchParams();

      params.append(
        "version",
        migrationVersion
      );

      params.append(
        "description",
        migrationName
      );

      params.append(
        "migrateUp",
        upSql
      );

      params.append(
        "migrateDown",
        downSql
      );

      await fetch(
        `${API}/create`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: params.toString(),
        }
      );

      await loadData();

      setMigrationName("");
      setMigrationVersion("");

      setUpSql(
        "-- Write your UP SQL here\n"
      );

      setDownSql(
        "-- Write your DOWN SQL here\n"
      );

      setShowCreatePanel(false);

    } catch (err) {

      console.error(err);

    } finally {

      setCreating(false);
    }
  };

  // =====================================================
  // FILTER DATA
  // =====================================================

  const normalizedPending =
    (
      Array.isArray(pendingList)
        ? pendingList
        : []
    ).map((m) => ({
      ...m,
      success: null,
      appliedOn: null,
      duration: null,
    }));

  const migrationData =
    activeView === "pending"
      ? normalizedPending
      : activeView === "applied"
        ? (
          Array.isArray(history)
            ? history
            : []
        )
        : [
          ...normalizedPending,
          ...(
            Array.isArray(history)
              ? history
              : []
          ),
        ];

  const filteredData =
    (
      Array.isArray(migrationData)
        ? migrationData
        : []
    ).filter((m) => {

      if (!searchQuery.trim()) {
        return true;
      }

      const q =
        searchQuery.toLowerCase();

      return (
        m.description
          ?.toLowerCase()
          .includes(q) ||

        String(m.version)
          ?.toLowerCase()
          .includes(q)
      );
    });

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className={`migrate-container${darkMode ? " dark" : ""
        }`}
    >

      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        onToggleTheme={() =>
          setDarkMode(
            (prev) => !prev
          )
        }
      />

      <div className="layout">

        <Sidebar
          active={activeView}

          onAllClick={() =>
            setActiveView("all")
          }

          onPendingClick={() =>
            setActiveView("pending")
          }

          onAppliedClick={() =>
            setActiveView("applied")
          }

          onConnectionsClick={() =>
            setActiveView("connections")
          }

          onTablesClick={() =>
            setActiveView("tables")
          }
        />

        <main className="main-content">

          {/* CONNECTIONS */}

          {
            activeView === "connections"
              ? (
                <Connections />
              ) : activeView === "tables"
                ? (

                  // TABLES VIEW

                  <div className="tables-layout">

                    <div className="tables-sidebar">

                      <h3>
                        Database Tables
                      </h3>

                      {
                        (
                          Array.isArray(tables)
                            ? tables
                            : []
                        ).map(
                          (table, index) => (

                            <button
                              key={index}

                              className={`table-item ${selectedTable === table
                                ? "active"
                                : ""
                                }`}

                              onClick={() =>
                                loadTableData(table)
                              }
                            >
                              {table}
                            </button>
                          ))
                      }
                    </div>

                    <div className="tables-content">

                      <h2>
                        {selectedTable || "Select Table"}
                      </h2>

                      {
                        Array.isArray(tableData) &&
                          tableData.length > 0
                          ? (

                            <div className="table-container">

                              <table className="migration-table">

                                <thead>
                                  <tr>
                                    {
                                      Object.keys(tableData[0]).map((col) => (
                                        <th key={col}>{col}</th>
                                      ))
                                    }
                                  </tr>
                                </thead>

                                <tbody>
                                  {
                                    tableData.map((row, rowIndex) => (
                                      <tr key={rowIndex}>
                                        {
                                          Object.values(row).map((value, colIndex) => (
                                            <td key={colIndex}>
                                              {String(value)}
                                            </td>
                                          ))
                                        }
                                      </tr>
                                    ))
                                  }
                                </tbody>

                              </table>

                            </div>

                          ) : (

                            <div className="table-details-card">

                              <h2>
                                {selectedTable || "Select Table"}
                              </h2>

                              <p
                                style={{
                                  color: "#9ca3af",
                                  marginTop: "12px"
                                }}
                              >
                                No data available
                              </p>

                            </div>

                          )
                      }

                    </div>
                  </div>

                ) : (

                  <>
                    {/* TOOLBAR */}

                    <div className="topnav">

                      <span className="toolbar-title">

                        {
                          activeView === "pending"
                            ? "Pending Migrations"
                            : activeView === "applied"
                              ? "Applied Migrations"
                              : "All Migrations"
                        }
                      </span>

                      <ToolbarButton
                        icon={<Plus size={14} />}
                        label="New Migration"

                        onClick={() =>
                          setShowCreatePanel(
                            !showCreatePanel
                          )
                        }
                      />

                      <ToolbarButton
                        icon={
                          <ShieldCheck
                            size={14}
                          />
                        }

                        label="Validate"

                        onClick={
                          handleValidate
                        }
                      />

                      <ToolbarButton
                        icon={
                          <RotateCcw
                            size={14}
                          />
                        }

                        label="Rollback"

                        variant="red"

                        onClick={
                          handleRollback
                        }
                      />

                      <div className="spacer" />

                      <ToolbarButton
                        icon={
                          <Wrench size={14} />
                        }

                        label="Repair"

                        variant="green"

                        onClick={
                          handleRepair
                        }
                      />

                      <ToolbarButton
                        icon={
                          <ArrowDownToLine
                            size={14}
                          />
                        }

                        label={
                          loading
                            ? "Migrating..."
                            : "Migrate Now"
                        }

                        variant="blue"

                        onClick={
                          handleMigrate
                        }

                        disabled={loading}
                      />
                    </div>

                    {/* STATS */}

                    <div className="stats-grid">

                      {
                        stats.map(
                          (stat, i) => (

                            <StatCard
                              key={i}
                              {...stat}
                            />
                          ))
                      }
                    </div>

                    {/* CONTENT */}

                    <div className="content-area">

                      {/* CREATE PANEL */}

                      <div
                        className={`create-panel ${showCreatePanel
                          ? "open"
                          : ""
                          }`}
                      >

                        <h3>
                          Create New Migration
                        </h3>

                        <input
                          className="input"

                          placeholder="Migration Name"

                          value={migrationName}

                          onChange={(e) =>
                            setMigrationName(
                              e.target.value
                            )
                          }
                        />

                        <input
                          className="input"

                          placeholder="Version"

                          value={migrationVersion}

                          onChange={(e) =>
                            setMigrationVersion(
                              e.target.value
                            )
                          }
                        />

                        <Editor
                          height="160px"

                          defaultLanguage="sql"

                          theme={
                            darkMode
                              ? "vs-dark"
                              : "light"
                          }

                          value={upSql}

                          onChange={(v) =>
                            setUpSql(v || "")
                          }
                        />

                        <Editor
                          height="160px"

                          defaultLanguage="sql"

                          theme={
                            darkMode
                              ? "vs-dark"
                              : "light"
                          }

                          value={downSql}

                          onChange={(v) =>
                            setDownSql(v || "")
                          }
                        />

                        <div className="panel-actions">

                          <button
                            className="btn"

                            onClick={() =>
                              setShowCreatePanel(
                                false
                              )
                            }
                          >
                            Cancel
                          </button>

                          <button
                            className="btn primary"

                            onClick={
                              createMigration
                            }

                            disabled={creating}
                          >
                            {
                              creating
                                ? "Creating..."
                                : "Create Migration"
                            }
                          </button>
                        </div>
                      </div>

                      {/* CONTENT HEADER */}

                      <div className="content-header">

                        <span>
                          {
                            activeView === "pending"
                              ? "Pending Migrations"
                              : activeView === "applied"
                                ? "Applied Migrations"
                                : "All Migrations"
                          }
                        </span>

                        <span className="badge">
                          {
                            filteredData.length
                          } total
                        </span>

                        <div className="search-box">

                          <Search
                            size={12}
                            className="search-icon"
                          />

                          <input
                            value={searchQuery}

                            onChange={(e) =>
                              setSearchQuery(
                                e.target.value
                              )
                            }

                            placeholder="Search migrations..."
                          />
                        </div>
                      </div>

                      {/* TABLE */}

                      <MigrationTable
                        searchQuery={
                          searchQuery
                        }

                        data={filteredData}
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

export default MigrateDB;