'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBeatVersions,
  createBeatVersion,
  updateBeatVersion,
  deleteBeatVersion,
  downloadVersionFiles,
} from '@/lib/api/versions';
import { VersionCard } from './VersionCard';
import { CreateVersionModal } from './CreateVersionModal';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface VersionsTabProps {
  beatId: string;
  beatName: string;
  isAdmin?: boolean;
}

export function VersionsTab({ beatId, beatName, isAdmin = false }: VersionsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteVersionId, setDeleteVersionId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch versions
  const {
    data: versions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['beatVersions', beatId],
    queryFn: () => getBeatVersions(beatId),
  });

  // Create version mutation
  const createMutation = useMutation({
    mutationFn: (setPrimary: boolean) =>
      createBeatVersion(beatId, { setPrimary }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['beatVersions', beatId] });
      queryClient.invalidateQueries({ queryKey: ['beat', beatId] });
      setShowCreateModal(false);
      toast({
        title: 'Version created',
        description: 'New version is being generated. This may take a few minutes.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create version',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    },
  });

  // Set primary mutation
  const setPrimaryMutation = useMutation({
    mutationFn: (versionId: string) =>
      updateBeatVersion(beatId, versionId, { isPrimary: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beatVersions', beatId] });
      queryClient.invalidateQueries({ queryKey: ['beat', beatId] });
      toast({
        title: 'Primary version updated',
        description: 'The selected version is now the primary version.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update primary version',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (versionId: string) => deleteBeatVersion(beatId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beatVersions', beatId] });
      setDeleteVersionId(null);
      toast({
        title: 'Version deleted',
        description: 'The version has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete version',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    },
  });

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: (versionNumber: number) =>
      downloadVersionFiles(beatId, versionNumber),
    onSuccess: (data) => {
      toast({
        title: 'Download started',
        description: data.message || 'Files are being downloaded.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Download failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load versions</p>
        <p className="text-sm text-muted-foreground mt-2">
          {(error as any).message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {isAdmin && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Beat Versions</h3>
            <p className="text-sm text-muted-foreground">
              Manage different versions of this beat
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Version
          </Button>
        </div>
      )}

      {/* Versions Grid */}
      {versions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No versions found</p>
          {isAdmin && (
            <Button
              variant="link"
              className="mt-2"
              onClick={() => setShowCreateModal(true)}
            >
              Create your first version
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {versions
            .sort((a, b) => {
              // Primary first, then by version number descending
              if (a.isPrimary) return -1;
              if (b.isPrimary) return 1;
              return b.versionNumber - a.versionNumber;
            })
            .map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                onSetPrimary={isAdmin ? setPrimaryMutation.mutate : undefined}
                onDelete={isAdmin ? setDeleteVersionId : undefined}
                onDownload={isAdmin ? downloadMutation.mutate : undefined}
                isAdmin={isAdmin}
              />
            ))}
        </div>
      )}

      {/* Create Version Modal */}
      {isAdmin && (
        <CreateVersionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onConfirm={createMutation.mutate}
          beatName={beatName}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isAdmin && (
        <AlertDialog
          open={!!deleteVersionId}
          onOpenChange={() => setDeleteVersionId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Version</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this version? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteVersionId && deleteMutation.mutate(deleteVersionId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
