import React, { useState } from "react";
import {
  X,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

import "../../styles/toggle/migration/RollbackModal.css";

const OPTIONS = [
  {
    id: "AUTO",
    title: "Auto Detect",
    description:
      "Automatically determine the best rollback strategy.",
  },
  {
    id: "VERSION",
    title: "Rollback by Version",
    description:
      "Rollback the database to a selected migration version.",
  },
  {
    id: "CREATE",
    title: "Rollback CREATE",
    description:
      "Rollback CREATE statements only.",
  },
  {
    id: "INSERT",
    title: "Rollback INSERT",
    description:
      "Rollback INSERT statements only.",
  },
  {
    id: "ALTER",
    title: "Rollback ALTER",
    description:
      "Rollback ALTER statements only.",
  },
];

const RollbackModal = ({
  open,
  version,
  versions = [],
  onClose,
  onRollback,
}) => {
  const [strategy, setStrategy] = useState("AUTO");
  const [targetVersion, setTargetVersion] = useState("");

  if (!open) return null;

  const submit = () => {
    onRollback?.({
      currentVersion: version,
      rollbackType: strategy,
      targetVersion,
    });

    onClose();
  };

  return (
    <div className="rollback-overlay">

      <div className="rollback-modal">

        <div className="rollback-header">

          <div>

            <h2>Rollback Migration</h2>

            <p>
              Migration {version}
            </p>

          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={20}/>
          </button>

        </div>

        <div className="rollback-content">

          <h3>Select Rollback Strategy</h3>

          <div className="rollback-options">

            {OPTIONS.map(option => (

              <div
                key={option.id}
                className={`rollback-card ${
                  strategy === option.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setStrategy(option.id)
                }
              >

                <div className="rollback-radio">

                  {strategy === option.id && (
                    <CheckCircle2 size={18}/>
                  )}

                </div>

                <div>

                  <h4>
                    {option.title}
                  </h4>

                  <p>
                    {option.description}
                  </p>

                </div>

              </div>

            ))}

          </div>

          {strategy === "VERSION" && (

            <div className="version-box">

              <label>

                Target Version

              </label>

              <select
                value={targetVersion}
                onChange={(e) =>
                  setTargetVersion(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Version
                </option>

                {versions.map(v => (

                  <option
                    key={v.version}
                    value={v.version}
                  >
                    {v.version}
                  </option>

                ))}

              </select>

            </div>

          )}

          <div className="rollback-warning">

            <RotateCcw size={18}/>

            Rolling back may permanently
            remove or modify database
            objects. Please ensure a backup
            exists before continuing.

          </div>

        </div>

        <div className="rollback-footer">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            <ArrowLeft size={16}/>
            Cancel
          </button>

          <button
            className="rollback-btn"
            onClick={submit}
          >
            <RotateCcw size={16}/>
            Execute Rollback
          </button>

        </div>

      </div>

    </div>
  );
};

export default RollbackModal;