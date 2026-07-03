import { genderSegs } from '../../data/audience';
import './GenderSplitBento.css';

export function GenderSplitBento() {
  return (
    <section className="gender-split">
      <div className="gender-split__head">
        <div className="gender-split__title">Gender split</div>
        <span className="gender-split__sub">· all locations</span>
        <span className="gender-split__delta">▲ 0.6pp F</span>
      </div>
      <div className="gender-split__bar">
        {genderSegs.map((g) => (
          <div
            key={g.label}
            className="gender-split__seg"
            style={{ width: g.width, minWidth: g.minWidth, background: g.background }}
          ></div>
        ))}
      </div>
      <div className="gender-split__legend">
        {genderSegs.map((g) => (
          <span key={g.label} className="gender-split__legend-item">
            <span className="gender-split__dot" style={{ background: g.dot }}></span>
            <span className="gender-split__label">{g.label}</span>
            <span className="gender-split__pct">{g.pct}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
