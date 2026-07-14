import { useApp } from '../../context/AppContext';
import type { Page } from '../../types';
import { accountsPool } from '../../data/accounts';
import { fmtLive } from '../../lib/format';
import { asset } from '../../lib/assets';
import { CheckIcon, LogoutIcon, PlusIcon, ChevronDownIcon } from '../icons';
import { useOverlayExit } from '../../lib/useOverlayExit';
import './Sidebar.css';

const workspaceNav: { key: Page; label: string; icon: React.ReactNode }[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    key: 'music',
    label: 'Music',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.2" />
      </svg>
    ),
  },
  {
    key: 'audience',
    label: 'Audience',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const SettingsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7h-9" />
    <path d="M14 17H5" />
    <circle cx="17" cy="17" r="3" />
    <circle cx="7" cy="7" r="3" />
  </svg>
);

const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
    <path d={collapsed ? 'M13.5 9.5 16 12l-2.5 2.5' : 'M16.5 9.5 14 12l2.5 2.5'} />
  </svg>
);

export function Sidebar() {
  const { state, update } = useApp();
  const { page, activeAccts, liveCounts, acctOpen, sidebarCollapsed } = state;
  const { mounted: acctMounted, closing: acctClosing } = useOverlayExit(acctOpen || null);

  const acctId = activeAccts.includes(state.acctId) ? state.acctId : activeAccts[0];
  const curAcct = accountsPool.find((a) => a.id === acctId) || accountsPool[0];
  const nextToAdd = accountsPool.find((a) => !activeAccts.includes(a.id));
  const canAddAccount = !!nextToAdd;

  const goto = (p: Page) => update({ page: p });
  const toggleCollapse = () => update((s) => ({ sidebarCollapsed: !s.sidebarCollapsed, acctOpen: false }));
  const toggleAcct = () => update((s) => ({ acctOpen: !s.acctOpen }));
  const closeAcct = () => update({ acctOpen: false });

  const switchAccount = (id: string) => update({ acctId: id, acctOpen: false });

  const addAccount = () => {
    if (!nextToAdd) return;
    update((s) => ({ activeAccts: [...s.activeAccts, nextToAdd.id], acctId: nextToAdd.id, acctOpen: false }));
  };

  const logout = () => {
    update((s) => {
      const remaining = s.activeAccts.filter((id) => id !== acctId);
      if (remaining.length === 0) return { acctOpen: false };
      return { activeAccts: remaining, acctId: remaining[0], acctOpen: false };
    });
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <svg width="20" height="16" viewBox="43 41 129 103" fill="none" aria-hidden="true">
            <path
              d="M170 105.086C171.105 106.999 170.449 109.445 168.536 110.55L158.391 116.407C156.477 117.512 154.031 116.856 152.926 114.943L142.28 96.5039C141.176 94.5907 138.73 93.9352 136.816 95.0398L56.8951 141.182C54.9819 142.287 52.5355 141.631 51.431 139.718L46.0594 130.414C44.9548 128.501 45.6103 126.055 47.5235 124.95L73.7055 109.834L74.8842 111.876C76.2465 114.235 79.2631 115.043 81.6223 113.681L83.4711 112.614C85.8301 111.252 86.6384 108.235 85.2765 105.876L84.0978 103.834L87.5619 101.834L90.2406 106.474C91.6029 108.833 94.6195 109.641 96.9787 108.279L98.8275 107.212C101.187 105.85 101.995 102.833 100.633 100.474L97.9542 95.8341L101.418 93.8341L101.597 94.1436C102.959 96.5027 105.976 97.311 108.335 95.9491L110.184 94.8817C112.543 93.5195 113.351 90.5029 111.989 88.1436L111.811 87.8341L127.445 78.8077C129.358 77.7032 130.013 75.2568 128.909 73.3436L117.926 54.3215C116.822 52.4084 117.477 49.962 119.391 48.8574L129.536 43C131.449 41.8954 133.895 42.5509 135 44.4641L170 105.086ZM73.7055 109.834L68.8168 101.367C67.4549 99.0074 68.2632 95.9908 70.6223 94.6286L72.4711 93.5612C74.8303 92.1993 77.8469 93.0076 79.2092 95.3667L84.0978 103.834L73.7055 109.834ZM87.5619 101.834L84.1733 95.9648C82.8114 93.6055 83.6196 90.5889 85.9787 89.2267L87.8275 88.1593C90.1867 86.7974 93.2033 87.6057 94.5656 89.9648L97.9542 95.8341L87.5619 101.834ZM101.418 93.8341L95.5297 83.6346C94.1678 81.2754 94.9761 78.2588 97.3351 76.8965L99.1839 75.8292C101.543 74.4673 104.56 75.2756 105.922 77.6346L111.811 87.8341L101.418 93.8341Z"
              fill="#e3b53a"
            />
          </svg>
        </div>
        <div className="sidebar__wordmark">Trumpet</div>
        <button
          type="button"
          onClick={toggleCollapse}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="sidebar__collapse"
        >
          <CollapseIcon collapsed={sidebarCollapsed} />
        </button>
      </div>

      <div className="sidebar__section-label">Workspace</div>
      <nav className="sidebar__nav">
        {workspaceNav.map((it) => {
          const active = page === it.key;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => goto(it.key)}
              title={sidebarCollapsed ? it.label : undefined}
              className={`nav-item ${active ? 'nav-item--active' : 'nav-item--inactive'}`}
            >
              {it.icon}
              <span className="nav-item__label">{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar__section-label sidebar__section-label--account">Account</div>
      <nav className="sidebar__nav">
        <button
          type="button"
          onClick={() => goto('settings')}
          title={sidebarCollapsed ? 'Settings' : undefined}
          className={`nav-item ${page === 'settings' ? 'nav-item--active' : 'nav-item--inactive'}`}
        >
          <SettingsIcon />
          <span className="nav-item__label">Settings</span>
        </button>
      </nav>

      <div className="sidebar__acct-wrap">
        {acctMounted && (
          <>
            <div className={`acct-scrim${acctClosing ? ' acct-scrim--closing' : ''}`} onClick={closeAcct} />
            <div className={`acct-popover${acctClosing ? ' acct-popover--closing' : ''}`}>
              <div className="acct-popover__header">
                <span className="acct-popover__label">Accounts</span>
              </div>
              {activeAccts
                .map((id) => accountsPool.find((a) => a.id === id))
                .filter((a): a is (typeof accountsPool)[number] => !!a)
                .map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="acct-row"
                    style={{ background: a.id === acctId ? 'rgba(227,181,58,.08)' : 'transparent' }}
                    onClick={() => switchAccount(a.id)}
                  >
                    <div className="acct-row__avatar" style={{ background: a.color }}>
                      {a.img ? <img className="acct-avatar-img" src={asset(a.img)} alt="" /> : a.initials}
                    </div>
                    <div className="acct-row__body">
                      <div className="acct-row__name">{a.name}</div>
                      <div className="acct-row__sub">
                        <span className="acct-row__sub-dot" />
                        {fmtLive(liveCounts[a.id] || 0)} live · {a.monthly} monthly
                      </div>
                    </div>
                    {a.id === acctId && <CheckIcon />}
                  </button>
                ))}
              <div className="acct-divider" />
              {canAddAccount && (
                <button type="button" className="acct-add" onClick={addAccount}>
                  <div className="acct-add__icon"><PlusIcon /></div>
                  Add another account
                </button>
              )}
              <button type="button" className="acct-logout" onClick={logout}>
                <div className="acct-logout__icon"><LogoutIcon /></div>
                Log out
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          className={`acct-trigger ${acctOpen ? 'acct-trigger--open' : ''}`}
          onClick={toggleAcct}
          title={sidebarCollapsed ? curAcct.name : undefined}
        >
          <div className="acct-trigger__avatar" style={{ background: curAcct.color }}>
            {curAcct.img ? <img className="acct-avatar-img" src={asset(curAcct.img)} alt="" /> : curAcct.initials}
          </div>
          <div className="acct-trigger__body">
            <div className="acct-trigger__name">{curAcct.name}</div>
            <div className="acct-trigger__live-row">
              <span className="acct-trigger__live-dot" />
              <span className="acct-trigger__live-text">
                <span style={{ color: '#f0ede5', fontWeight: 500 }}>{fmtLive(liveCounts[acctId] || 0)}</span> live now
              </span>
            </div>
          </div>
          <span className="acct-trigger__chevron"><ChevronDownIcon /></span>
        </button>
      </div>
    </aside>
  );
}
