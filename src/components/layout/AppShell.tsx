import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationsModal } from './NotificationsModal';
import { TrackDetailDrawer } from '../music/TrackDetailDrawer';
import { AlbumBreakdownDrawer } from '../music/AlbumBreakdownDrawer';
import { CityDetailDrawer } from '../audience/CityDetailDrawer';
import { CompareReleases } from '../music/CompareReleases';
import './AppShell.css';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-shell__main">
        <Header />
        {/* Detail overlays live at shell level so they open over whichever
            page is showing — a search result or insight opens them in place.
            Navigating dismisses them (see update() in AppContext). */}
        <div className="app-shell__page">
          {children}
          <TrackDetailDrawer />
          <AlbumBreakdownDrawer />
          <CityDetailDrawer />
          <CompareReleases />
        </div>
      </main>
      {/* Overlays gate themselves (useOverlayExit) so they can animate out. */}
      <NotificationDropdown />
      <NotificationsModal />
    </div>
  );
}
