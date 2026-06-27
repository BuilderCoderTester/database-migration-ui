import React from "react";
import { FileCode2, Wand2, X, ChevronRight } from "lucide-react";
import "../../styles/toggle/migration/MigrationTypeModal.css";

const MigrationTypeModal = ({ isOpen, onClose, onManual, onAutomated }) => {
  if (!isOpen) return null;

  return (
    <div className="migration-type-overlay">
      <div className="migration-type-modal">
        {/* Header */}

        <div className="migration-type-header">
          <div>
            <span className="connection-chip">CREATE MIGRATION</span>

            <h2>Choose Migration Type</h2>

            <p>Select how you want to generate the next migration.</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}

        <div className="migration-options">
          {/* Manual */}

          <div className="migration-option-card" onClick={onManual}>
            <div className="migration-option-icon manual">
              <FileCode2 size={34} />
            </div>

            <h3>Manual Migration</h3>

            <p>Write your own SQL migration using the Monaco SQL editor.</p>

            <div className="option-footer">
              Create Manually
              <ChevronRight size={16} />
            </div>
          </div>

          {/* Automated */}

          <div className="migration-option-card" onClick={onAutomated}>
            <div className="migration-option-icon auto">
              <Wand2 size={34} />
            </div>

            <h3>Automated Migration</h3>

            <p>
              Generate migration scripts automatically by comparing database
              schemas.
            </p>

            <div className="option-footer">
              Open Builder
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationTypeModal;
