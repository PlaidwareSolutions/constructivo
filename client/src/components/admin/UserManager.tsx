import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldAlert, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface User {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export function UserManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/users'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  const updateUserAdminStatus = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) => {
      const response = await fetch(`/api/users/${userId}/admin-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user admin status');
      }

      return response.json();
    },
    onMutate: async ({ userId, isAdmin }) => {
      await queryClient.cancelQueries({ queryKey: ['/api/users'] });
      const previousUsers = queryClient.getQueryData<User[]>(['/api/users']);

      if (previousUsers) {
        queryClient.setQueryData<User[]>(['/api/users'], old => {
          if (!old) return previousUsers;
          return old.map(user =>
            user.id === userId
              ? { ...user, isAdmin }
              : user
          );
        });
      }

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['/api/users'], context.previousUsers);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update user admin status',
      });
    },
    onSuccess: (data, { isAdmin }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Success',
        description: `User ${isAdmin ? 'promoted to' : 'demoted from'} admin successfully`,
      });
    }
  });

  if (error) {
    return (
      <div className="flex justify-center py-8 text-destructive">
        Failed to load users. Please try refreshing the page.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="secondary">
            {users.filter(u => u.isAdmin).length} admins
          </Badge>
          <Badge variant="outline">
            {users.length} total users
          </Badge>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{format(new Date(user.createdAt), 'PP')}</TableCell>
                <TableCell>
                  <Badge variant={user.isAdmin ? "default" : "secondary"}>
                    {user.isAdmin ? "Admin" : "User"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {currentUser?.id !== user.id ? (
                    <Button
                      variant={user.isAdmin ? "destructive" : "default"}
                      size="sm"
                      onClick={() => updateUserAdminStatus.mutate({
                        userId: user.id,
                        isAdmin: !user.isAdmin
                      })}
                      disabled={updateUserAdminStatus.isPending}
                    >
                      {user.isAdmin ? (
                        <>
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Revoke Admin
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Current User
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
