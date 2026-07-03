import { useApp } from '../../context/AppContext';
import { allCitiesFor, allTrackRowsFor, nameOf } from '../../lib/audience';
import './AudienceSourcesBento.css';

const chevron = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5c6068" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"></path>
  </svg>
);

const caretUp = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"></path>
  </svg>
);

const caretDown = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"></path>
  </svg>
);

export function AudienceSourcesBento() {
  const { state, update } = useApp();
  const rid = state.region;
  const name = nameOf(rid);
  const hasRegion = !!rid;
  const citiesScope = rid ? 'within ' + name : 'worldwide';

  const allTrackRows = allTrackRowsFor(rid);
  const tracksMore = allTrackRows.length > 4;
  const topTracksShown = state.tracksAll ? allTrackRows : allTrackRows.slice(0, 4);

  const allCityRows = allCitiesFor(rid);
  const citiesMore = allCityRows.length > 4;
  const citiesShown = state.citiesAll ? allCityRows : allCityRows.slice(0, 4);

  return (
    <section className="audience-sources">
      <div className="audience-sources__head">
        <div style={{ minWidth: 0 }}>
          <div className="audience-sources__kicker">Audience Sources</div>
          <div className="audience-sources__scope">{name || 'Global'}</div>
        </div>
        {hasRegion && (
          <div className="audience-sources__reset" onClick={() => update({ region: null })}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            Reset
          </div>
        )}
      </div>

      <div className="audience-sources__body">
        <div className="audience-sources__section">
          <div className="audience-sources__section-head">
            <div className="audience-sources__section-title">Top Tracks</div>
            <span className="audience-sources__section-sub">{citiesScope}</span>
          </div>
          <div className="audience-sources__list">
            {topTracksShown.map((t) => (
              <div
                key={t.label}
                className="audience-sources__row"
                onClick={() => update({ trkDetail: { label: t.label, plays: t.plays, rank: t.rank } })}
              >
                <div className="audience-sources__rank">{t.rank}</div>
                <div className="audience-sources__name">{t.label}</div>
                <div className="audience-sources__value">{t.plays}</div>
                {chevron}
              </div>
            ))}
          </div>
          {tracksMore && (
            <div className="audience-sources__toggle" onClick={() => update((s) => ({ tracksAll: !s.tracksAll }))}>
              <span>{state.tracksAll ? 'See less' : `See all ${allTrackRows.length}`}</span>
              {state.tracksAll ? caretUp : caretDown}
            </div>
          )}
        </div>

        <div className="audience-sources__divider"></div>

        <div className="audience-sources__section">
          <div className="audience-sources__section-head">
            <div className="audience-sources__section-title">Top Cities</div>
            <span className="audience-sources__section-sub">{citiesScope}</span>
          </div>
          <div className="audience-sources__list">
            {citiesShown.map((c) => (
              <div
                key={c.name}
                className="audience-sources__row"
                onClick={() =>
                  update({ cityDetail: { name: c.name, count: c.count, rank: c.rank, arrow: c.arrow, arrowColor: c.arrowColor } })
                }
              >
                <div className="audience-sources__rank">{c.rank}</div>
                <div className="audience-sources__name">{c.name}</div>
                <div className="audience-sources__value">{c.count}</div>
                <div className="audience-sources__arrow" style={{ color: c.arrowColor }}>
                  {c.arrow}
                </div>
                {chevron}
              </div>
            ))}
          </div>
          {citiesMore && (
            <div className="audience-sources__toggle" onClick={() => update((s) => ({ citiesAll: !s.citiesAll }))}>
              <span>{state.citiesAll ? 'See less' : `See all ${allCityRows.length}`}</span>
              {state.citiesAll ? caretUp : caretDown}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
