import React from "react";
import { Search, Filter, GitBranch } from "lucide-react";

import "../../styles/toggle/dashboard/SearchHeader.css";

const SearchHeader = ({ title, total, searchQuery, setSearchQuery }) => {
  return (
    <section className="search-header">
      <div className="search-header-left">
        <div className="search-title-icon">
          <GitBranch size={22} />
        </div>

        <div className="search-title">
          <h2>{title}</h2>
          <p>Manage and monitor migration versions across your database.</p>
        </div>
      </div>

      <div className="search-header-right">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by version or description..."
          />
        </div>

        <button className="filter-button">
          <Filter size={16} />
          Filter
        </button>

        <div className="result-badge">
          {total}

          <span>Results</span>
        </div>
      </div>
    </section>
  );
};

export default SearchHeader;
