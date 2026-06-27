import { useState } from "react";
import { API } from "../constants/api";

export default function useManualMigration(loadData) {
  const [migrationName, setMigrationName] = useState("");
  const [migrationVersion, setMigrationVersion] = useState("");

  const [upSql, setUpSql] = useState(
    "-- Write your UP SQL here\n"
  );

  const [downSql, setDownSql] = useState(
    "-- Write your DOWN SQL here\n"
  );

  const [creating, setCreating] = useState(false);

  const [showManualPanel, setShowManualPanel] =
    useState(false);

  // ==========================================
  // Fetch Latest Version
  // ==========================================

  const fetchLatestVersion = async () => {
    try {
      const response = await fetch(
        `${API}/latest-version`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch latest version"
        );
      }

      const version = await response.json();

      setMigrationVersion(String(version || "1"));
    } catch (err) {
      console.error(err);
      setMigrationVersion("1");
    }
  };

  // ==========================================
  // Create Migration
  // ==========================================

  const createMigration = async () => {
    if (!migrationName.trim()) {
      alert("Please enter migration name");
      return;
    }

    try {
      setCreating(true);

      const params = new URLSearchParams();

      params.append(
        "description",
        migrationName
      );

      params.append(
        "migrateUp",
        upSql
      );

      params.append(
        "migrateDown",
        downSql
      );

      const response = await fetch(
        `${API}/create`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to create migration"
        );
      }

      await loadData();

      setMigrationName("");

      setUpSql(
        "-- Write your UP SQL here\n"
      );

      setDownSql(
        "-- Write your DOWN SQL here\n"
      );

      setShowManualPanel(false);

      await fetchLatestVersion();

      alert("Migration created successfully");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  return {
    migrationName,
    setMigrationName,

    migrationVersion,

    upSql,
    setUpSql,

    downSql,
    setDownSql,

    creating,

    showManualPanel,
    setShowManualPanel,

    fetchLatestVersion,
    createMigration,
  };
}
