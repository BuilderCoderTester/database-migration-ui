import React, { useState } from "react";
import {
  FolderOpen,
  FolderPlus,
  RefreshCw,
  Trash2,
  CheckCircle2,
} from "lucide-react";

import "../../styles/system/MigrationPaths.css";

const MigrationPathsPage = () => {
  const [paths, setPaths] = useState([
    {
      id: 1,
      path: "D:/MigrationTool/migrations",
      recursive: true,
      isDefault: true,
    },
    {
      id: 2,
      path: "D:/Projects/CustomerA/Migrations",
      recursive: false,
      isDefault: false,
    },
  ]);

  return (
    <div className="paths-page">
      {/* Header */}

      <div className="paths-header">
        <div>
          <h2>Migration Paths</h2>
          <p>Configure directories where migration scripts are stored.</p>
        </div>

        <div className="paths-actions">
          <button className="btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>

          <button className="btn-primary">
            <FolderPlus size={16} />
            Add Path
          </button>
        </div>
      </div>

      {/* Table */}

      <div className="paths-card">
        <div className="card-header">
          <FolderOpen size={18} />
          Configured Directories
        </div>

        <table>
          <thead>
            <tr>
              <th>Directory</th>
              <th>Recursive</th>
              <th>Default</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {paths.map((item) => (
              <tr key={item.id}>
                <td>{item.path}</td>

                <td>{item.recursive ? "Enabled" : "Disabled"}</td>

                <td>
                  {item.isDefault && (
                    <span className="default-tag">
                      <CheckCircle2 size={14} />
                      Default
                    </span>
                  )}
                </td>

                <td>
                  <button className="icon-btn">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MigrationPathsPage;
