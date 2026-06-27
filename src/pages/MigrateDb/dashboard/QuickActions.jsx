import React from "react";
import {
  ArrowDownToLine,
  ShieldCheck,
  Wrench,
  RotateCcw,
} from "lucide-react";

import "../../styles/toggle/dashboard/QuickActions.css";

const QuickActions = ({
  loading,
  onMigrate,
  onValidate,
  onRepair,
  onRollback,
}) => {
  return (
    <section className="quick-actions">

      <ActionButton
        icon={<ArrowDownToLine size={18} />}
        title={loading ? "Migrating..." : "Run Migration"}
        description="Execute pending migrations"
        color="primary"
        onClick={onMigrate}
        disabled={loading}
      />

      <ActionButton
        icon={<ShieldCheck size={18} />}
        title="Validate"
        description="Verify checksums"
        color="success"
        onClick={onValidate}
      />

      <ActionButton
        icon={<Wrench size={18} />}
        title="Repair"
        description="Repair metadata"
        color="warning"
        onClick={onRepair}
      />

      <ActionButton
        icon={<RotateCcw size={18} />}
        title="Rollback"
        description="Rollback latest version"
        color="danger"
        onClick={onRollback}
      />

    </section>
  );
};

export default QuickActions;

const ActionButton = ({
  icon,
  title,
  description,
  color,
  onClick,
  disabled,
}) => (
  <button
    className={`action-button ${color}`}
    onClick={onClick}
    disabled={disabled}
  >
    <div className="action-button-icon">
      {icon}
    </div>

    <div className="action-button-content">
      <h4>{title}</h4>
      <span>{description}</span>
    </div>
  </button>
);