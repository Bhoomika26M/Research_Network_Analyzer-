import { ArrowLeft, Bell } from 'lucide-react';
import { useDark } from '../context/DarkModeContext';
import type { AppNotification } from '../types/notifications';

interface Props {
  notifs: AppNotification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: number) => void;
  onBack: () => void;
}

export default function Notifications({ notifs, onMarkAllRead, onMarkRead, onBack }: Props) {
  const { dark } = useDark();

  const surface  = dark ? '#1c2a3a' : '#fff';
  const border   = dark ? '#2a3a50' : '#E1E4E8';
  const text1    = dark ? '#e8edf2' : '#1B1F27';
  const text2    = dark ? '#8fa3b8' : '#5B6472';
  const text3    = dark ? '#5a7490' : '#9CA3AF';
  const unreadBg = dark ? 'rgba(43,108,176,0.10)' : '#F0F5FF';

  const hasUnread = notifs.some(n => n.unread);
  const unreadCount = notifs.filter(n => n.unread).length;

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: `1px solid ${border}`,
            borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: text2,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: text1, margin: 0 }}>
            Notifications
          </h2>
          {unreadCount > 0 && (
            <div style={{ fontSize: 13, color: text3, marginTop: 2 }}>
              {unreadCount} unread
            </div>
          )}
        </div>
        {hasUnread && (
          <button
            onClick={onMarkAllRead}
            style={{
              background: 'none', border: `1px solid ${border}`,
              borderRadius: 8, padding: '7px 14px',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#2B6CB0',
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {notifs.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Bell size={36} color={text3} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: text2, marginBottom: 4 }}>No notifications</div>
            <div style={{ fontSize: 13, color: text3 }}>You're all caught up.</div>
          </div>
        ) : (
          notifs.map((n, i) => (
            <div
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                padding: '16px 22px',
                borderBottom: i < notifs.length - 1 ? `1px solid ${border}` : 'none',
                background: n.unread ? unreadBg : surface,
                cursor: n.unread ? 'pointer' : 'default',
                transition: 'background 0.1s',
              }}
            >
              {/* Dot */}
              <div style={{
                marginTop: 6,
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: n.unread ? '#2B6CB0' : 'transparent',
                border: n.unread ? 'none' : `1.5px solid ${dark ? '#2a3a50' : '#D1D5DB'}`,
              }} />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: n.unread ? 600 : 500,
                  color: text1, lineHeight: 1.35, marginBottom: 4,
                }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 13, color: text2, lineHeight: 1.5 }}>
                  {n.msg}
                </div>
                <div style={{ fontSize: 12, color: text3, marginTop: 6 }}>
                  {n.time}
                </div>
              </div>

              {/* Unread badge */}
              {n.unread && (
                <div style={{
                  flexShrink: 0,
                  padding: '2px 8px',
                  borderRadius: 99,
                  background: '#EBF4FF',
                  color: '#2B6CB0',
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  New
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
