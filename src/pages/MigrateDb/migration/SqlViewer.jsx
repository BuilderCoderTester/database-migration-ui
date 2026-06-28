import React, { useState } from "react";
import {
  FileCode2,
  Copy,
  Check,
} from "lucide-react";

import "../../styles/toggle/migration/SqlViewer.css";

const SqlViewer = ({
  title = "SQL Script",
  sql = "",
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sql || "");

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (err) {
      console.error(err);
    }
  };

  const lines = (sql || "").split("\n");

  return (
    <div className="sql-viewer">

      <div className="sql-header">

        <div className="sql-title">

          <FileCode2 size={18} />

          <span>{title}</span>

        </div>

        <button
          className="copy-btn"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check size={16} />
              Copied
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy
            </>
          )}
        </button>

      </div>

      <div className="sql-body">

        {lines.length === 0 ? (

          <div className="sql-empty">

            No SQL script available.

          </div>

        ) : (

          lines.map((line, index) => (

            <div
              key={index}
              className="sql-line"
            >

              <span className="line-number">
                {index + 1}
              </span>

              <code className="line-code">
                {line || " "}
              </code>

            </div>

          ))

        )}

      </div>

    </div>
  );
};

export default SqlViewer;