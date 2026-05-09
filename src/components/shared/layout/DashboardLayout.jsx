import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout() {
  return (
    <>
      <div className="app-background"></div>
      <Sidebar />
      <TopBar />
      <div className="dashboard-wrapper">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}
