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
            <div className="table-header">
              <div>
                <h2>{tableData?.tableName}</h2>

                <span>{tableData?.schemaName}</span>
              </div>
            </div>

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

            <div className="table-container">
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
                      <td colSpan="4">No column information available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TablesView;
