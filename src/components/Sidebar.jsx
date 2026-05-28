import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>
        Fraud Signal Studio
        <span>Configuration Dashboard</span>
      </h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
        <NavLink to="/mixer" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          Scenario Summary
        </NavLink>
        <NavLink to="/studio" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          Create Scenario
        </NavLink>
        <NavLink to="/intake" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          Signal Request
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
