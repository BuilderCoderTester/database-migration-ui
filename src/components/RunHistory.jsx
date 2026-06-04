import React from "react";

const RunHistory = ({ history }) => {
    return (
        <div className="content-area">

            <div className="content-header">
                <span>Run History</span>
                <span className="badge">
                    {history.length} runs
                </span>
            </div>

            <table className="migration-table">
                <thead>
                    <tr>
                        <th>Version</th>
                        <th>Description</th>
                        <th>Executed At</th>
                        <th>Duration</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {history.map((row, i) => (
                        <tr key={i}>
                            <td>{row.version}</td>
                            <td>{row.description}</td>
                            <td>{row.executedAt}</td>
                            <td>{row.executionTime} ms</td>
                            <td>
                                {row.success
                                    ? "Applied"
                                    : "Failed"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
};

export default RunHistory;