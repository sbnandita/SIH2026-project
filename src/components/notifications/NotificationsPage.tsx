import React, { useState } from 'react';
import { UserProfile, AppNotification, NotificationFilter } from '../../types';
import { FitronDB } from '../../lib/db';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Sparkles, 
  Trophy, 
  Users, 
  Dumbbell, 
  Gamepad2, 
  Target, 
  Zap,
  Clock
} from 'lucide-react';

interface NotificationsPageProps {
  userProfile: UserProfile;
  onNotificationsUpdated: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  userProfile,
  onNotificationsUpdated,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>('ALL');
  const notifications = FitronDB.getNotifications();

  const filteredNotifications = selectedFilter === 'ALL'
    ? notifications
    : notifications.filter(n => n.category === selectedFilter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    FitronDB.markAllNotificationsRead();
    onNotificationsUpdated();
  };

  const handleMarkAsRead = (id: string) => {
    FitronDB.markNotificationRead(id);
    onNotificationsUpdated();
  };

  const getCategoryIcon = (category: NotificationFilter) => {
    switch (category) {
      case 'FRIENDS': return <Users className="w-4 h-4 text-blue-400" />;
      case 'FITNESS': return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'GAME': return <Gamepad2 className="w-4 h-4 text-crimson-pastel" />;
      case 'CHALLENGES': return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'ACHIEVEMENTS': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'GOALS': return <Target className="w-4 h-4 text-pink-400" />;
      case 'SYSTEM':
      default:
        return <Sparkles className="w-4 h-4 text-text-secondary" />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl fitron-card p-6 sm:p-8 border border-border-subtle bg-gradient-to-r from-bg-card via-bg-secondary to-[#1c060f]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-dark/40 border border-crimson/40 text-crimson-pastel text-xs font-semibold uppercase tracking-wider mb-2">
              <Bell className="w-3.5 h-3.5" />
              Realtime Notification Center
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
              NOTIFICATIONS
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              Stay updated on friend requests, XP transactions, stage unlocks, challenges, and achievements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn-crimson px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-crimson-sm"
              >
                <CheckCheck className="w-4 h-4" /> Mark All Read ({unreadCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border-subtle">
        {[
          'ALL',
          'FRIENDS',
          'FITNESS',
          'GAME',
          'CHALLENGES',
          'ACHIEVEMENTS',
          'GOALS',
          'SYSTEM',
        ].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter as NotificationFilter)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              selectedFilter === filter
                ? 'bg-crimson text-white shadow-crimson-sm'
                : 'bg-bg-card text-text-secondary hover:text-white hover:bg-bg-elevated border border-border-subtle'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="fitron-card rounded-3xl border border-border-subtle overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-sm space-y-2">
            <Bell className="w-8 h-8 mx-auto text-text-muted opacity-40" />
            <p>No notifications found in this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id)}
                className={`p-5 flex items-start justify-between gap-4 transition cursor-pointer ${
                  !notif.read ? 'bg-crimson-dark/15 hover:bg-crimson-dark/25' : 'hover:bg-bg-secondary/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-bg-secondary border border-border-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getCategoryIcon(notif.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-crimson shadow-crimson-sm" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="text-[10px] text-text-muted mt-2 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif.id);
                    }}
                    className="text-xs text-crimson-pastel font-semibold hover:underline flex-shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
