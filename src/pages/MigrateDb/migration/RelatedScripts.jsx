import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  Database,
} from "lucide-react";

import "../../styles/toggle/migration/RelatedScripts.css";

const getStatusIcon = (status, success) => {
  if (status === "PENDING")
    return <Clock3 size={16} className="pending-icon" />;

  if (success)
    return <CheckCircle2 size={16} className="success-icon" />;

  return <XCircle size={16} className="failed-icon" />;
};

const RelatedScripts = ({
  scripts = [],
  currentVersion,
  onSelect,
}) => {
  return (
    <div className="related-card">

      <div className="related-header">

        <Database size={18} />

        <div>

          <h3>Related Migration Scripts</h3>

          <p>
            All migrations belonging to this migration chain
          </p>

        </div>

      </div>

      {scripts.length === 0 ? (

        <div className="related-empty">

          No related scripts found.

        </div>

      ) : (

        <div className="related-list">

          {scripts.map((script) => {

            const active =
              script.version === currentVersion;

            return (

              <div
                key={script.version}
                className={`related-item ${
                  active ? "active" : ""
                }`}
                onClick={() => onSelect?.(script)}
              >

                <div className="related-left">

                  {getStatusIcon(
                    script.status,
                    script.success
                  )}

                  <div>

                    <div className="related-version">

                      V{script.version}

                    </div>

                    <div className="related-description">

                      {script.description}

                    </div>

                  </div>

                </div>

                <div className="related-right">

                  <span
                    className={`script-type ${(
                      script.type || "CREATE"
                    ).toLowerCase()}`}
                  >
                    {script.type || "CREATE"}
                  </span>

                </div>

              </div>

            );

          })}
        </div>

      )}
    </div>
  );
};

export default RelatedScripts;