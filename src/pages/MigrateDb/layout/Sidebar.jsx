import React from "react";
import {
  Home,
  FileCode2,
  Clock3,
  CheckCircle2,
  Database,
  Table2,
  History,
  Settings,
  ChevronRight,
  Activity,
  HardDrive,
  FolderTree,
  Layers3,
  Info,
} from "lucide-react";

import "../../styles/components/layout/Sidebar.css";

const Sidebar = ({
  active,

  onDashboardClick,
  onScriptsClick,
  onPendingClick,
  onAppliedClick,
  onConnectionsClick,
  onTablesClick,
  onRunHistoryClick,
  onActivityClick,

  onDriversClick,
  onMigrationPathsClick,
  onDatabaseTypesClick,
  onSettingsClick,
  onAboutClick,
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Navigation</span>
      </div>

      {/* ========================================= */}

      <div className="sidebar-group">
        <span className="sidebar-group-title">Dashboard</span>

        <SidebarItem
          icon={<Home size={18} />}
          title="Overview"
          active={active === "dashboard"}
          onClick={onDashboardClick}
        />
      </div>

      {/* ========================================= */}

      <div className="sidebar-divider" />

      <div className="sidebar-group">
        <span className="sidebar-group-title">Migration</span>

        <SidebarItem
          icon={<FileCode2 size={18} />}
          title="Migration Scripts"
          active={active === "scripts"}
          onClick={onScriptsClick}
        />

        <SidebarItem
          icon={<Clock3 size={18} />}
          title="Pending"
          active={active === "pending"}
          onClick={onPendingClick}
        />

        <SidebarItem
          icon={<CheckCircle2 size={18} />}
          title="Applied"
          active={active === "applied"}
          onClick={onAppliedClick}
        />

        <SidebarItem
          icon={<History size={18} />}
          title="Run History"
          active={active === "runHistory"}
          onClick={onRunHistoryClick}
        />
      </div>

      {/* ========================================= */}

      <div className="sidebar-divider" />

      <div className="sidebar-group">
        <span className="sidebar-group-title">Database</span>

        <SidebarItem
          icon={<Database size={18} />}
          title="Connections"
          active={active === "connections"}
          onClick={onConnectionsClick}
        />

        <SidebarItem
          icon={<Table2 size={18} />}
          title="Tables"
          active={active === "tables"}
          onClick={onTablesClick}
        />
      </div>
      <div className="sidebar-divider" />

      <div className="sidebar-group">
        <span className="sidebar-group-title">Monitoring</span>

        <SidebarItem
          icon={<Activity size={18} />}
          title="Activity Logs"
          active={active === "activity"}
          onClick={onActivityClick}
        />
      </div>
      {/* ========================================= */}

      <div className="sidebar-divider" />

      <div className="sidebar-divider" />

      <div className="sidebar-group">
        <span className="sidebar-group-title">Administration</span>

        <SidebarItem
          icon={<HardDrive size={18} />}
          title="Driver Manager"
          active={active === "drivers"}
          onClick={onDriversClick}
        />

        <SidebarItem
          icon={<FolderTree size={18} />}
          title="Migration Paths"
          active={active === "paths"}
          onClick={onMigrationPathsClick}
        />

        <SidebarItem
          icon={<Layers3 size={18} />}
          title="Database Types"
          active={active === "databaseTypes"}
          onClick={onDatabaseTypesClick}
        />

        <SidebarItem
          icon={<Settings size={18} />}
          title="Settings"
          active={active === "settings"}
          onClick={onSettingsClick}
        />

        <SidebarItem
          icon={<Info size={18} />}
          title="About"
          active={active === "about"}
          onClick={onAboutClick}
        />
      </div>
    </aside>
  );
};

export default Sidebar;

const SidebarItem = ({ icon, title, active, badge, onClick }) => (
  <button
    className={`sidebar-item ${active ? "active" : ""}`}
    onClick={onClick}
  >
    <div className="sidebar-item-left">
      {icon}

      <span>{title}</span>
    </div>

    <div className="sidebar-item-right">
      {badge && <span className="sidebar-badge">{badge}</span>}

      <ChevronRight size={14} />
    </div>
  </button>
);
