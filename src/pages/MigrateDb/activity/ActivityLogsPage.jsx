import React, { useEffect, useState } from "react";
import { Activity, Search, RefreshCw } from "lucide-react";

import "../../styles/primitives/activity/ActivityLogsPage.css";

import ActivityTimeline from "./ActivityTimeline";
import ActivityDetails from "./ActivityDetails";

import { API } from "../../constants/api";
import { safeJson } from "../../utils/http";
import { getConnectionId } from "../../hooks/useConnection";

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [search, setSearch] = useState("");

  const loadLogs = async () => {
    try {
      const connectionId = await getConnectionId();

      const res = await fetch(
        `${API}/logs?connectionId=${connectionId}`
      );

      const data = await safeJson(res);

      const activity = Array.isArray(data) ? data : [];

      setLogs(activity);
      setFilteredLogs(activity);

      if (activity.length > 0) {
        setSelectedActivity(activity[0]);
      }
    } catch (err) {
      console.error(err);
      setLogs([]);
      setFilteredLogs([]);
      setSelectedActivity(null);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const q = search.toLowerCase();

    setFilteredLogs(
      logs.filter(
        (log) =>
          log.message?.toLowerCase().includes(q) ||
          log.operation?.toLowerCase().includes(q) ||
          log.status?.toLowerCase().includes(q) ||
          log.version?.toLowerCase().includes(q)
      )
    );
  }, [logs, search]);

  return (
    <div className="activity-page">

      {/* Header */}

      <div className="activity-header">

        <div>

          <div className="activity-title">

            <Activity size={24} />

            <h2>Activity Logs</h2>

          </div>

          <p>
            Monitor every migration, validation, repair and rollback executed
            on the connected database.
          </p>

        </div>

        <button
          className="btn btn-secondary"
          onClick={loadLogs}
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>

      {/* Search */}

      <div className="activity-search">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search activity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* Main Layout */}

      <div className="activity-layout">

        <ActivityTimeline
          activities={filteredLogs}
          selectedActivity={selectedActivity}
          onSelectActivity={setSelectedActivity}
        />

        <ActivityDetails
          activity={selectedActivity}
        />

      </div>

    </div>
  );
};

export default ActivityLogsPage;