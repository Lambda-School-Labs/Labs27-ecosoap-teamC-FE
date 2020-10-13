import React from 'react';

import 'antd/dist/antd.css';
import '../../../styles/Dashboard/DashboardHeader.css';
import { Layout } from 'antd';

const { Header } = Layout;

function DashboardHeader() {
  return (
    <div>
      <Header className="header">
        <h2 className="header-text">Dashboard Header</h2>
      </Header>
    </div>
  );
}

export default DashboardHeader;
