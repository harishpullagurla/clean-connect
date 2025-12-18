import React from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children, role }) => {
    return (
        <div className="layout">
            <Sidebar role={role} />
            <div className="main-content">
                {children}
            </div>
        </div>
    );
};

export default Layout;
