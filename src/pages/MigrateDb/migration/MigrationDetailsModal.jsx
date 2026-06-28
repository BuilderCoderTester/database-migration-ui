import React, { useState } from "react";
import {
  X,
  Database,
  Clock3,
  Calendar,
  FileCode2,
  ShieldCheck,
  Settings2,
  RotateCcw,
  Wrench,
  CheckCircle2,
  ArrowUpCircle,
} from "lucide-react";

import "../../styles/toggle/migration/MigrationDetailsModal.css";

import RelatedScripts from "./RelatedScripts";
import RollbackModal from "./RollbackModal";
import SqlViewer from "./SqlViewer";

const MigrationDetailsModal = ({
  open,
  migration,
  relatedScripts = [],
  onClose,

  onValidate,
  onRepair,
  onUpdate,
  onMigrate,
  onRollback,
}) => {
  const [rollbackOpen, setRollbackOpen] = useState(false);

  if (!open || !migration) return null;

  return (
    <>
      <div className="migration-details-overlay">
        <div className="migration-details">
          {/* Header */}

          <div className="details-header">
            <div>
              <h2>Migration Details</h2>

              <p>Version {migration.version}</p>
            </div>

            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="details-body">
            {/* LEFT */}

            <div className="details-left">
              <div className="info-card">
                <div className="info-grid">
                  <div>
                    <label>Version</label>

                    <span>{migration.version}</span>
                  </div>

                  <div>
                    <label>Status</label>

                    <span>{migration.success ? "Applied" : "Failed"}</span>
                  </div>

                  <div>
                    <label>Description</label>

                    <span>{migration.description}</span>
                  </div>

                  <div>
                    <label>Database</label>

                    <span>{migration.database || "PostgreSQL"}</span>
                  </div>

                  <div>
                    <label>Execution Time</label>

                    <span>{migration.executionTime} ms</span>
                  </div>

                  <div>
                    <label>Applied On</label>

                    <span>{migration.executedAt}</span>
                  </div>

                  <div>
                    <label>Checksum</label>

                    <span className="checksum">
                      {migration.checksum || "-"}
                    </span>
                  </div>

                  <div>
                    <label>Migration Type</label>

                    <span>{migration.type || "CREATE"}</span>
                  </div>
                </div>
              </div>

              <SqlViewer title="Migration SQL" sql={migration.script} />

              <RelatedScripts scripts={relatedScripts} />
            </div>

            {/* RIGHT */}

            <div className="details-right">
              <div className="action-panel">
                <h3>Actions</h3>

                <button onClick={() => onValidate(migration.version)}>
                  <ShieldCheck size={18} />
                  Validate
                </button>

                <button onClick={() => onRepair(migration.version)}>
                  <Wrench size={18} />
                  Repair
                </button>

                <button onClick={() => onUpdate(migration.version)}>
                  <ArrowUpCircle size={18} />
                  Update
                </button>

                <button onClick={() => onMigrate(migration.version)}>
                  <CheckCircle2 size={18} />
                  Migrate
                </button>

                <button
                  className="rollback-btn"
                  onClick={() => setRollbackOpen(true)}
                >
                  <RotateCcw size={18} />
                  Rollback
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RollbackModal
        open={rollbackOpen}
        version={migration.version}
        onClose={() => setRollbackOpen(false)}
        onRollback={onRollback}
      />
    </>
  );
};

export default MigrationDetailsModal;
