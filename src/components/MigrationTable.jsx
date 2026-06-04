import React from 'react';
import axios from 'axios';
import { CheckCircle2 } from 'lucide-react';
import '../MigrateDB.css';

const MigrationTable = ({ searchQuery, data = [] }) => {

    const handleRepair = async (version) => {
        try {

            const response = await axios.post(
                `http://localhost:8081/api/migrations/repair?version=${version}`
            );

            alert(
                response.data?.message ||
                `Migration ${version} repaired successfully`
            );

            window.location.reload();

        } catch (err) {

            console.error(err);

            alert('Repair failed');
        }
    };

    const filteredData = data.filter(item =>
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.version)?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="table-container">
            <table className="migration-table">

                <thead>
                    <tr>
                        <th className="col-icon"></th>
                        <th>Version</th>
                        <th>Description</th>
                        <th>Applied On</th>
                        <th>Duration</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>

                    {filteredData.length === 0 && (
                        <tr>
                            <td
                                colSpan="6"
                                style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    color: '#555d6e'
                                }}
                            >
                                No migrations found
                            </td>
                        </tr>
                    )}

                    {filteredData.map((row, i) => (
                        <tr key={i} className="table-row">

                            <td className="cell-icon">
                                {row.success
                                    ? <CheckCircle2 size={14} className="icon-success" />
                                    : <div className="dot-pending" />
                                }
                            </td>

                            <td className="mono text-dim">
                                {row.version ? `V${row.version}` : '-'}
                            </td>

                            <td className="text-main">
                                {row.description || '-'}
                            </td>

                            <td className="mono text-muted">
                                {row.executedAt || '-'}
                            </td>

                            <td className="mono text-muted">
                                {row.executionTime
                                    ? `${row.executionTime} ms`
                                    : '-'}
                            </td>

                            <td>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span
                                        className={`status-badge ${row.success
                                            ? 'success'
                                            : 'failed'
                                            }`}
                                    >
                                        {row.success ? 'Applied' : 'Failed'}
                                    </span>

                                    {!row.success && (
                                        <button
                                            className="repair-btn"
                                            onClick={() =>
                                                handleRepair(row.version)
                                            }
                                        >
                                            Repair
                                        </button>
                                    )}
                                </div>
                            </td>

                        </tr>
                    ))}

                </tbody>

            </table>
        </div>
    );
};

export default MigrationTable;