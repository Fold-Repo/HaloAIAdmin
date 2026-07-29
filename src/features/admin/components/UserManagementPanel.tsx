import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateUserStatus } from '@/features/admin/hooks/useAdminPortal';
import { USER_STATUS_LABELS } from '@/features/admin/utils/admin.utils';
import { formatRelativeDate } from '@/features/creator/utils/creator.utils';
import type { AdminUser, AdminUserStatus } from '@/types';

function statusVariant(status: AdminUserStatus) {
  switch (status) {
    case 'active':
      return 'success' as const;
    case 'suspended':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
}

export function UserManagementPanel({ users }: { users: AdminUser[] }) {
  const updateStatus = useUpdateUserStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">User management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left">
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Last active</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-muted-foreground text-xs">{user.email}</p>
                  </td>
                  <td className="py-3 capitalize">{user.role}</td>
                  <td className="py-3">
                    <Badge variant={statusVariant(user.status)}>
                      {USER_STATUS_LABELS[user.status]}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground py-3">
                    {formatRelativeDate(user.lastActiveAt)}
                  </td>
                  <td className="py-3">
                    {user.status !== 'suspended' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updateStatus.isPending}
                        onClick={() =>
                          updateStatus.mutate({ userId: user.id, status: 'suspended' })
                        }
                      >
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updateStatus.isPending}
                        onClick={() =>
                          updateStatus.mutate({ userId: user.id, status: 'active' })
                        }
                      >
                        Activate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
