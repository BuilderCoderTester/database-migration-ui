import React, { useEffect, useState } from "react";
import {
  HardDrive,
  RefreshCw,
  Upload,
  Trash2,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

import "../../styles/system/DriverManager.css";

const DriverManagerPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    // TODO:
    // Replace with backend API later
    setDrivers([
      {
        database: "PostgreSQL",
        version: "42.7.7",
        driverClass: "org.postgresql.Driver",
        jar: "drivers/postgresql-42.7.7.jar",
        status: "Loaded",
      },
      {
        database: "MySQL",
        version: "9.3.0",
        driverClass: "com.mysql.cj.jdbc.Driver",
        jar: "drivers/mysql-connector-j-9.3.0.jar",
        status: "Loaded",
      },
      {
        database: "SQL Server",
        version: "13.2.0",
        driverClass: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
        jar: "drivers/mssql-jdbc-13.2.0.jar",
        status: "Loaded",
      },
      {
        database: "SQLite",
        version: "-",
        driverClass: "",
        jar: "",
        status: "Missing",
      },
    ]);
  }, []);

  return (
    <div className="driver-page">
      {/* Header */}

      <div className="driver-header">
        <div>
          <h2>Driver Manager</h2>
          <p>Manage JDBC drivers used by the migration engine.</p>
        </div>

        <div className="driver-actions">
          <button className="btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>

          <button className="btn-primary">
            <Upload size={16} />
            Install Driver
          </button>
        </div>
      </div>

      <div className="driver-layout">
        {/* Driver List */}

        <div className="driver-list">
          <div className="card-header">
            <HardDrive size={18} />
            Installed Drivers
          </div>

          <table>
            <thead>
              <tr>
                <th>Database</th>
                <th>Version</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {drivers.map((driver) => (
                <tr
                  key={driver.database}
                  onClick={() => setSelectedDriver(driver)}
                  className={
                    selectedDriver?.database === driver.database
                      ? "selected"
                      : ""
                  }
                >
                  <td>{driver.database}</td>

                  <td>{driver.version}</td>

                  <td>
                    {driver.status === "Loaded" ? (
                      <span className="status-ok">
                        <CheckCircle2 size={16} />
                        Loaded
                      </span>
                    ) : (
                      <span className="status-missing">
                        <XCircle size={16} />
                        Missing
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Driver Details */}

        <div className="driver-details">
          <div className="card-header">
            <Info size={18} />
            Driver Details
          </div>

          {!selectedDriver ? (
            <div className="empty-state">Select a driver to view details.</div>
          ) : (
            <div className="details">
              <div className="detail-row">
                <label>Database</label>
                <span>{selectedDriver.database}</span>
              </div>

              <div className="detail-row">
                <label>Version</label>
                <span>{selectedDriver.version}</span>
              </div>

              <div className="detail-row">
                <label>Driver Class</label>
                <span>{selectedDriver.driverClass || "-"}</span>
              </div>

              <div className="detail-row">
                <label>Jar File</label>
                <span>{selectedDriver.jar || "-"}</span>
              </div>

              <div className="detail-row">
                <label>Status</label>
                <span>{selectedDriver.status}</span>
              </div>

              <div className="details-actions">
                <button className="btn-primary">Replace Driver</button>

                <button className="btn-danger">
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverManagerPage;
