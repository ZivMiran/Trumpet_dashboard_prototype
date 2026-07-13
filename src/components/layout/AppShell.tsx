import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationsModal } from './NotificationsModal';
import './AppShell.css';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-shell__main">
        <Header />
        {children}
      </main>
      {/* Overlays gate themselves (useOverlayExit) so they can animate out. */}
      <NotificationDropdown />
      <NotificationsModal />
    </div>
  );
}
