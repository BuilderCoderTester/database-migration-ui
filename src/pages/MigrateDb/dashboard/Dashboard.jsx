import React from "react";

import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import QuickActions from "./QuickActions";

import ActivityLog from "../activity/ActivityLog";

import "../../styles/toggle/dashboard/DashboardPage.css";

const DashboardPage = ({
  loading,

  stats,

  history = [],
  pending = [],

  onMigrate,
  onRollback,
  onValidate,
  onRepair,

  onNewMigration,
}) => {
  const recentPending = pending.slice(0, 5);
  const recentHistory = history.slice(0, 5);

  return (
    <div className="dashboard-page">
      <DashboardHeader onNewMigration={onNewMigration} />

      <QuickActions
        loading={loading}
        onMigrate={onMigrate}
        onRollback={onRollback}
        onValidate={onValidate}
        onRepair={onRepair}
      />

      <DashboardStats stats={stats} />

      <div className="dashboard-grid">
        {/* Pending */}

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>Pending Migrations</h3>
            <span>{recentPending.length}</span>
          </div>

          {recentPending.length === 0 ? (
            <div className="dashboard-empty">No pending migrations.</div>
          ) : (
            <div className="dashboard-list">
              {recentPending.map((migration) => (
                <div key={migration.version} className="dashboard-list-item">
                  <div>
                    <strong>{migration.version}</strong>
                    <p>{migration.description}</p>
                  </div>

                  <span className="badge badge-amber">Pending</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent History */}

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>Recent Executions</h3>
            <span>{recentHistory.length}</span>
          </div>

          {recentHistory.length === 0 ? (
            <div className="dashboard-empty">No migration history.</div>
          ) : (
            <div className="dashboard-list">
              {recentHistory.map((migration) => (
                <div key={migration.version} className="dashboard-list-item">
                  <div>
                    <strong>{migration.version}</strong>
                    <p>{migration.description}</p>
                  </div>

                  <span
                    className={`badge ${
                      migration.success ? "badge-green" : "badge-red"
                    }`}
                  >
                    {migration.success ? "Applied" : "Failed"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card dashboard-full-width">
        <div className="dashboard-card-header">
          <h3>System Overview</h3>
        </div>

        <div className="dashboard-overview">
          <div className="overview-item">
            <span>Total Scripts</span>
            <strong>{stats[0]?.value ?? 0}</strong>
          </div>

          <div className="overview-item">
            <span>Applied</span>
            <strong>{stats[1]?.value ?? 0}</strong>
          </div>

          <div className="overview-item">
            <span>Pending</span>
            <strong>{stats[2]?.value ?? 0}</strong>
          </div>

          <div className="overview-item">
            <span>Failed</span>
            <strong>{stats[3]?.value ?? 0}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
