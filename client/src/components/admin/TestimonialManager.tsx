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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { ThumbsUp, ThumbsDown, XCircle, Search, Loader2, Trash2 } from 'lucide-react';
import type { Testimonial } from '@db/schema';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from 'react';

type Status = 'all' | 'pending' | 'approved' | 'rejected';

export function TestimonialManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Status>('all');

  // Fetch testimonials
  const { data: testimonials = [], isLoading, error } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 0,
    retry: 3,
    retryDelay: 1000,
  });

  const deleteTestimonial = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete testimonial');
      }

      return response.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['/api/testimonials'] });
      await queryClient.cancelQueries({ queryKey: ['/api/testimonials/approved'] });

      const previousTestimonials = queryClient.getQueryData<Testimonial[]>(['/api/testimonials']);
      const previousApprovedTestimonials = queryClient.getQueryData<Testimonial[]>(['/api/testimonials/approved']);

      // Update the testimonials list optimistically
      if (previousTestimonials) {
        queryClient.setQueryData<Testimonial[]>(['/api/testimonials'], old => {
          if (!old) return previousTestimonials;
          return old.filter(testimonial => testimonial.id !== id);
        });
      }

      // Update the approved testimonials list optimistically
      if (previousApprovedTestimonials) {
        queryClient.setQueryData<Testimonial[]>(['/api/testimonials/approved'], old => {
          if (!old) return [];
          return old.filter(testimonial => testimonial.id !== id);
        });
      }

      return { previousTestimonials, previousApprovedTestimonials };
    },
    onError: (err, _, context) => {
      if (context?.previousTestimonials) {
        queryClient.setQueryData(['/api/testimonials'], context.previousTestimonials);
      }
      if (context?.previousApprovedTestimonials) {
        queryClient.setQueryData(['/api/testimonials/approved'], context.previousApprovedTestimonials);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete testimonial',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials/approved'] });
      toast({
        title: 'Success',
        description: 'Testimonial deleted successfully',
      });
    }
  });

  const updateTestimonialStatus = useMutation({
    mutationFn: async ({ id, approved, rejected }: { id: number; approved: boolean; rejected: boolean }) => {
      const response = await fetch(`/api/testimonials/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved, rejected }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update testimonial status');
      }

      return response.json();
    },
    onMutate: async ({ id, approved, rejected }) => {
      await queryClient.cancelQueries({ queryKey: ['/api/testimonials'] });
      await queryClient.cancelQueries({ queryKey: ['/api/testimonials/approved'] });

      const previousTestimonials = queryClient.getQueryData<Testimonial[]>(['/api/testimonials']);
      const previousApprovedTestimonials = queryClient.getQueryData<Testimonial[]>(['/api/testimonials/approved']);

      if (previousTestimonials) {
        queryClient.setQueryData<Testimonial[]>(['/api/testimonials'], old => {
          if (!old) return previousTestimonials;
          return old.map(testimonial =>
            testimonial.id === id
              ? { ...testimonial, approved, rejected }
              : testimonial
          );
        });
      }

      if (previousApprovedTestimonials) {
        if (approved) {
          const updatedTestimonial = previousTestimonials?.find(t => t.id === id);
          if (updatedTestimonial) {
            queryClient.setQueryData<Testimonial[]>(['/api/testimonials/approved'], old => {
              if (!old) return [{ ...updatedTestimonial, approved: true, rejected: false }];
              const filtered = old.filter(t => t.id !== id);
              return [...filtered, { ...updatedTestimonial, approved: true, rejected: false }];
            });
          }
        } else {
          queryClient.setQueryData<Testimonial[]>(['/api/testimonials/approved'], old => {
            if (!old) return [];
            return old.filter(t => t.id !== id);
          });
        }
      }

      return { previousTestimonials, previousApprovedTestimonials };
    },
    onError: (err, variables, context) => {
      if (context?.previousTestimonials) {
        queryClient.setQueryData(['/api/testimonials'], context.previousTestimonials);
      }
      if (context?.previousApprovedTestimonials) {
        queryClient.setQueryData(['/api/testimonials/approved'], context.previousApprovedTestimonials);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update testimonial status',
      });
    },
    onSuccess: (data, { approved, rejected }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials/approved'] });

      const action = approved ? 'approved' : rejected ? 'rejected' : 'updated';
      toast({
        title: 'Success',
        description: `Testimonial has been ${action} successfully`,
      });
    }
  });

  const sortedAndFilteredTestimonials = useMemo(() => {
    return testimonials
      .filter(testimonial => {
        const matchesSearch =
          testimonial.name.toLowerCase().includes(search.toLowerCase()) ||
          testimonial.role.toLowerCase().includes(search.toLowerCase()) ||
          testimonial.content.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
          status === 'all' ||
          (status === 'pending' && !testimonial.approved && !testimonial.rejected) ||
          (status === 'approved' && testimonial.approved) ||
          (status === 'rejected' && testimonial.rejected);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [testimonials, search, status]);

  const getStatusBadgeVariant = (testimonial: Testimonial) => {
    if (testimonial.approved) return "default";
    if (testimonial.rejected) return "destructive";
    return "secondary";
  };

  const getStatusText = (testimonial: Testimonial) => {
    if (testimonial.approved) return "Approved";
    if (testimonial.rejected) return "Rejected";
    return "Pending";
  };

  if (error) {
    return (
      <div className="flex justify-center py-8 text-destructive">
        Failed to load testimonials. Please try refreshing the page.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search testimonials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as Status)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Badge variant="secondary">
            {testimonials.filter(t => !t.approved && !t.rejected).length} pending
          </Badge>
          <Badge variant="default">
            {testimonials.filter(t => t.approved).length} approved
          </Badge>
          <Badge variant="destructive">
            {testimonials.filter(t => t.rejected).length} rejected
          </Badge>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : sortedAndFilteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No testimonials found
                </TableCell>
              </TableRow>
            ) : (
              sortedAndFilteredTestimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell className="font-medium">{testimonial.name}</TableCell>
                  <TableCell>{testimonial.role}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{testimonial.content}</p>
                  </TableCell>
                  <TableCell>{format(new Date(testimonial.createdAt), 'PP')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(testimonial)}>
                      {getStatusText(testimonial)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {testimonial.approved ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateTestimonialStatus.mutate({
                                id: testimonial.id,
                                approved: false,
                                rejected: false
                              });
                            }}
                            disabled={updateTestimonialStatus.isPending}
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Revoke
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this testimonial? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTestimonial.mutate(testimonial.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      ) : testimonial.rejected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateTestimonialStatus.mutate({
                                id: testimonial.id,
                                approved: false,
                                rejected: false
                              });
                            }}
                            disabled={updateTestimonialStatus.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this testimonial? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTestimonial.mutate(testimonial.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              updateTestimonialStatus.mutate({
                                id: testimonial.id,
                                approved: false,
                                rejected: true
                              });
                            }}
                            disabled={updateTestimonialStatus.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              updateTestimonialStatus.mutate({
                                id: testimonial.id,
                                approved: true,
                                rejected: false
                              });
                            }}
                            disabled={updateTestimonialStatus.isPending}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this testimonial? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTestimonial.mutate(testimonial.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}