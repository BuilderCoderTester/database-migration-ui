import React from "react";
import {
  Database,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import "../../styles/toggle/dashboard/DashboardStats.css";

const iconMap = {
  Total: <Database size={22} />,
  Applied: <CheckCircle2 size={22} />,
  Pending: <Clock3 size={22} />,
  Failed: <AlertTriangle size={22} />,
};

const StatCard = ({ label, value, sub, color }) => {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-top">
        <div className="stat-icon">{iconMap[label]}</div>

        <div className="stat-trend">
          <TrendingUp size={14} />

          <span>Live</span>
        </div>
      </div>

      <div className="stat-card-body">
        <span className="stat-label">{label}</span>

        <h2 className="stat-value">{value}</h2>

        <p className="stat-description">{sub}</p>
      </div>

      <div className="stat-progress">
        <div className="stat-progress-fill" />
      </div>
    </div>
  );
};

export default StatCard;
