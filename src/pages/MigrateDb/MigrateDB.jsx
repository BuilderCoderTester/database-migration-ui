import React, { useEffect, useState, useCallback } from "react";

import "../styles/theme.css";
import "../styles/utilities/layout.css";
import "../styles/base/components.css";

import { API } from "../constants/api";
import { safeJson } from "../utils/http";

/* ===========================
   Layout
=========================== */

import TopNav from "./layout/TopNav";
import Sidebar from "./layout/Sidebar";

import DashboardPage from "./dashboard/Dashboard";
import MigrationScriptsPage from "./migration/MigrationScriptsPage";
/* ===========================
   Migration
=========================== */

import MigrationTypeModal from "./migration/MigrationTypeModal";
import AutomatedMigrationBuilder from "./builder/AutomatedMigrationBuilder";

/* ===========================
   Views
=========================== */

import Connections from "./database/Connections";
import RunHistory from "./history/RunHistory";
import TablesView from "./database/Tables";

/* ===========================
   Hooks
=========================== */

import useMigration from "../hooks/useMigration";
import useManualMigration from "../hooks/useManualMigration";
import useMigrationEditor from "../hooks/useMigrationEditor";
import { getConnectionId } from "../hooks/useConnection";

import ActivityLogsPage from "./activity/ActivityLogsPage";

import DriverManagerPage from "./system/DriverManagerPage";
import MigrationPathsPage from "./system/MigrationPathsPage";
import DatabaseTypesPage from "./system/DatabaseTypesPage";
import SettingsPage from "./system/SettingsPage";
import AboutPage from "./system/AboutPage";

// =====================================================
// MAIN COMPONENT
// =====================================================

const MigrateDB = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState([]);
  const [history, setHistory] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [showMigrationTypeModal, setShowMigrationTypeModal] = useState(false);
  const [showAutoBuilder, setShowAutoBuilder] = useState(false);

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = useCallback(async () => {
    try {
      const connectionId = await getConnectionId();
      if (!connectionId) return;

      const [historyRes, pendingRes] = await Promise.all([
        fetch(`${API}/history?connectionId=${connectionId}`),
        fetch(`${API}/pending?connectionId=${connectionId}`),
      ]);

      const historyData = await safeJson(historyRes);
      const pendingData = await safeJson(pendingRes);

      const safeHistory = Array.isArray(historyData) ? historyData : [];
      const safePending = Array.isArray(pendingData) ? pendingData : [];

      setHistory(safeHistory);
      setPendingList(safePending);

      const applied = safeHistory.length;
      const failed = safeHistory.filter((m) => m.success === false).length;
      const pending = safePending.length;
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
      ]);
    } catch (err) {
      console.error(err);
      setHistory([]);
      setPendingList([]);
    }
  }, []);

  // =====================================================
  // LOAD TABLES
  // =====================================================

  const loadTables = useCallback(async () => {
    try {
      const connectionId = await getConnectionId();
      const res = await fetch(`${API}/tables?connectionId=${connectionId}`);
      if (!res.ok) {
        setTables([]);
        return;
      }
      const data = await safeJson(res);
      setTables(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTables([]);
    }
  }, []);

  // =====================================================
  // LOAD TABLE DATA
  // =====================================================
  const {
    loading,
    handleMigrate,
    handleRollback,
    handleValidate,
    handleRepair,
  } = useMigration(getConnectionId, loadData, loadTables);
  const {
    migrationName,
    setMigrationName,
    migrationVersion,
    upSql,
    setUpSql,
    downSql,
    setDownSql,
    creating,
    showManualPanel,
    setShowManualPanel,
    createMigration,
  } = useManualMigration(loadData);
  const {
    selectedMigration,
    showScriptEditor,
    editUpSql,
    editDownSql,
    setEditUpSql,
    setEditDownSql,
    setShowScriptEditor,
    openMigrationScript,
    saveMigrationScript,
  } = useMigrationEditor(loadData, getConnectionId);
  const loadTableData = async (tableName) => {
    try {
      const connectionId = await getConnectionId();
      setSelectedTable(tableName);
      const res = await fetch(
        `${API}/table/${tableName}?connectionId=${connectionId}`,
      );
      const data = await safeJson(res);
      console.log("Table Data:", data);
      setTableData(data);
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
  }, [loadData, loadTables]);


  const normalizedPending = pendingList.map((migration) => ({
    ...migration,
    success: null,
    appliedOn: null,
    duration: null,
  }));

  let migrationData = [];

  switch (activeView) {
    case "pending":
      migrationData = normalizedPending;
      break;

    case "applied":
      migrationData = history;
      break;

    case "scripts":
    default:
      migrationData = [...normalizedPending, ...history];
  }

  const filteredData = migrationData.filter((migration) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    return (
      migration.description?.toLowerCase().includes(query) ||
      migration.version?.toString().toLowerCase().includes(query)
    );
  });

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className={`migrate-container${darkMode ? " dark" : ""}`}>
      <TopNav
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
      />

      <div className="layout">
        <Sidebar
          active={activeView}
          onDashboardClick={() => setActiveView("dashboard")}
          onScriptsClick={() => setActiveView("scripts")}
          onPendingClick={() => setActiveView("pending")}
          onAppliedClick={() => setActiveView("applied")}
          onRunHistoryClick={() => setActiveView("runHistory")}
          onConnectionsClick={() => setActiveView("connections")}
          onTablesClick={() => setActiveView("tables")}
          onActivityClick={() => setActiveView("activity")}
          onDriversClick={() => setActiveView("drivers")}
          onMigrationPathsClick={() => setActiveView("migrationPaths")}
          onDatabaseTypesClick={() => setActiveView("databaseTypes")}
          onSettingsClick={() => setActiveView("settings")}
          onAboutClick={() => setActiveView("about")}
        />

        <main className="main-content">
          {/* Dashboard */}
          {activeView === "dashboard" && (
            <DashboardPage
              loading={loading}
              stats={stats}
              history={history}
              pending={pendingList}
              onMigrate={handleMigrate}
              onRollback={handleRollback}
              onValidate={handleValidate}
              onRepair={handleRepair}
              onNewMigration={() => setShowMigrationTypeModal(true)}
            />
          )}

          {/* Migration Scripts */}
          {(activeView === "scripts" ||
            activeView === "pending" ||
            activeView === "applied") && (
            <MigrationScriptsPage
              activeView={activeView}
              darkMode={darkMode}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredData={filteredData}
              showManualPanel={showManualPanel}
              setShowManualPanel={setShowManualPanel}
              migrationName={migrationName}
              setMigrationName={setMigrationName}
              migrationVersion={migrationVersion}
              upSql={upSql}
              setUpSql={setUpSql}
              downSql={downSql}
              setDownSql={setDownSql}
              creating={creating}
              createMigration={createMigration}
              showAutoBuilder={showAutoBuilder}
              setShowAutoBuilder={setShowAutoBuilder}
              showScriptEditor={showScriptEditor}
              selectedMigration={selectedMigration}
              editUpSql={editUpSql}
              editDownSql={editDownSql}
              setEditUpSql={setEditUpSql}
              setEditDownSql={setEditDownSql}
              saveMigrationScript={saveMigrationScript}
              setShowScriptEditor={setShowScriptEditor}
              openMigrationScript={openMigrationScript}
              loadData={loadData}
            />
          )}

          {/* Run History */}
          {activeView === "runHistory" && <RunHistory />}

          {/* Connections */}
          {activeView === "connections" && <Connections />}

          {/* Tables */}
          {activeView === "tables" && (
            <TablesView
              tables={tables}
              selectedTable={selectedTable}
              tableData={tableData}
              onSelectTable={loadTableData}
            />
          )}
          {activeView === "activity" && <ActivityLogsPage />}
          {activeView === "drivers" && <DriverManagerPage />}

          {activeView === "migrationPaths" && <MigrationPathsPage />}

          {activeView === "databaseTypes" && <DatabaseTypesPage />}

          {activeView === "settings" && <SettingsPage />}

          {activeView === "about" && <AboutPage />}
        </main>
      </div>

      <MigrationTypeModal
        isOpen={showMigrationTypeModal}
        onClose={() => setShowMigrationTypeModal(false)}
        onManual={() => {
          setShowMigrationTypeModal(false);
          setShowManualPanel(true);
        }}
        onAutomated={() => {
          setShowMigrationTypeModal(false);
          setShowAutoBuilder(true);
        }}
      />
    </div>
  );
};

export default MigrateDB;
