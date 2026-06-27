import { useState } from "react";
import { API } from "../constants/api";

export default function useMigration(
  getConnectionId,
  loadData,
  loadTables
) {
  const [loading, setLoading] = useState(false);

  // ============================
  // MIGRATE
  // ============================

  const handleMigrate = async () => {
    try {
      setLoading(true);

      const connectionId = await getConnectionId();

      const response = await fetch(
        `${API}/migrate?connectionId=${connectionId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Migration failed");
      }

      await loadData();
      await loadTables();
    } catch (err) {
      console.error("Migration Error:", err);
      alert(err.message || "Migration failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // ROLLBACK
  // ============================

  const handleRollback = async () => {
    try {
      setLoading(true);

      const connectionId = await getConnectionId();

      const response = await fetch(
        `${API}/rollback?connectionId=${connectionId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Rollback failed");
      }

      await loadData();
      await loadTables();
    } catch (err) {
      console.error("Rollback Error:", err);
      alert(err.message || "Rollback failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // VALIDATE
  // ============================

  const handleValidate = async () => {
    try {
      setLoading(true);

      const connectionId = await getConnectionId();

      const response = await fetch(
        `${API}/validate?connectionId=${connectionId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Validation failed");
      }

      await loadData();
    } catch (err) {
      console.error("Validation Error:", err);
      alert(err.message || "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // REPAIR
  // ============================

  const handleRepair = async () => {
    try {
      setLoading(true);

      const connectionId = await getConnectionId();

      const response = await fetch(
        `${API}/repair?connectionId=${connectionId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Repair failed");
      }

      await loadData();
      await loadTables();
    } catch (err) {
      console.error("Repair Error:", err);
      alert(err.message || "Repair failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,

    handleMigrate,
    handleRollback,
    handleValidate,
    handleRepair,
  };
}
