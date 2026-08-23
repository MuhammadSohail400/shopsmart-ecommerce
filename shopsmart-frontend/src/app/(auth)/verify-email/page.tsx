"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVerifyEmail } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const verifyEmailMutation = useVerifyEmail();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing from the URL.');
      return;
    }

    verifyEmailMutation.mutate(token, {
      onSuccess: () => {
        setStatus('success');
      },
      onError: (error: unknown) => {
        setStatus('error');
        // @ts-expect-error type casting for api error
        setErrorMessage(error instanceof Error ? error.userMessage || error.message : 'The verification link is invalid or has expired.');
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === 'loading') {
    return (
      <Card className="w-full text-center py-8">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Verifying your email address...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Email Verified</CardTitle>
          <CardDescription>
            Your email address has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <CheckCircle2 className="h-16 w-16 text-primary" />
          <Link href="/" className={buttonVariants({ variant: 'default', className: 'w-full' })}>
            Continue to ASORA
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight text-destructive">Verification Failed</CardTitle>
        <CardDescription>
          We couldn&apos;t verify your email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <XCircle className="h-16 w-16 text-destructive" />
        <Alert variant="destructive" className="w-full">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <Link href="/login" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
          Return to Login
        </Link>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Spinner className="h-6 w-6 text-primary" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
