import React, { useMemo, useState } from "react";

import MigrationToolbar from "./MigrationToolbar";
import MigrationFilters from "./MigrationFilters";

import MigrationTable from "./MigrationTable";
import ManualMigrationPanel from "./ManualMigrationPanel";
import MigrationScriptEditor from "./MigrationScriptEditor";
import AutomatedMigrationBuilder from "../builder/AutomatedMigrationBuilder";

import "../../styles/toggle/migration/MigrationScriptsPage.css";

const MigrationScriptsPage = ({
  activeView,

  searchQuery,
  setSearchQuery,

  filteredData,

  darkMode,

  // Manual Migration
  showManualPanel,
  migrationName,
  setMigrationName,
  migrationVersion,
  upSql,
  downSql,
  setUpSql,
  setDownSql,
  creating,
  createMigration,
  setShowManualPanel,

  // Automated Builder
  showAutoBuilder,
  setShowAutoBuilder,

  // Script Editor
  showScriptEditor,
  selectedMigration,
  editUpSql,
  editDownSql,
  setEditUpSql,
  setEditDownSql,
  saveMigrationScript,
  setShowScriptEditor,

  // Table callbacks
  openMigrationScript,
  loadData,
}) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("version-desc");
  const tableData = useMemo(() => {
    let data = [...filteredData];

    // Status Filter
    if (statusFilter === "pending") {
      data = data.filter((m) => m.success === null);
    } else if (statusFilter === "applied") {
      data = data.filter((m) => m.success === true);
    } else if (statusFilter === "failed") {
      data = data.filter((m) => m.success === false);
    }

    // Sorting
    switch (sortBy) {
      case "version-asc":
        data.sort((a, b) => a.version.localeCompare(b.version));
        break;

      case "version-desc":
        data.sort((a, b) => b.version.localeCompare(a.version));
        break;

      case "name-asc":
        data.sort((a, b) =>
          (a.description || "").localeCompare(b.description || ""),
        );
        break;

      case "name-desc":
        data.sort((a, b) =>
          (b.description || "").localeCompare(a.description || ""),
        );
        break;

      default:
        break;
    }

    return data;
  }, [filteredData, statusFilter, sortBy]);
  return (
    <div className="migration-scripts-page">
      {/* Manual Migration */}

      {showManualPanel && (
        <ManualMigrationPanel
          darkMode={darkMode}
          migrationName={migrationName}
          setMigrationName={setMigrationName}
          migrationVersion={migrationVersion}
          upSql={upSql}
          downSql={downSql}
          setUpSql={setUpSql}
          setDownSql={setDownSql}
          creating={creating}
          onClose={() => setShowManualPanel(false)}
          onCreate={createMigration}
        />
      )}

      {/* Automated Builder */}

      {showAutoBuilder && (
        <AutomatedMigrationBuilder
          darkMode={darkMode}
          onClose={() => setShowAutoBuilder(false)}
          onCreated={() => {
            setShowAutoBuilder(false);
            loadData();
          }}
        />
      )}

      {/* Toolbar */}

      <MigrationToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        total={filteredData.length}
        onNewMigration={() => setShowManualPanel(true)}
        onRefresh={loadData}
        onImport={() => {}}
        onExport={() => {}}
      />

      <MigrationFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Table */}

      <MigrationTable
        searchQuery={searchQuery}
        data={tableData}
        onInfoClick={openMigrationScript}
        onRepairSuccess={loadData}
        onDeleteSuccess={loadData}
      />

      {/* Editor */}

      {showScriptEditor && (
        <MigrationScriptEditor
          migration={selectedMigration}
          upSql={editUpSql}
          downSql={editDownSql}
          setUpSql={setEditUpSql}
          setDownSql={setEditDownSql}
          darkMode={darkMode}
          onClose={() => setShowScriptEditor(false)}
          onSave={saveMigrationScript}
        />
      )}
    </div>
  );
};

export default MigrationScriptsPage;
