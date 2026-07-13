import { useApp } from '../../context/AppContext';
import { notifications } from '../../data/notifications';
import { SearchIcon, CloseIcon, NoteIcon } from '../icons';
import { useOverlayExit } from '../../lib/useOverlayExit';
import './NotificationsModal.css';

const winFilterKeys = ['All', 'Insights', 'Milestones', 'Account'] as const;

export function NotificationsModal() {
  const { state, update } = useApp();
  const { readAll, winFilter, notifQuery } = state;
  const { mounted, closing } = useOverlayExit(state.winOpen || null);
  if (!mounted) return null;

  const allNotifs = notifications.map((n) => {
    const unread = n.unread && !readAll;
    return { ...n, dot: unread, bg: unread ? 'rgba(227,181,58,.05)' : 'transparent' };
  });

  const wf = winFilter;
  const nq = notifQuery.trim().toLowerCase();
  const winList = allNotifs
    .filter((n) => wf === 'All' || n.kind === wf)
    .filter((n) => !nq || (n.title + ' ' + n.body + ' ' + n.kind).toLowerCase().includes(nq));
  const noNotifResults = winList.length === 0;

  const closeWindow = () => update({ winOpen: false });
  const markAll = () => update({ readAll: true });

  return (
    <>
      <div className={`modal-scrim${closing ? ' modal-scrim--closing' : ''}`} onClick={closeWindow} />
      <div className={`notif-modal${closing ? ' notif-modal--closing' : ''}`}>
        <div className="notif-modal__header">
          <div className="notif-modal__title">All notifications</div>
          <div className="notif-modal__count">{allNotifs.length}</div>
          <button type="button" className="notif-modal__mark-all" onClick={markAll}>Mark all read</button>
          <button type="button" className="notif-modal__close" onClick={closeWindow}><CloseIcon /></button>
        </div>

        <div className="notif-modal__toolbar">
          <div className="notif-modal__search">
            <SearchIcon size={14} />
            <input
              className="notif-modal__search-input"
              value={notifQuery}
              onChange={(e) => update({ notifQuery: e.target.value })}
              placeholder="Search notifications…"
            />
          </div>
          <div className="notif-modal__filters">
            {winFilterKeys.map((label) => (
              <button
                key={label}
                type="button"
                className={`notif-filter-pill ${wf === label ? 'notif-filter-pill--active' : ''}`}
                onClick={() => update({ winFilter: label })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="notif-modal__list">
          {winList.map((n) => (
            <div key={n.id} className="notif-modal-row" style={{ background: n.bg }}>
              <div className="notif-modal-row__icon"><NoteIcon size={16} /></div>
              <div className="notif-modal-row__body">
                <div className="notif-modal-row__top">
                  <div className="notif-modal-row__title">{n.title}</div>
                  <div className="notif-modal-row__time">{n.time}</div>
                </div>
                <div className="notif-modal-row__body-text">{n.body}</div>
                <div className="notif-modal-row__kind">
                  <span className="notif-modal-row__kind-pill">{n.kind}</span>
                </div>
              </div>
              {n.dot && <div className="notif-modal-row__dot" />}
            </div>
          ))}
          {noNotifResults && <div className="notif-modal__empty">No notifications match your search.</div>}
        </div>
      </div>
    </>
  );
}
