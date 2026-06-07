import React from "react";
import Editor from "@monaco-editor/react";

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
    <div className="script-editor-overlay">
      <div className="script-editor">

        <h2>
          Migration {migration?.version}
        </h2>

        <h4>UP SQL</h4>

        <Editor
          height="250px"
          defaultLanguage="sql"
          theme={darkMode ? "vs-dark" : "light"}
          value={upSql}
          onChange={(v) => setUpSql(v || "")}
        />

        <h4>DOWN SQL</h4>

        <Editor
          height="250px"
          defaultLanguage="sql"
          theme={darkMode ? "vs-dark" : "light"}
          value={downSql}
          onChange={(v) => setDownSql(v || "")}
        />

        <div className="panel-actions">
          <button
            className="btn"
            onClick={onClose}
          >
            Close
          </button>

          <button
            className="btn primary"
            onClick={onSave}
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default MigrationScriptEditor;