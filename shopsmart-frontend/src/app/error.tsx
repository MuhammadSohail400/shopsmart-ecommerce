"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled application error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center container py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="p-4 rounded-3xl bg-destructive/10 text-destructive w-fit mx-auto">
          <AlertCircle className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We encountered an unexpected issue while loading this page. Please try refreshing or return to the home page.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto rounded-full gap-2 font-semibold shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full sm:w-auto rounded-full border border-border px-6 py-2 text-sm font-semibold hover:bg-secondary/50 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
