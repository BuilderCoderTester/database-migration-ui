import React from "react";
import StatCard from "./StatCard";
import "../../styles/toggle/dashboard/DashboardStats.css";
const DashboardStats = ({ stats = [] }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          sub={stat.sub}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
