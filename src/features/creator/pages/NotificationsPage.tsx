import { NotificationList } from '@/features/creator/components/NotificationList';

export function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          AI job updates, render queue events, and publishing alerts.
        </p>
      </div>
      <NotificationList />
    </div>
  );
}
