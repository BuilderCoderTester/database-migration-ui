import React from "react";
import {
  Database,
  Code2,
  Cpu,
  User,
  Info,
  ShieldCheck,
} from "lucide-react";

import "../../styles/system/About.css";

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <Database size={42} />

        <div>
          <h1>MigrateDB</h1>
          <p>Database Migration Platform</p>
        </div>
      </div>

      <div className="about-grid">
        {/* Application */}

        <div className="about-card">
          <div className="card-title">
            <Info size={18} />
            Application
          </div>

          <div className="about-row">
            <span>Version</span>
            <strong>0.0.2</strong>
          </div>

          <div className="about-row">
            <span>Build</span>
            <strong>Development</strong>
          </div>

          <div className="about-row">
            <span>Release Date</span>
            <strong>July 2026</strong>
          </div>
        </div>

        {/* Technology */}

        <div className="about-card">
          <div className="card-title">
            <Cpu size={18} />
            Technology Stack
          </div>

          <div className="about-row">
            <span>Backend</span>
            <strong>Spring Boot</strong>
          </div>

          <div className="about-row">
            <span>Frontend</span>
            <strong>React</strong>
          </div>

          <div className="about-row">
            <span>Language</span>
            <strong>Java 21</strong>
          </div>
        </div>

        {/* Features */}

        <div className="about-card">
          <div className="card-title">
            <Code2 size={18} />
            Features
          </div>

          <ul className="feature-list">
            <li>Migration Scripts</li>
            <li>Rollback Support</li>
            <li>Migration History</li>
            <li>Pending Migration Detection</li>
            <li>Checksum Validation</li>
            <li>Driver Manager</li>
            <li>Activity Logging</li>
            <li>Dependency Validation</li>
          </ul>
        </div>

        {/* Developer */}

        <div className="about-card">
          <div className="card-title">
            <User size={18} />
            Developer
          </div>

          <div className="about-row">
            <span>Name</span>
            <strong>Anurag Sarkar</strong>
          </div>

          <div className="about-row">
            <span>Role</span>
            <strong>Software Engineer</strong>
          </div>

          <div className="about-row">
            <span>Company</span>
            <strong>Personal Project</strong>
          </div>
        </div>

        {/* License */}

        <div className="about-card full-width">
          <div className="card-title">
            <ShieldCheck size={18} />
            License
          </div>

          <p>
            MigrateDB is a database migration platform designed to simplify
            schema versioning, deployment, rollback, and database management.
          </p>
        </div>
      </div>

      <div className="about-footer">
        <Code2 size={16} />

        <span>© 2026 MigrateDB. All rights reserved.</span>
      </div>
    </div>
  );
};

export default AboutPage;
