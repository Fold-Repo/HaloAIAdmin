import { Link } from 'react-router-dom';

import { EmptyState, QueryError } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useMarkAllNotificationsRead, useMarkNotificationRead } from '@/features/creator/hooks/useCreatorMutations';
import { useNotifications } from '@/features/creator/hooks/useCreatorQueries';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import { ROUTES } from '@/constants';
import { cn } from '@/utils';
import type { CreatorNotification } from '@/types';

function NotificationItem({
  notification,
  onRead,
}: {
  notification: CreatorNotification;
  onRead: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        !notification.read && 'border-primary/30 bg-primary/5',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-muted-foreground mt-1 text-xs">{notification.message}</p>
          <p className="text-muted-foreground mt-2 text-xs">
            {formatRelativeDate(notification.createdAt)}
          </p>
        </div>
        {!notification.read && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => onRead(notification.id)}
          >
            Mark read
          </Button>
        )}
      </div>
      {notification.link && (
        <Link
          to={notification.link}
          className="text-primary mt-2 inline-block text-xs hover:underline"
        >
          View details
        </Link>
      )}
    </div>
  );
}

export function NotificationList() {
  const { data: notifications = [], isLoading, isError, error, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading notifications...</p>;
  }

  if (isError) {
    return (
      <QueryError
        title="Unable to load notifications"
        message={error?.message ?? 'Something went wrong while loading notifications.'}
        onRetry={() => void refetch()}
        className="py-8"
      />
    );
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
        </p>
        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="All caught up"
          description="You have no notifications right now."
          className="py-12"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={(id) => markRead.mutate(id)}
            />
          ))}
        </div>
      )}

      <div className="text-center">
        <Link to={ROUTES.STUDIO.NOTIFICATIONS} className="text-primary text-sm hover:underline">
          Open notifications page
        </Link>
      </div>
    </div>
  );
}
