import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { 
  Loader2, 
  PlusCircleIcon, 
  CalendarIcon, 
  DollarSignIcon,
  CheckIcon,
  PlayIcon,
  AlertTriangleIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/alert-dialog';

import type { RootState } from '@/store';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface MilestoneResponse {
  id: number;
  contractId: number;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  createdAt: string;
  updatedAt: string;
}

interface MilestonePanelProps {
  contractId: number;
  className?: string;
}

// Form schema for milestone creation/editing
const milestoneFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  dueDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  })
});

type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;

export const MilestonePanel = ({ contractId, className }: MilestonePanelProps) => {
  const [milestones, setMilestones] = useState<MilestoneResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneResponse | null>(null);
  const authToken = useSelector((state: RootState) => state.auth?.authToken);
  
  // Form setup
  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0]
    }
  });
  
  // Fetch milestones
  const fetchMilestones = async () => {
    if (!authToken || !contractId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/milestones/contract/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setMilestones(data.data);
      } else {
        setError(data.error?.message || 'Failed to load milestones');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load milestones');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchMilestones();
  }, [contractId, authToken]);
  
  // Reset form when editing milestone changes
  useEffect(() => {
    if (editingMilestone) {
      form.reset({
        title: editingMilestone.title,
        description: editingMilestone.description || '',
        amount: editingMilestone.amount,
        dueDate: editingMilestone.dueDate.split('T')[0]
      });
    } else {
      form.reset({
        title: '',
        description: '',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingMilestone, form]);
  
  // Handle form submission
  const onSubmit = async (values: MilestoneFormValues) => {
    if (!authToken) return;
    
    try {
      setIsSubmitting(true);
      
      const endpoint = editingMilestone 
        ? `/api/milestones/${editingMilestone.id}` 
        : `/api/milestones/contract/${contractId}`;
      
      const method = editingMilestone ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          amount: values.amount,
          dueDate: new Date(values.dueDate).toISOString()
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Refresh milestones
        fetchMilestones();
        setIsDialogOpen(false);
        setEditingMilestone(null);
      } else {
        setError(data.error?.message || 'Failed to save milestone');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save milestone');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update milestone status
  const updateMilestoneStatus = async (milestoneId: number, status: string) => {
    if (!authToken) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/milestones/${milestoneId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Update local state
        setMilestones(prev => 
          prev.map(m => m.id === milestoneId ? { ...m, status: status as any } : m)
        );
      } else {
        setError(data.error?.message || 'Failed to update milestone status');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update milestone status');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete milestone
  const deleteMilestone = async (milestoneId: number) => {
    if (!authToken) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Remove from local state
        setMilestones(prev => prev.filter(m => m.id !== milestoneId));
      } else {
        setError(data.error?.message || 'Failed to delete milestone');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete milestone');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Get status badge color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          icon: <CheckIcon className="h-4 w-4" />
        };
      case 'IN_PROGRESS':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          icon: <PlayIcon className="h-4 w-4" />
        };
      case 'OVERDUE':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
          icon: <AlertTriangleIcon className="h-4 w-4" />
        };
      default:
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
          icon: <CalendarIcon className="h-4 w-4" />
        };
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] text-destructive">
        {error}
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Project Milestones</h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              onClick={() => setEditingMilestone(null)}
            >
              <PlusCircleIcon className="h-4 w-4 mr-1" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMilestone ? 'Edit' : 'Add'} Milestone</DialogTitle>
              <DialogDescription>
                {editingMilestone 
                  ? 'Update the milestone details below.' 
                  : 'Create a new milestone for this contract.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Milestone title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Milestone description" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : null}
                    {editingMilestone ? 'Update' : 'Create'} Milestone
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {milestones.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
          <p>No milestones have been created yet.</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            Add First Milestone
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => {
            const statusInfo = getStatusInfo(milestone.status);
            
            return (
              <Card key={milestone.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">
                      {milestone.title}
                    </CardTitle>
                    <Badge variant="outline" className={cn("flex items-center gap-1", statusInfo.color)}>
                      {statusInfo.icon}
                      {milestone.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {milestone.description && (
                    <div className="mb-3 text-sm text-muted-foreground">
                      {milestone.description}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSignIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>${milestone.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Due: {formatDate(milestone.dueDate)}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex gap-2">
                      {milestone.status === 'PENDING' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateMilestoneStatus(milestone.id, 'IN_PROGRESS')}
                          disabled={isSubmitting}
                        >
                          <PlayIcon className="h-3.5 w-3.5 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {milestone.status === 'IN_PROGRESS' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateMilestoneStatus(milestone.id, 'COMPLETED')}
                          disabled={isSubmitting}
                        >
                          <CheckIcon className="h-3.5 w-3.5 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditingMilestone(milestone);
                          setIsDialogOpen(true);
                        }}
                        disabled={isSubmitting}
                      >
                        Edit
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive hover:text-destructive"
                            disabled={isSubmitting}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this milestone? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground"
                              onClick={() => deleteMilestone(milestone.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}; 