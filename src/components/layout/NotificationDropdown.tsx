import { useApp } from '../../context/AppContext';
import { notifications } from '../../data/notifications';
import { NoteIcon } from '../icons';
import { useOverlayExit } from '../../lib/useOverlayExit';
import './NotificationDropdown.css';

export function NotificationDropdown() {
  const { state, update } = useApp();
  const { readAll } = state;
  const { mounted, closing } = useOverlayExit(state.notifOpen || null);
  if (!mounted) return null;

  const allNotifs = notifications.map((n) => {
    const unread = n.unread && !readAll;
    return { ...n, dot: unread, bg: unread ? 'rgba(227,181,58,.05)' : 'transparent' };
  });
  const unreadCount = allNotifs.filter((n) => n.dot).length;
  const hasUnread = unreadCount > 0;

  const closeNotif = () => update({ notifOpen: false });
  const markAll = () => update({ readAll: true });
  const openWindow = () => update({ winOpen: true, notifOpen: false, notifQuery: '' });

  return (
    <>
      <div className={`notif-scrim${closing ? ' notif-scrim--closing' : ''}`} onClick={closeNotif} />
      <div className={`notif-dropdown${closing ? ' notif-dropdown--closing' : ''}`}>
        <div className="notif-dropdown__header">
          <div className="notif-dropdown__title">Notifications</div>
          {hasUnread && <div className="notif-pill">{unreadCount} new</div>}
          <button type="button" className="notif-dropdown__mark-all" onClick={markAll}>Mark all read</button>
        </div>
        <div className="notif-dropdown__list">
          {allNotifs.map((n) => (
            <div key={n.id} className="notif-row" style={{ background: n.bg }}>
              <div className="notif-row__icon"><NoteIcon /></div>
              <div className="notif-row__body">
                <div className="notif-row__top">
                  <div className="notif-row__title">{n.title}</div>
                  <div className="notif-row__time">{n.time}</div>
                </div>
                <div className="notif-row__body-text">{n.body}</div>
              </div>
              {n.dot && <div className="notif-row__dot" />}
            </div>
          ))}
        </div>
        <div className="notif-dropdown__footer">
          <button type="button" className="notif-dropdown__see-all" onClick={openWindow}>See all notifications →</button>
        </div>
      </div>
    </>
  );
}
