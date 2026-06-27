import React from "react";
import {
  Activity,
  Clock3,
  Database,
  FileCode2,
  User,
  Timer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import "../../styles/primitives/activity/ActivityDetails.css";

const ActivityDetails = ({ activity }) => {
  if (!activity) {
    return (
      <div className="activity-details empty">
        <Activity size={52} />

        <h3>No Activity Selected</h3>

        <p>
          Select an activity from the timeline to view its complete details.
        </p>
      </div>
    );
  }

  const getStatus = (status) => {
    switch ((status || "").toLowerCase()) {
      case "success":
        return {
          icon: <CheckCircle2 size={18} />,
          className: "success",
          label: "Success",
        };

      case "warning":
        return {
          icon: <AlertTriangle size={18} />,
          className: "warning",
          label: "Warning",
        };

      case "failed":
      case "error":
        return {
          icon: <XCircle size={18} />,
          className: "danger",
          label: "Failed",
        };

      default:
        return {
          icon: <Clock3 size={18} />,
          className: "info",
          label: "Running",
        };
    }
  };

  const status = getStatus(activity.status);

  return (
    <div className="activity-details">
      <div className="details-header">
        <h2>Activity Details</h2>

        <span className={`details-status ${status.className}`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      <div className="details-grid">
        <DetailCard
          icon={<FileCode2 size={18} />}
          label="Operation"
          value={activity.operation || "-"}
        />

        <DetailCard
          icon={<Database size={18} />}
          label="Migration Version"
          value={activity.version || "-"}
        />

        <DetailCard
          icon={<Clock3 size={18} />}
          label="Executed At"
          value={activity.createdAt || activity.time || "-"}
        />

        <DetailCard
          icon={<Timer size={18} />}
          label="Duration"
          value={activity.duration || "-"}
        />

        <DetailCard
          icon={<User size={18} />}
          label="Executed By"
          value={activity.user || "System"}
        />
      </div>

      <div className="details-section">
        <h3>Message</h3>

        <p>{activity.message || "No message available."}</p>
      </div>

      <div className="details-section">
        <h3>Raw Log</h3>

        <pre>{activity.rawLog || JSON.stringify(activity, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ActivityDetails;

const DetailCard = ({ icon, label, value }) => (
  <div className="detail-card">
    <div className="detail-icon">{icon}</div>

    <div>
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  </div>
);
