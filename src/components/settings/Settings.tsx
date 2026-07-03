import { useState } from 'react';
import { platforms } from '../../data/settings';
import './Settings.css';

const navItems = ['Account', 'Notifications', 'Connected platforms', 'Billing'];

const prefs = [
  { title: 'Weekly pulse email', desc: "A Monday digest of last week's movement.", on: true },
  { title: 'Anomaly alerts', desc: 'Ping me on unusual spikes or dips.', on: false },
  { title: 'Milestone alerts', desc: 'Notify on stream & follower milestones.', on: true },
];

const fields = [
  { label: 'Display Name', value: 'Echo Theory', muted: false, caret: false },
  { label: 'Primary Genre', value: 'Indie Electronic', muted: true, caret: true },
  { label: 'Primary Market', value: 'United States', muted: true, caret: true },
  { label: 'Label', value: 'Independent', muted: true, caret: false },
];

export function Settings() {
  const [prefOn, setPrefOn] = useState(prefs.map((p) => p.on));
  const togglePref = (i: number) =>
    setPrefOn((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="settings-page">
      <nav className="settings-page__nav">
        {navItems.map((item, i) => (
          <div key={item} className={i === 0 ? 'settings-page__nav-item settings-page__nav-item--active' : 'settings-page__nav-item'}>
            {item}
          </div>
        ))}
      </nav>

      <div className="settings-page__content">
        <div className="settings-page__top-grid">
          {/* Artist profile */}
          <div className="settings-card">
            <div className="settings-card__head">
              <div className="settings-card__title">Artist profile</div>
              <button type="button" className="settings-card__save-btn">Save changes</button>
            </div>
            <div className="settings-profile">
              <div className="settings-profile__row">
                <div className="settings-profile__avatar">ET</div>
                <div className="settings-profile__id">
                  <div className="settings-profile__name">Echo Theory</div>
                  <div className="settings-profile__meta">Verified artist · joined 2021</div>
                </div>
                <button type="button" className="settings-profile__change">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                    <circle cx="12" cy="13" r="3"></circle>
                  </svg>
                  Change
                </button>
              </div>
              <div className="settings-profile__fields">
                {fields.map((f) => (
                  <div key={f.label}>
                    <div className="settings-profile__field-label">{f.label}</div>
                    <div
                      className={
                        f.caret
                          ? 'settings-profile__field settings-profile__field--select'
                          : 'settings-profile__field'
                      }
                      style={{ color: f.muted ? '#bdbbb1' : '#f0ede5' }}
                    >
                      {f.value}
                      {f.caret && <span className="settings-profile__caret">▾</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="settings-card settings-prefs">
            <div className="settings-card__title settings-prefs__title">Preferences</div>
            {prefs.map((p, i) => (
              <div key={p.title} className="settings-prefs__row">
                <div className="settings-prefs__text">
                  <div className="settings-prefs__name">{p.title}</div>
                  <div className="settings-prefs__desc">{p.desc}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefOn[i]}
                  aria-label={p.title}
                  className={prefOn[i] ? 'settings-toggle settings-toggle--on' : 'settings-toggle'}
                  onClick={() => togglePref(i)}
                >
                  <div className="settings-toggle__knob"></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Connected platforms */}
        <div className="settings-card">
          <div className="settings-platforms__head">
            <div className="settings-card__title">Connected platforms</div>
            <div className="settings-platforms__sub">4 of 6 connected — syncing every 15 min</div>
          </div>
          <div className="settings-platforms__grid">
            {platforms.map((p) => (
              <div key={p.name} className="settings-platform">
                <div className="settings-platform__icon">
                  <span className="settings-platform__dot" style={{ background: p.color }}></span>
                </div>
                <div className="settings-platform__info">
                  <div className="settings-platform__name">{p.name}</div>
                  <div className="settings-platform__status">
                    <span className="settings-platform__status-dot" style={{ background: p.statusDot }}></span>
                    {p.status}
                  </div>
                </div>
                {p.connectable && <button type="button" className="settings-platform__connect">Connect</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
