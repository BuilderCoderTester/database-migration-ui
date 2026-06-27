import React from "react";
import { X, FileCode2, Sparkles } from "lucide-react";
import Editor from "@monaco-editor/react";
import "../../styles/toggle/migration/ManualMigrationPanel.css";

const ManualMigrationPanel = ({
  darkMode,
  migrationName,
  setMigrationName,
  migrationVersion,
  upSql,
  downSql,
  setUpSql,
  setDownSql,
  creating,
  onClose,
  onCreate,
}) => {
  return (
    <div className="migration-modal-overlay">
      <div className="migration-modal">
        {/* HEADER */}

        <div className="migration-modal-header">
          <div>
            <div className="modal-chip">
              <Sparkles size={14} />
              Manual Migration
            </div>

            <h2>Create Database Migration</h2>

            <p>
              Create a versioned SQL migration that can be executed against the
              selected database.
            </p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* BODY */}

        <div className="migration-modal-body">
          <div className="migration-info-grid">
            <div className="migration-field">
              <label>Migration Name</label>

              <input
                className="modern-input"
                placeholder="create_employee_table"
                value={migrationName}
                onChange={(e) => setMigrationName(e.target.value)}
              />
            </div>

            <div className="version-card">
              <FileCode2 size={22} />

              <div>
                <span>Version</span>

                <strong>V{migrationVersion}</strong>
              </div>
            </div>
          </div>

          {/* UP */}

          <div className="editor-wrapper">
            <div className="editor-title">UP Migration</div>

            <Editor
              height="260px"
              defaultLanguage="sql"
              theme={darkMode ? "vs-dark" : "light"}
              value={upSql}
              onChange={(v) => setUpSql(v || "")}
            />
          </div>

          {/* DOWN */}

          <div className="editor-wrapper">
            <div className="editor-title">DOWN Migration</div>

            <Editor
              height="260px"
              defaultLanguage="sql"
              theme={darkMode ? "vs-dark" : "light"}
              value={downSql}
              onChange={(v) => setDownSql(v || "")}
            />
          </div>
        </div>

        {/* FOOTER */}

        <div className="migration-modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button
            className="primary-btn"
            onClick={onCreate}
            disabled={creating}
          >
            {creating ? "Creating..." : "Create Migration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualMigrationPanel;
