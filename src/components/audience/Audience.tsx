import { AudienceKpiRibbon } from './AudienceKpiRibbon';
import { ListenersMap } from './ListenersMap';
import { AudienceSourcesBento } from './AudienceSourcesBento';
import { GenderSplitBento } from './GenderSplitBento';
import { AudienceKpiDrawer } from './AudienceKpiDrawer';
import { TrackDetailModal } from './TrackDetailModal';
import { CityDetailModal } from './CityDetailModal';
import './Audience.css';

export function Audience() {
  return (
    <div className="audience-page">
      <div className="audience-page__ribbon">
        <AudienceKpiRibbon />
      </div>

      <div className="audience-page__canvas">
        <ListenersMap />
        <div className="audience-page__side">
          <AudienceSourcesBento />
          <GenderSplitBento />
        </div>
      </div>

      <AudienceKpiDrawer />
      <TrackDetailModal />
      <CityDetailModal />
    </div>
  );
}
