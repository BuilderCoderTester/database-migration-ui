import React from "react";
import { Plus, Database, Server, ShieldCheck } from "lucide-react";

import "../../styles/toggle/dashboard/DashboardHeader.css";

const DashboardHeader = ({ onNewMigration }) => {
  return (
    <section className="dashboard-header">
      <div className="dashboard-header-left">
        <div className="dashboard-title">
          <Database size={22} />

          <div>
            <h1>Database Migration Dashboard</h1>

            <p>
              Monitor migrations, execute deployments and manage database
              versions.
            </p>
          </div>
        </div>

        <div className="dashboard-tags">
          <span className="dashboard-tag">
            <Server size={14} />
            PostgreSQL
          </span>

          <span className="dashboard-tag">
            <ShieldCheck size={14} />
            Production
          </span>
        </div>
      </div>

      <div className="dashboard-header-right">
        <button className="btn btn-primary btn-lg" onClick={onNewMigration}>
          <Plus size={18} />
          New Migration
        </button>
      </div>
    </section>
  );
};

export default DashboardHeader;
