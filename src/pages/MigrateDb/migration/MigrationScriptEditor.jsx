import React from "react";
import { X, Save, FileCode2, Database } from "lucide-react";
import Editor from "@monaco-editor/react";
import "../../styles/toggle/migration/MigrationScriptEditor.css";

const MigrationScriptEditor = ({
  migration,
  upSql,
  downSql,
  setUpSql,
  setDownSql,
  onClose,
  onSave,
  darkMode,
}) => {
  return (
    <div className="script-overlay">
      <div className="script-modal">
        {/* Header */}

        <div className="script-header">
          <div>
            <div className="script-chip">
              <FileCode2 size={14} />
              Migration Script
            </div>

            <h2>Version {migration?.version}</h2>

            <p>Edit the SQL script for this migration.</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Information */}

        <div className="script-info">
          <div className="script-info-card">
            <Database size={18} />

            <div>
              <span>Description</span>

              <strong>{migration?.description || "-"}</strong>
            </div>
          </div>

          <div className="script-info-card">
            <FileCode2 size={18} />

            <div>
              <span>Version</span>

              <strong>V{migration?.version}</strong>
            </div>
          </div>
        </div>

        {/* Editors */}

        <div className="script-body">
          <div className="editor-panel">
            <h3>UP Migration</h3>

            <Editor
              height="260px"
              defaultLanguage="sql"
              theme={darkMode ? "vs-dark" : "light"}
              value={upSql}
              onChange={(v) => setUpSql(v || "")}
            />
          </div>

          <div className="editor-panel">
            <h3>DOWN Migration</h3>

            <Editor
              height="260px"
              defaultLanguage="sql"
              theme={darkMode ? "vs-dark" : "light"}
              value={downSql}
              onChange={(v) => setDownSql(v || "")}
            />
          </div>
        </div>

        {/* Footer */}

        <div className="script-footer">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="primary-btn" onClick={onSave}>
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MigrationScriptEditor;
