import React, { useState } from "react";
import { Settings, Moon, Sun, FileText, Database, Shield } from "lucide-react";

import "../../styles/system/Settings.css";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    autoBackup: true,
    validateBeforeMigration: true,
    enableLogs: true,
    autoRefresh: true,
    migrationTimeout: 60,
    maxLogEntries: 500,
  });

  const update = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h2>Settings</h2>
          <p>Configure application and migration preferences.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* General */}

        <div className="settings-card">
          <div className="card-title">
            <Settings size={18} />
            General
          </div>

          <div className="setting-row">
            <span>Dark Mode</span>

            <label className="switch">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => update("darkMode", e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <span>Auto Refresh</span>

            <label className="switch">
              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => update("autoRefresh", e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Migration */}

        <div className="settings-card">
          <div className="card-title">
            <Database size={18} />
            Migration
          </div>

          <div className="setting-row">
            <span>Auto Backup</span>

            <label className="switch">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => update("autoBackup", e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <span>Validate Before Migration</span>

            <label className="switch">
              <input
                type="checkbox"
                checked={settings.validateBeforeMigration}
                onChange={(e) =>
                  update("validateBeforeMigration", e.target.checked)
                }
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <span>Migration Timeout</span>

            <input
              type="number"
              value={settings.migrationTimeout}
              onChange={(e) => update("migrationTimeout", e.target.value)}
            />
          </div>
        </div>

        {/* Logging */}

        <div className="settings-card">
          <div className="card-title">
            <FileText size={18} />
            Logging
          </div>

          <div className="setting-row">
            <span>Enable Logs</span>

            <label className="switch">
              <input
                type="checkbox"
                checked={settings.enableLogs}
                onChange={(e) => update("enableLogs", e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <span>Maximum Log Entries</span>

            <input
              type="number"
              value={settings.maxLogEntries}
              onChange={(e) => update("maxLogEntries", e.target.value)}
            />
          </div>
        </div>

        {/* Security */}

        <div className="settings-card">
          <div className="card-title">
            <Shield size={18} />
            Security
          </div>

          <div className="setting-row">
            <span>Encryption</span>
            <strong>AES-256</strong>
          </div>

          <div className="setting-row">
            <span>Password Storage</span>
            <strong>Encrypted</strong>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="btn-secondary">Reset</button>

        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  );
};

export default SettingsPage;
