import React from "react";
import "../../styles/primitives/tables/TablesView.css";

const TablesView = ({
  tables = [],
  selectedTable,
  tableData,
  onSelectTable,
}) => {
  return (
    <div className="tables-layout">
      {/* Left Sidebar */}
      <aside className="tables-sidebar">
        <div className="tables-sidebar-header">
          <h3>Database Tables</h3>
        </div>

        {tables.length === 0 ? (
          <div className="empty-table-list">No tables found</div>
        ) : (
          tables.map((table) => (
            <button
              key={table}
              className={`table-item ${
                selectedTable === table ? "active" : ""
              }`}
              onClick={() => onSelectTable(table)}
            >
              {table}
            </button>
          ))
        )}
      </aside>

      {/* Right Content */}
      <section className="tables-content">
        {!selectedTable ? (
          <div className="table-details-card">
            <h2>Select a Table</h2>
            <p>Choose a table from the left panel to view its structure.</p>
          </div>
        ) : (
          <div className="table-details-card">
            {/* Header */}
            <div className="table-header">
              <div>
                <h2>{tableData?.tableName}</h2>
                <span>{tableData?.schemaName}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="table-summary">
              <div className="summary-card">
                <span>Rows</span>
                <strong>{tableData?.rowCount ?? 0}</strong>
              </div>

              <div className="summary-card">
                <span>Columns</span>
                <strong>{tableData?.columnCount ?? 0}</strong>
              </div>
            </div>

            {/* Table Structure */}
            <div className="table-container">
              <h3 className="section-title">Table Structure</h3>

              <table className="migration-table">
                <thead>
                  <tr>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Nullable</th>
                    <th>Primary Key</th>
                  </tr>
                </thead>

                <tbody>
                  {tableData?.columns?.length > 0 ? (
                    tableData.columns.map((column, index) => (
                      <tr key={index}>
                        <td>{column.columnName}</td>
                        <td>{column.dataType}</td>
                        <td>{column.nullable ? "YES" : "NO"}</td>
                        <td>{column.primaryKey ? "YES" : "NO"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>No column information available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Data */}
            <div className="table-container">
              <h3 className="section-title">Table Data</h3>

              {tableData?.rows?.length > 0 ? (
                <table className="migration-table">
                  <thead>
                    <tr>
                      {Object.keys(tableData.rows[0]).map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {tableData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.keys(tableData.rows[0]).map((key) => (
                          <td key={key}>
                            {row[key] === null
                              ? "NULL"
                              : String(row[key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-table-list">
                  No table data available.
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TablesView;