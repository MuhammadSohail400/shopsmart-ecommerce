"use client";

import { ProtectedRoute } from '@/components/auth/protected-route';
import { useSessions, useRevokeSession } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Laptop, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function SessionsContent() {
  const { data: sessions, isLoading, isError } = useSessions();
  const revokeMutation = useRevokeSession();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading active sessions...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>Failed to load sessions. Please try again.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage devices where you are currently logged in.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active sessions found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>Manage devices where you are currently logged in.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Laptop className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Session ID: {session.id.slice(0, 8)}...</p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(session.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Expires: {new Date(session.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              disabled={revokeMutation.isPending && revokeMutation.variables === session.id}
              onClick={() => revokeMutation.mutate(session.id)}
              aria-label="Revoke session"
            >
              {revokeMutation.isPending && revokeMutation.variables === session.id ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function SessionsPage() {
  return (
    <ProtectedRoute>
      <SessionsContent />
    </ProtectedRoute>
  );
}
