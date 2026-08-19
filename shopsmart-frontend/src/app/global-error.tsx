"use client";

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Critical global error:', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-3xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 w-fit mx-auto">
            <AlertCircle className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight">System Notice</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              An unexpected system error occurred while rendering the application.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
