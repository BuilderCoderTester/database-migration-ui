import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock3,
  ChevronRight,
} from "lucide-react";

import "../../styles/primitives/activity/ActivityTimeline.css";

const ActivityTimeline = ({
  activities = [],
  selectedActivity,
  onSelectActivity,
}) => {
  const getStatus = (status) => {
    switch ((status || "").toLowerCase()) {
      case "success":
        return {
          icon: <CheckCircle2 size={18} />,
          className: "success",
        };

      case "warning":
        return {
          icon: <AlertTriangle size={18} />,
          className: "warning",
        };

      case "failed":
      case "error":
        return {
          icon: <XCircle size={18} />,
          className: "danger",
        };

      default:
        return {
          icon: <Clock3 size={18} />,
          className: "info",
        };
    }
  };

  if (!activities.length) {
    return (
      <div className="timeline-empty">
        <Clock3 size={48} />
        <h3>No Activity Found</h3>
        <p>No migration activity has been recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="activity-timeline">

      <div className="timeline-header">

        <h2>Timeline</h2>

        <span>{activities.length} Events</span>

      </div>

      <div className="timeline-list">

        {activities.map((activity, index) => {

          const status = getStatus(activity.status);

          return (

            <div
              key={index}
              className={`timeline-item ${
                selectedActivity === activity ? "active" : ""
              }`}
              onClick={() => onSelectActivity(activity)}
            >

              <div className={`timeline-icon ${status.className}`}>
                {status.icon}
              </div>

              <div className="timeline-content">

                <div className="timeline-top">

                  <h4>{activity.operation}</h4>

                  <span>
                    {activity.createdAt || activity.time}
                  </span>

                </div>

                <p>
                  {activity.message}
                </p>

                <div className="timeline-meta">

                  <span>{activity.version}</span>

                  <span>{activity.duration}</span>

                </div>

              </div>

              <ChevronRight size={18} />

            </div>

          );
        })}

      </div>

    </div>
  );
};

export default ActivityTimeline;