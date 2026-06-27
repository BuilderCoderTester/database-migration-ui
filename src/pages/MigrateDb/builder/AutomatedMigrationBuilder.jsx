import React, { useState, useCallback, useMemo } from "react";

const SQL_TYPES = [
  "VARCHAR(255)", "VARCHAR(500)", "TEXT", "CHAR(36)",
  "INT", "BIGINT", "SMALLINT", "TINYINT",
  "DECIMAL(10,2)", "FLOAT", "DOUBLE",
  "BOOLEAN", "BIT",
  "DATE", "TIME", "DATETIME", "TIMESTAMP",
  "JSON", "JSONB",
  "UUID", "BLOB", "CLOB",
  "ENUM", "SET",
  "SERIAL", "BIGSERIAL"
];

const SQL_TEMPLATES = {
  mysql: {
    create: (table, cols) => {
      const colDefs = cols.map(c => {
        let def = `  \`${c.name}\` ${c.type}`;
        if (c.unsigned) def += " UNSIGNED";
        if (!c.nullable) def += " NOT NULL";
        if (c.autoIncrement) def += " AUTO_INCREMENT";
        if (c.defaultValue !== undefined && c.defaultValue !== "") {
          def += ` DEFAULT ${c.type.includes("INT") || c.type.includes("DECIMAL") ? c.defaultValue : `'${c.defaultValue}'`}`;
        }
        if (c.comment) def += ` COMMENT '${c.comment}'`;
        return def;
      }).join(",\n");
      
      const pk = cols.filter(c => c.primaryKey).map(c => `\`${c.name}\``);
      const pkConstraint = pk.length ? `,\n  PRIMARY KEY (${pk.join(", ")})` : "";
      
      return `CREATE TABLE \`${table}\` (\n${colDefs}${pkConstraint}\n);`;
    },
    drop: (table) => `DROP TABLE IF EXISTS \`${table}\`;`,
    alter: (table, col, action) => {
      if (action === "add") return `ALTER TABLE \`${table}\` ADD COLUMN \`${col.name}\` ${col.type}${!col.nullable ? " NOT NULL" : ""};`;
      if (action === "drop") return `ALTER TABLE \`${table}\` DROP COLUMN \`${col.name}\`;`;
      return "";
    }
  },
  postgresql: {
    create: (table, cols) => {
      const colDefs = cols.map(c => {
        let def = `  "${c.name}" ${c.type.toLowerCase()}`;
        if (!c.nullable) def += " NOT NULL";
        if (c.defaultValue !== undefined && c.defaultValue !== "") {
          def += ` DEFAULT ${c.defaultValue}`;
        }
        return def;
      }).join(",\n");
      
      const pk = cols.filter(c => c.primaryKey).map(c => `"${c.name}"`);
      const pkConstraint = pk.length ? `,\n  PRIMARY KEY (${pk.join(", ")})` : "";
      
      return `CREATE TABLE "${table}" (\n${colDefs}${pkConstraint}\n);`;
    },
    drop: (table) => `DROP TABLE IF EXISTS "${table}" CASCADE;`,
    alter: (table, col, action) => {
      if (action === "add") return `ALTER TABLE "${table}" ADD COLUMN "${col.name}" ${col.type.toLowerCase()}${!col.nullable ? " NOT NULL" : ""};`;
      if (action === "drop") return `ALTER TABLE "${table}" DROP COLUMN "${col.name}";`;
      return "";
    }
  },
  sqlite: {
    create: (table, cols) => {
      const colDefs = cols.map(c => {
        let def = `  "${c.name}" ${c.type}`;
        if (c.primaryKey) def += " PRIMARY KEY";
        if (c.autoIncrement) def += " AUTOINCREMENT";
        if (!c.nullable) def += " NOT NULL";
        if (c.defaultValue !== undefined && c.defaultValue !== "") {
          def += ` DEFAULT ${c.defaultValue}`;
        }
        return def;
      }).join(",\n");
      
      return `CREATE TABLE "${table}" (\n${colDefs}\n);`;
    },
    drop: (table) => `DROP TABLE IF EXISTS "${table}";`,
    alter: (table, col, action) => {
      if (action === "add") return `ALTER TABLE "${table}" ADD COLUMN "${col.name}" ${col.type}${!col.nullable ? " NOT NULL" : ""};`;
      return "";
    }
  }
};

const DEFAULT_COLUMN = {
  name: "",
  type: "VARCHAR(255)",
  nullable: true,
  primaryKey: false,
  unique: false,
  index: false,
  autoIncrement: false,
  unsigned: false,
  defaultValue: "",
  comment: "",
  foreignKey: null,
  check: ""
};

const AutomatedMigrationBuilder = ({ onClose, existingTables = [] }) => {
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState([{ ...DEFAULT_COLUMN }]);
  const [engine, setEngine] = useState("mysql");
  const [migrationType, setMigrationType] = useState("create");
  const [targetTable, setTargetTable] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("designer");

  const addColumn = useCallback(() => {
    setColumns(prev => [...prev, { ...DEFAULT_COLUMN }]);
  }, []);

  const removeColumn = useCallback((index) => {
    setColumns(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateColumn = useCallback((index, field, value) => {
    setColumns(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      
      if (field === "primaryKey" && value) {
        copy[index].nullable = false;
      }
      if (field === "autoIncrement" && value) {
        copy[index].type = "INT";
        copy[index].primaryKey = true;
        copy[index].nullable = false;
      }
      
      return copy;
    });
  }, []);

  const moveColumn = useCallback((index, direction) => {
    setColumns(prev => {
      const copy = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= copy.length) return prev;
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!tableName.trim()) newErrors.tableName = "Table name is required";
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      newErrors.tableName = "Invalid table name format";
    }
    
    const hasPK = columns.some(c => c.primaryKey);
    if (!hasPK && migrationType === "create") {
      newErrors.general = "At least one primary key is recommended";
    }
    
    columns.forEach((col, i) => {
      if (!col.name.trim()) newErrors[`col_${i}_name`] = "Required";
      else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col.name)) {
        newErrors[`col_${i}_name`] = "Invalid identifier";
      }
      if (col.foreignKey && !col.foreignKey.refTable) {
        newErrors[`col_${i}_fk`] = "Reference table required";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [tableName, columns, migrationType]);

  const generatedSQL = useMemo(() => {
    if (!tableName || columns.some(c => !c.name)) return "-- Fill in all fields to generate SQL";
    
    const template = SQL_TEMPLATES[engine];
    
    if (migrationType === "create") {
      let sql = template.create(tableName, columns);
      
      const indexes = columns
        .filter(c => c.index && !c.primaryKey)
        .map(c => {
          if (engine === "mysql") return `CREATE INDEX idx_${c.name} ON \`${tableName}\` (\`${c.name}\`);`;
          if (engine === "postgresql") return `CREATE INDEX idx_${c.name} ON "${tableName}" ("${c.name}");`;
          return `CREATE INDEX idx_${c.name} ON "${tableName}" ("${c.name}");`;
        });
      
      const fks = columns
        .filter(c => c.foreignKey?.refTable)
        .map(c => {
          const fk = c.foreignKey;
          if (engine === "mysql") {
            return `ALTER TABLE \`${tableName}\` ADD CONSTRAINT fk_${c.name} FOREIGN KEY (\`${c.name}\`) REFERENCES \`${fk.refTable}\`(\`${fk.refColumn || "id"}\`);`;
          }
          return `ALTER TABLE "${tableName}" ADD CONSTRAINT fk_${c.name} FOREIGN KEY ("${c.name}") REFERENCES "${fk.refTable}"("${fk.refColumn || "id"}");`;
        });
      
      return [sql, ...indexes, ...fks].join("\n\n");
    }
    
    if (migrationType === "drop") {
      return template.drop(tableName);
    }
    
    if (migrationType === "alter" && targetTable) {
      return columns.map(col => template.alter(targetTable, col, "add")).join("\n");
    }
    
    return "-- Select migration type and fill required fields";
  }, [tableName, columns, engine, migrationType, targetTable]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedSQL]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generatedSQL], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${migrationType}_${tableName || "migration"}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedSQL, tableName, migrationType]);

  const getPreviewSchema = useCallback(() => {
    return columns.map(col => ({
      name: col.name || "unnamed",
      type: col.type,
      constraints: [
        col.primaryKey ? "PK" : null,
        !col.nullable ? "NOT NULL" : null,
        col.unique ? "UNQ" : null,
        col.autoIncrement ? "AI" : null,
        col.defaultValue ? `DEF:${col.defaultValue}` : null
      ].filter(Boolean)
    }));
  }, [columns]);

  return (
    <div className="migration-builder-overlay">
      <div className="migration-builder-modal">
        <div className="builder-header">
          <h2>🗄️ Advanced Migration Builder</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="builder-tabs">
          <button 
            className={activeTab === "designer" ? "active" : ""}
            onClick={() => setActiveTab("designer")}
          >
            Schema Designer
          </button>
          <button 
            className={activeTab === "preview" ? "active" : ""}
            onClick={() => setActiveTab("preview")}
          >
            Visual Preview
          </button>
        </div>

        {activeTab === "designer" ? (
          <div className="builder-content">
            <div className="config-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Migration Type</label>
                  <select 
                    value={migrationType} 
                    onChange={(e) => setMigrationType(e.target.value)}
                    className="input"
                  >
                    <option value="create">CREATE TABLE</option>
                    <option value="alter">ALTER TABLE</option>
                    <option value="drop">DROP TABLE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Database Engine</label>
                  <select 
                    value={engine} 
                    onChange={(e) => setEngine(e.target.value)}
                    className="input"
                  >
                    <option value="mysql">MySQL / MariaDB</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Table Name {errors.tableName && <span className="error-badge">{errors.tableName}</span>}</label>
                  <input
                    className={`input ${errors.tableName ? "error" : ""}`}
                    placeholder="e.g., user_profiles"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                  />
                </div>

                {migrationType === "alter" && (
                  <div className="form-group">
                    <label>Target Table</label>
                    <select
                      className="input"
                      value={targetTable}
                      onChange={(e) => setTargetTable(e.target.value)}
                    >
                      <option value="">Select existing table...</option>
                      {existingTables.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {errors.general && <div className="error-banner">{errors.general}</div>}

            <div className="columns-section">
              <div className="section-header">
                <h3>Columns ({columns.length})</h3>
                <button className="btn secondary" onClick={addColumn}>
                  + Add Column
                </button>
              </div>

              <div className="columns-list">
                {columns.map((column, index) => (
                  <div key={index} className={`column-card ${errors[`col_${index}_name`] ? "has-error" : ""}`}>
                    <div className="column-header">
                      <span className="column-number">#{index + 1}</span>
                      <div className="column-actions">
                        <button 
                          className="icon-btn" 
                          onClick={() => moveColumn(index, "up")}
                          disabled={index === 0}
                          title="Move up"
                        >↑</button>
                        <button 
                          className="icon-btn" 
                          onClick={() => moveColumn(index, "down")}
                          disabled={index === columns.length - 1}
                          title="Move down"
                        >↓</button>
                        <button 
                          className="icon-btn danger" 
                          onClick={() => removeColumn(index)}
                          disabled={columns.length === 1}
                          title="Remove"
                        >×</button>
                      </div>
                    </div>

                    <div className="column-grid">
                      <div className="form-group">
                        <label>Column Name {errors[`col_${index}_name`] && <span className="error-text">{errors[`col_${index}_name`]}</span>}</label>
                        <input
                          className={`input ${errors[`col_${index}_name`] ? "error" : ""}`}
                          placeholder="e.g., email"
                          value={column.name}
                          onChange={(e) => updateColumn(index, "name", e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Data Type</label>
                        <select
                          className="input"
                          value={column.type}
                          onChange={(e) => updateColumn(index, "type", e.target.value)}
                        >
                          {SQL_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Default Value</label>
                        <input
                          className="input"
                          placeholder="NULL, 0, CURRENT_TIMESTAMP..."
                          value={column.defaultValue}
                          onChange={(e) => updateColumn(index, "defaultValue", e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Comment</label>
                        <input
                          className="input"
                          placeholder="Column description..."
                          value={column.comment}
                          onChange={(e) => updateColumn(index, "comment", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="column-constraints">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={column.nullable}
                          onChange={(e) => updateColumn(index, "nullable", e.target.checked)}
                          disabled={column.primaryKey}
                        />
                        <span className="toggle-label">NULL</span>
                      </label>

                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={column.primaryKey}
                          onChange={(e) => updateColumn(index, "primaryKey", e.target.checked)}
                        />
                        <span className="toggle-label">PK</span>
                      </label>

                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={column.unique}
                          onChange={(e) => updateColumn(index, "unique", e.target.checked)}
                        />
                        <span className="toggle-label">UNQ</span>
                      </label>

                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={column.index}
                          onChange={(e) => updateColumn(index, "index", e.target.checked)}
                        />
                        <span className="toggle-label">IDX</span>
                      </label>

                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={column.autoIncrement}
                          onChange={(e) => updateColumn(index, "autoIncrement", e.target.checked)}
                        />
                        <span className="toggle-label">AI</span>
                      </label>

                      {engine === "mysql" && (
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={column.unsigned}
                            onChange={(e) => updateColumn(index, "unsigned", e.target.checked)}
                          />
                          <span className="toggle-label">UNS</span>
                        </label>
                      )}
                    </div>

                    <div className="foreign-key-section">
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={!!column.foreignKey}
                          onChange={(e) => updateColumn(index, "foreignKey", e.target.checked ? { refTable: "", refColumn: "id" } : null)}
                        />
                        <span className="toggle-label">Foreign Key</span>
                      </label>
                      
                      {column.foreignKey && (
                        <div className="fk-fields">
                          <select
                            className="input"
                            value={column.foreignKey.refTable}
                            onChange={(e) => updateColumn(index, "foreignKey", { ...column.foreignKey, refTable: e.target.value })}
                          >
                            <option value="">Reference Table...</option>
                            {existingTables.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <input
                            className="input"
                            placeholder="Ref Column"
                            value={column.foreignKey.refColumn}
                            onChange={(e) => updateColumn(index, "foreignKey", { ...column.foreignKey, refColumn: e.target.value })}
                          />
                        </div>
                      )}
                      {errors[`col_${index}_fk`] && <span className="error-text">{errors[`col_${index}_fk`]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="preview-tab">
            <div className="schema-diagram">
              <div className="table-box">
                <div className="table-title">{tableName || "untitled_table"}</div>
                {getPreviewSchema().map((col, i) => (
                  <div key={i} className={`schema-row ${col.constraints.includes("PK") ? "primary" : ""}`}>
                    <span className="col-name">{col.name}</span>
                    <span className="col-type">{col.type}</span>
                    <span className="col-badges">
                      {col.constraints.map(c => (
                        <span key={c} className={`badge ${c.toLowerCase().replace(/[^a-z]/g, "")}`}>{c}</span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="sql-preview-section">
          <div className="preview-header">
            <h3>Generated SQL</h3>
            <div className="preview-actions">
              <button className="btn" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? "Hide" : "Show"}
              </button>
              <button className="btn" onClick={handleCopy}>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
              <button className="btn primary" onClick={handleDownload}>
                Download .sql
              </button>
            </div>
          </div>
          
          {showPreview && (
            <pre className="sql-code">
              <code>{generatedSQL}</code>
            </pre>
          )}
        </div>

        <div className="builder-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button 
            className="btn primary" 
            onClick={() => {
              if (validate()) {
                handleDownload();
              }
            }}
          >
            Validate & Export
          </button>
        </div>
      </div>

      <style jsx>{`
        .migration-builder-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .migration-builder-modal {
          background: #1e1e2e;
          border-radius: 12px;
          width: 100%;
          max-width: 1000px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid #31314a;
        }
        
        .builder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #31314a;
          background: #181825;
        }
        
        .builder-header h2 {
          margin: 0;
          color: #cdd6f4;
          font-size: 1.25rem;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: #6c7086;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .close-btn:hover {
          background: #31314a;
          color: #f38ba8;
        }
        
        .builder-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid #31314a;
          background: #181825;
        }
        
        .builder-tabs button {
          padding: 12px 24px;
          background: none;
          border: none;
          color: #6c7086;
          cursor: pointer;
          font-size: 0.9rem;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        
        .builder-tabs button.active {
          color: #89b4fa;
          border-bottom-color: #89b4fa;
          background: rgba(137, 180, 250, 0.1);
        }
        
        .builder-tabs button:hover:not(.active) {
          color: #cdd6f4;
          background: rgba(205, 214, 244, 0.05);
        }
        
        .builder-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        
        .config-section {
          margin-bottom: 24px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .form-group label {
          color: #a6adc8;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .input {
          padding: 10px 12px;
          background: #181825;
          border: 1px solid #31314a;
          border-radius: 8px;
          color: #cdd6f4;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        .input:focus {
          outline: none;
          border-color: #89b4fa;
          box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.1);
        }
        
        .input.error {
          border-color: #f38ba8;
        }
        
        .error-badge, .error-text {
          color: #f38ba8;
          font-size: 0.75rem;
          text-transform: none;
        }
        
        .error-banner {
          background: rgba(243, 139, 168, 0.1);
          border: 1px solid rgba(243, 139, 168, 0.3);
          color: #f38ba8;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.9rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .section-header h3 {
          margin: 0;
          color: #cdd6f4;
          font-size: 1rem;
        }
        
        .columns-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .column-card {
          background: #181825;
          border: 1px solid #31314a;
          border-radius: 10px;
          padding: 16px;
          transition: all 0.2s;
        }
        
        .column-card:hover {
          border-color: #45475a;
        }
        
        .column-card.has-error {
          border-color: rgba(243, 139, 168, 0.5);
        }
        
        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .column-number {
          color: #6c7086;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .column-actions {
          display: flex;
          gap: 4px;
        }
        
        .icon-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: #31314a;
          color: #a6adc8;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        .icon-btn:hover:not(:disabled) {
          background: #45475a;
          color: #cdd6f4;
        }
        
        .icon-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .icon-btn.danger:hover:not(:disabled) {
          background: #f38ba8;
          color: #1e1e2e;
        }
        
        .column-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .column-constraints {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin-bottom: 12px;
        }
        
        .toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          color: #a6adc8;
          font-size: 0.85rem;
        }
        
        .toggle input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #89b4fa;
        }
        
        .foreign-key-section {
          padding-top: 12px;
          border-top: 1px solid #31314a;
        }
        
        .fk-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 8px;
        }
        
        .sql-preview-section {
          border-top: 1px solid #31314a;
          background: #11111b;
        }
        
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
        }
        
        .preview-header h3 {
          margin: 0;
          color: #cdd6f4;
          font-size: 0.9rem;
        }
        
        .preview-actions {
          display: flex;
          gap: 8px;
        }
        
        .sql-code {
          margin: 0;
          padding: 20px 24px;
          background: #0d0d15;
          color: #a6e3a1;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.85rem;
          line-height: 1.6;
          overflow-x: auto;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .builder-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #31314a;
          background: #181825;
        }
        
        .btn {
          padding: 10px 20px;
          border: 1px solid #31314a;
          background: #1e1e2e;
          color: #cdd6f4;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        .btn:hover {
          background: #31314a;
        }
        
        .btn.primary {
          background: #89b4fa;
          color: #1e1e2e;
          border-color: #89b4fa;
          font-weight: 600;
        }
        
        .btn.primary:hover {
          background: #b4befe;
        }
        
        .btn.secondary {
          background: #45475a;
          border-color: #45475a;
        }
        
        .preview-tab {
          padding: 24px;
          flex: 1;
          overflow-y: auto;
        }
        
        .schema-diagram {
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        
        .table-box {
          background: #181825;
          border: 2px solid #89b4fa;
          border-radius: 12px;
          min-width: 400px;
          overflow: hidden;
        }
        
        .table-title {
          background: #89b4fa;
          color: #1e1e2e;
          padding: 12px 16px;
          font-weight: 700;
          font-size: 1.1rem;
        }
        
        .schema-row {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          border-bottom: 1px solid #31314a;
          gap: 12px;
        }
        
        .schema-row.primary {
          background: rgba(137, 180, 250, 0.1);
        }
        
        .schema-row:last-child {
          border-bottom: none;
        }
        
        .col-name {
          color: #cdd6f4;
          font-weight: 600;
          min-width: 120px;
        }
        
        .col-type {
          color: #f9e2af;
          font-size: 0.85rem;
          min-width: 100px;
        }
        
        .col-badges {
          display: flex;
          gap: 4px;
          margin-left: auto;
        }
        
        .badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
        }
        
        .badge.pk { background: #89b4fa; color: #1e1e2e; }
        .badge.notnull { background: #f38ba8; color: #1e1e2e; }
        .badge.unq { background: #cba6f7; color: #1e1e2e; }
        .badge.idx { background: #94e2d5; color: #1e1e2e; }
        .badge.ai { background: #fab387; color: #1e1e2e; }
        .badge.def { background: #a6e3a1; color: #1e1e2e; }
      `}</style>
    </div>
  );
};

export default AutomatedMigrationBuilder;