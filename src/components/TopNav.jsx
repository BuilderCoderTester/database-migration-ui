import React from 'react';
import { Database } from 'lucide-react';
import '../MigrateDB.css';

const TopNav = ({ activeTab, setActiveTab }) => (
    <nav className="topnav">

        {/* Logo Section */}
        <div className="topnav-left">
            <div className="logo-box">
                <Database size={16} />
            </div>

            <div className="logo-text">
                <div className="title">MigrateDB</div>
                <div className="version">v1.0.0</div>
            </div>
        </div>



        {/* Right Status */}
        <div className="topnav-right">
            <div className="env-badge">
                <span className="dot" />
                prod-postgres-01
            </div>

        </div>

    </nav>
);

export default TopNav;