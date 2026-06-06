import React from 'react';
import axios from 'axios';
import { CheckCircle2, Trash2 } from 'lucide-react';
import '../MigrateDB.css';

const API = "http://localhost:8081/api/migrations";

const MigrationTable = ({ searchQuery = '', data = [], onRepairSuccess, onDeleteSuccess }) => {
    const handleRepair = async (version) => {
        try {
            const { data: connectionId } = await axios.get(`${API}/get-connection`);
            if (!connectionId) return;

            await axios.post(`${API}/repair`, null, {
                params: { connectionId, versionId: version }
            });

            alert(`Migration ${version} repaired successfully`);
            onRepairSuccess?.();
        } catch (err) {
            console.error(err);
            alert('Repair failed');
        }
    };

    const handleDelete = async (version) => {
        const confirmed = window.confirm(`Are you sure you want to delete migration ${version}?`);
        if (!confirmed) return;

        try {
            const { data: connectionId } = await axios.get(`${API}/get-connection`);
            if (!connectionId) return;

            await axios.delete(`${API}/delete`, {
                params: { connectionId, versionId: version }
            });

            alert(`Migration ${version} deleted successfully`);
            onDeleteSuccess?.();
        } catch (err) {
            console.error(err);
            alert('Delete failed');
        }
    };

    const query = searchQuery.toLowerCase();
    const filteredData = data.filter(item =>
        item.description?.toLowerCase().includes(query) ||
        item.version?.toLowerCase().includes(query)
    );

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
                            <tr key={row.version} className="table-row">
                                <td className="cell-icon">
                                    {row.success ? (
                                        <CheckCircle2 size={14} className="icon-success" />
                                    ) : (
                                        <div className="dot-pending" />
                                    )}
                                </td>
                                <td className="mono text-dim">
                                    {row.version ? `V${row.version}` : '-'}
                                </td>
                                <td className="text-main">{row.description || '-'}</td>
                                <td className="mono text-muted">{row.executedAt || '-'}</td>
                                <td className="mono text-muted">
                                    {row.executionTime ? `${row.executionTime} ms` : '-'}
                                </td>
                                <td>
                                    <div className="status-cell">
                                        <span className={`status-badge ${row.success ? 'success' : 'failed'}`}>
                                            {row.success ? 'Applied' : 'Failed'}
                                        </span>
                                        {!row.success && (
                                            <div className="action-buttons">
                                                <button 
                                                    className="repair-btn"
                                                    onClick={() => handleRepair(row.version)}
                                                >
                                                    Repair
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(row.version)}
                                                    title="Delete migration"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MigrationTable;