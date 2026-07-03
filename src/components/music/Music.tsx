import { MoversWidget } from './MoversWidget';
import { CatalogTable } from './CatalogTable';
import { TrackDetailDrawer } from './TrackDetailDrawer';
import { AlbumBreakdownDrawer } from './AlbumBreakdownDrawer';
import { CompareReleases } from './CompareReleases';
import './Music.css';

export function Music() {
  return (
    <div className="music-page">
      <div className="music-page__main">
        <MoversWidget />
        <CatalogTable />
      </div>
      <TrackDetailDrawer />
      <AlbumBreakdownDrawer />
      <CompareReleases />
    </div>
  );
}
