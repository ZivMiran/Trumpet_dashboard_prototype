import { useApp } from '../../context/AppContext';
import { aBase } from '../../data/audience';
import worldMapDots from '../../data/worldMapDots.json';
import './ListenersMap.css';

export function ListenersMap() {
  const { state, update } = useApp();

  return (
    <section className="listeners-map">
      <div className="listeners-map__head">
        <div className="listeners-map__title">Listeners Map</div>
        <span className="listeners-map__sub">{aBase.length} markets · tap a hotspot</span>
      </div>

      <div className="listeners-map__body">
        <div className="listeners-map__frame" onClick={() => update({ region: null })}>
          <svg
            className="listeners-map__dots"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g fill="#3a3f47">
              {worldMapDots.points.map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r={worldMapDots.r}></circle>
              ))}
            </g>
          </svg>

          {aBase.map((m) => {
            const size = Math.round(22 + (Math.min(m.n, 650) / 650) * 44);
            const op = (0.3 + (Math.min(m.n, 650) / 650) * 0.42).toFixed(2);
            const selected = state.region === m.id;
            const hovered = state.hovered === m.id;
            return (
              <div
                key={m.id}
                className="listeners-map__marker"
                style={{
                  left: `${m.left}%`,
                  top: `${m.top}%`,
                  width: size,
                  height: size,
                  background: `rgba(227,181,58,${op})`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  update({ region: m.id });
                }}
                onMouseEnter={() => update({ hovered: m.id })}
                onMouseLeave={() => update((s) => (s.hovered === m.id ? { hovered: null } : null))}
              >
                {selected && <div className="listeners-map__marker-ring"></div>}
                {hovered && (
                  <div className="listeners-map__tooltip">
                    <span className="listeners-map__tooltip-name">{m.name}</span> ·{' '}
                    <span className="listeners-map__tooltip-listeners">{m.listeners}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
