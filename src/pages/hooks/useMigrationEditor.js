import { useState } from "react";

const API = "http://localhost:8081/api/migrations";

export default function useMigrationEditor(loadData, getConnectionId) {
  const [selectedMigration, setSelectedMigration] = useState(null);
  const [showScriptEditor, setShowScriptEditor] = useState(false);

  const [editUpSql, setEditUpSql] = useState("");
  const [editDownSql, setEditDownSql] = useState("");

  const openMigrationScript = async (version) => {
    try {
      const connectionId = await getConnectionId();

      const response = await fetch(
        `${API}/script/${version}?connectionId=${connectionId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch migration script");
      }

      const script = await response.json();

      console.log("Fetched script:", script);

      setSelectedMigration(script);
      setEditUpSql(script.upScript || "");
      setEditDownSql(script.downScript || "");
      setShowScriptEditor(true);
    } catch (err) {
      console.error("Open script error:", err);
      alert(err.message || "Unable to open migration script");
    }
  };

  const saveMigrationScript = async () => {
    try {
      if (!selectedMigration) {
        throw new Error("No migration selected");
      }

      const connectionId = await getConnectionId();

      const response = await fetch(
        `${API}/script/update?connectionId=${connectionId}&upSql=${encodeURIComponent(
          editUpSql
        )}&downSql=${encodeURIComponent(editDownSql)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedMigration.version),
        }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Failed to update migration");
      }

      alert(message || "Migration updated successfully");

      setShowScriptEditor(false);

      await loadData();
    } catch (err) {
      console.error("Save migration error:", err);
      alert(err.message || "Failed to update migration");
    }
  };

  return {
    selectedMigration,
    showScriptEditor,
    editUpSql,
    editDownSql,
    setEditUpSql,
    setEditDownSql,
    setShowScriptEditor,
    openMigrationScript,
    saveMigrationScript,
  };
}
