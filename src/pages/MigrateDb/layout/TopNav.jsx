import React from "react";
import { Database, Bell, Moon, Sun, Server } from "lucide-react";

import "../../styles/components/layout/TopNav.css";

const TopNav = ({ darkMode, onToggleTheme }) => {
  return (
    <header className="topnav">

      <div className="topnav-left">
        <div className="logo-box">DB</div>
        <div className="logo-text">
          <span className="logo-text title">Database Migration Manager</span>
          <span className="logo-text version">Enterprise Migration Platform</span>
        </div>
      </div>

      <div className="nav-sep" />

      <div className="topnav-right">

        <div className="env-badge">
          <Server size={14} />
          <span>Active Environment</span>
          <strong>Production Database</strong>
          <span className="dot" />
        </div>

        <button className="nav-icon-btn" onClick={onToggleTheme}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="nav-icon-btn">
          <Bell size={16} />
          <span className="notif-dot" />
        </button>

        <div className="env-badge">
          <div style={{ fontWeight: 700 }}>A</div>
          <div>
            <strong>Administrator</strong>
            <span> DBA</span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopNav;