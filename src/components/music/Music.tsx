import { MoversWidget } from './MoversWidget';
import { CatalogTable } from './CatalogTable';
import './Music.css';

export function Music() {
  return (
    <div className="music-page">
      <div className="music-page__main">
        <MoversWidget />
        <CatalogTable />
      </div>
    </div>
  );
}
