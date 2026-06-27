import React from "react";
import { Filter, ArrowUpDown } from "lucide-react";

import "../../styles/toggle/migration/MigrationFilters.css";

const MigrationFilters = ({
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="migration-filters">
      <div className="migration-filters-left">
        <div className="filter-label">
          <Filter size={16} />
          <span>Filters</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Scripts</option>
          <option value="pending">Pending</option>
          <option value="applied">Applied</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="migration-filters-right">
        <div className="filter-label">
          <ArrowUpDown size={16} />
          <span>Sort</span>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="version-desc">Version (Newest)</option>
          <option value="version-asc">Version (Oldest)</option>
          <option value="name-asc">Description (A-Z)</option>
          <option value="name-desc">Description (Z-A)</option>
          <option value="status">Status</option>
        </select>
      </div>
    </div>
  );
};

export default MigrationFilters;
