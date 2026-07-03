import type { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationsModal } from './NotificationsModal';
import './AppShell.css';

export function AppShell({ children }: { children: ReactNode }) {
  const { state } = useApp();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-shell__main">
        <Header />
        {children}
      </main>
      {state.notifOpen && <NotificationDropdown />}
      {state.winOpen && <NotificationsModal />}
    </div>
  );
}
