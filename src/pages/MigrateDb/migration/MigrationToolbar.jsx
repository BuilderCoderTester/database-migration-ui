import React from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Download,
  Upload,
  FileCode2,
} from "lucide-react";

import "../../styles/toggle/migration/MigrationToolbar.css";

const MigrationToolbar = ({
  searchQuery,
  setSearchQuery,
  total = 0,
  onNewMigration,
  onRefresh,
  onExport,
  onImport,
}) => {
  return (
    <div className="migration-toolbar">
      {/* Header */}

      <div className="migration-toolbar-header">
        <div>
          <div className="migration-toolbar-title">
            <FileCode2 size={22} />
            <h2>Migration Scripts</h2>
          </div>

          <p>
            Manage, edit and monitor all migration scripts for the current
            database connection.
          </p>
        </div>

        <button className="btn btn-primary btn-lg" onClick={onNewMigration}>
          <Plus size={18} />
          New Migration
        </button>
      </div>

      {/* Controls */}

      <div className="migration-toolbar-controls">
        <div className="migration-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by version or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="migration-toolbar-actions">
          <button className="btn btn-secondary" onClick={onRefresh}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button className="btn btn-secondary" onClick={onExport}>
            <Download size={16} />
            Export
          </button>

          <button className="btn btn-secondary" onClick={onImport}>
            <Upload size={16} />
            Import
          </button>
        </div>
      </div>

      {/* Footer */}

      <div className="migration-toolbar-footer">
        <span className="badge badge-blue">{total} Migration Scripts</span>
      </div>
    </div>
  );
};

export default MigrationToolbar;
