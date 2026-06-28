import React, { useState } from "react";
import {
  Database,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

import "../../styles/system/DatabaseTypes.css";

const DatabaseTypesPage = () => {
  const [databases] = useState([
    {
      name: "PostgreSQL",
      version: "16+",
      driver: "Installed",
      supported: true,
      description: "Open-source relational database."
    },
    {
      name: "MySQL",
      version: "8+",
      driver: "Installed",
      supported: true,
      description: "Popular open-source database."
    },
    {
      name: "SQL Server",
      version: "2019+",
      driver: "Installed",
      supported: true,
      description: "Microsoft SQL Server."
    },
    {
      name: "SQLite",
      version: "3+",
      driver: "Missing",
      supported: false,
      description: "Embedded lightweight database."
    },
    {
      name: "Oracle",
      version: "19c+",
      driver: "Missing",
      supported: false,
      description: "Oracle Enterprise Database."
    }
  ]);

  return (
    <div className="database-page">

      <div className="database-header">

        <div>
          <h2>Supported Databases</h2>
          <p>
            View database engines supported by the migration platform.
          </p>
        </div>

      </div>

      <div className="database-grid">

        {databases.map((db) => (

          <div className="database-card" key={db.name}>

            <div className="database-card-header">

              <Database size={22} />

              <h3>{db.name}</h3>

            </div>

            <p>{db.description}</p>

            <div className="database-row">

              <span>Supported Version</span>

              <strong>{db.version}</strong>

            </div>

            <div className="database-row">

              <span>Driver</span>

              <strong>{db.driver}</strong>

            </div>

            <div className="database-status">

              {db.supported ? (

                <span className="status-success">

                  <CheckCircle2 size={16} />

                  Supported

                </span>

              ) : (

                <span className="status-error">

                  <XCircle size={16} />

                  Not Installed

                </span>

              )}

            </div>

            <button className="database-btn">

              <Info size={16} />

              Details

            </button>

          </div>

        ))}

      </div>

    </div>
  );
};

export default DatabaseTypesPage;