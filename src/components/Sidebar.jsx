import {
  Database,
  LayoutGrid,
  Clock,
  CheckCircle2,
  Settings,
  Activity,
  Table2,
} from "lucide-react";
import React from "react";
import "../MigrateDB.css";

const Sidebar = ({
  active,
  onAllClick,
  onPendingClick,
  onAppliedClick,
  onRunHistoryClick,
  onConnectionsClick,
  onTablesClick,
}) => (
  < aside className="sidebar" >
    <div className="sidebar-section-title">Views</div>

    <SidebarItem
      icon={<LayoutGrid size={15} />}
      label="All Migrations"
      active={active === "all"}
      onClick={onAllClick}
    />

    <SidebarItem
      icon={<Clock size={15} />}
      label="Pending"
      badge="3"
      active={active === "pending"}
      onClick={onPendingClick}
    />

    <SidebarItem
      icon={<CheckCircle2 size={15} />}
      label="Applied"
      active={active === "applied"}
      onClick={onAppliedClick}
    />

    <SidebarItem icon={<Activity size={15} />} label="Run History"
      active={active === "history"}
      onClick={onRunHistoryClick} />

    <div className="sidebar-section-title mt">Config</div>

    <SidebarItem
      icon={<Database size={15} />}
      label="Connections"
      active={active === "Connections"}
      onClick={onConnectionsClick}
    />
    <SidebarItem
      icon={<Table2 size={15} />}
      label="Tables"
      active={active === "tables"}
      onClick={onTablesClick}
    />
    <SidebarItem icon={<Settings size={15} />} label="Settings" />
  </aside >
);

export default Sidebar;

const SidebarItem = ({ icon, label, active, badge, onClick }) => (
  <div
    className={`sidebar-item ${active ? "active" : ""}`}
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
    {icon}
    <span className="sidebar-label">{label}</span>

    {badge && <span className="sidebar-badge">{badge}</span>}
  </div>
);
