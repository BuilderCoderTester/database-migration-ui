import React from "react";
import axios from "axios";
import { CheckCircle2, Trash2,  Settings2 } from "lucide-react";
import { useState } from "react";
import "../../styles/toggle/migration/MigrationTable.css";
import MigrationDetailsModal from "./MigrationDetailsModal";

const API = "http://localhost:8081/api/migrations";

const MigrationTable = ({
  searchQuery = "",
  data = [],
  onRepairSuccess,
  onDeleteSuccess
}) => {
  const [selectedMigration, setSelectedMigration] = useState(null);

  const [relatedScripts, setRelatedScripts] = useState([]);

  const [openDetails, setOpenDetails] = useState(false);
  const handleRepair = async (version) => {
    try {
      const { data: connectionId } = await axios.get(`${API}/get-connection`);
      if (!connectionId) return;

      await axios.post(`${API}/repair`, null, {
        params: { connectionId, versionId: version },
      });

      alert(`Migration ${version} repaired successfully`);
      onRepairSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Repair failed");
    }
  };

  const handleMigrate = async (version) => {
    try {
      const { data: connectionId } = await axios.get(`${API}/get-connection`);
      if (!connectionId) return;

      await axios.post(`${API}/migrateByVersion`, null, {
        params: { connectionId, versionId: version },
      });

      alert(`Migration ${version} migrated successfully`);
      onRepairSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Migration failed");
    }
  };

  const handleUpdate = async (version) => {
    try {
      const { data: connectionId } = await axios.get(`${API}/get-connection`);
      if (!connectionId) return;

      await axios.post(`${API}/script/migrate`, null, {
        params: { connectionId, versionId: version },
      });

      alert(`Migration ${version} migrated and updated successfully`);
      onRepairSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Migration Updation failed");
    }
  };
  const handleDelete = async (version) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete migration ${version}?`,
    );
    if (!confirmed) return;

    try {
      const { data: connectionId } = await axios.get(`${API}/get-connection`);
      if (!connectionId) return;

      await axios.delete(`${API}/delete`, {
        params: { connectionId, versionId: version },
      });

      alert(`Migration ${version} deleted successfully`);
      onDeleteSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };
  const handleValidate = async (version) => {
    try {
      const { data: connectionId } = await axios.get(`${API}/get-connection`);

      if (!connectionId) return;

      const response = await axios.post(`${API}/validate`, null, {
        params: {
          connectionId,
          versionId: version,
        },
      });

      alert(response.data?.message || `Validation successful for ${version}`);
    } catch (err) {
      console.error(err);
      alert(`Validation failed for ${version}`);
    }
  };

  const query = searchQuery.toLowerCase();
  const filteredData = data.filter(
    (item) =>
      item.description?.toLowerCase().includes(query) ||
      item.version?.toLowerCase().includes(query),
  );
  
  const openMigrationDetails = async (version) => {
    try {
      const { data: connectionId } = await axios.get(`${API}/get-connection`);

      const { data } = await axios.get(`${API}/details`, {
        params: {
          connectionId,
          versionId: version,
        },
      });

      setSelectedMigration(data.migration);

      setRelatedScripts(data.relatedScripts);

      setOpenDetails(true);
    } catch (err) {
      console.error(err);
    }
  };
  const handleRollback = async ({
    currentVersion,
    rollbackType,
    targetVersion,
  }) => {
    const { data: connectionId } = await axios.get(`${API}/get-connection`);

    await axios.post(`${API}/rollback-version`, {
      connectionId,

      version: currentVersion,

      rollbackType,

      targetVersion,
    });
  };
  return (
    <div className="table-container">
      <table className="migration-table">
        <thead>
          <tr>
            <th className="col-icon" scope="col"></th>
            <th scope="col">Version</th>
            <th scope="col">Description</th>
            <th scope="col">Applied On</th>
            <th scope="col">Duration</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-data">
                No migrations found
              </td>
            </tr>
          ) : (
            filteredData.map((row) => (
              <tr key={row.version} className="migration-row">
                <td className="cell-icon">
                  {row.success ? (
                    <CheckCircle2 size={14} className="icon-success" />
                  ) : (
                    <div className="dot-pending" />
                  )}
                </td>
                <td className="mono text-dim">
                  {row.version ? `${row.version}` : "-"}
                </td>
                <td className="text-main">{row.description || "-"}</td>
                <td className="mono text-muted">{row.executedAt || "-"}</td>
                <td className="mono text-muted">
                  {row.executionTime ? `${row.executionTime} ms` : "-"}
                </td>

                <td>
                  <div className="status-cell">
                    <span
                      className={`status-badge ${
                        row.success ? "success" : "failed"
                      }`}
                    >
                      {row.success ? "Applied" : "Failed"}
                    </span>

                    <div className="action-buttons">
                      <button onClick={() => openMigrationDetails(row.version)}>
                        <Settings2 size={15} />
                      </button>

                      {!row.success && (
                        <>
                          
                        </>
                      )}

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(row.version)}
                        title="Delete Migration"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <MigrationDetailsModal
        open={openDetails}
        migration={selectedMigration}
        relatedScripts={relatedScripts}
        onClose={() => setOpenDetails(false)}
        onValidate={handleValidate}
        onRepair={handleRepair}
        onUpdate={handleUpdate}
        onMigrate={handleMigrate}
        onRollback={handleRollback}
      />
    </div>
  );
};

export default MigrationTable;
