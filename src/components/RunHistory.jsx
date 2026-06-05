import React, { useEffect, useState } from "react";

const API = "http://localhost:8081/api/migrations";

const RunHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const connRes = await fetch(`${API}/get-connection`);
            const connectionId = await connRes.json();

            const res = await fetch(
                `${API}/history?connectionId=${connectionId}`
            );

            const data = await res.json();

            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: "20px" }}>Loading...</div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Run History</h2>

            <table className="migration-table">
                <thead>
                    <tr>
                        <th>Version</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Executed At</th>
                        <th>Execution Time</th>
                        <th>Error</th>
                    </tr>
                </thead>

                <tbody>
                    {history.length === 0 ? (
                        <tr>
                            <td colSpan="6">No run history found</td>
                        </tr>
                    ) : (
                        history.map((item, index) => (
                            <tr key={index}>
                                <td>{item.version}</td>
                                <td>{item.description}</td>

                                <td>
                                    {item.success ? (
                                        <span style={{ color: "green" }}>
                                            SUCCESS
                                        </span>
                                    ) : (
                                        <span style={{ color: "red" }}>
                                            FAILED
                                        </span>
                                    )}
                                </td>

                                <td>
                                    {item.executedAt
                                        ? new Date(item.executedAt).toLocaleString()
                                        : "-"}
                                </td>

                                <td>
                                    {item.executionTime
                                        ? `${item.executionTime} ms`
                                        : "-"}
                                </td>

                                <td>{item.errorMessage || "-"}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RunHistory;