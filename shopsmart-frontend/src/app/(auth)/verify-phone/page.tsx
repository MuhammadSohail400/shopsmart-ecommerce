"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useVerifyPhone } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';

const verifyPhoneSchema = z.object({
  code: z.string().length(6, 'Verification code must be exactly 6 characters'),
});

type VerifyPhoneValues = z.infer<typeof verifyPhoneSchema>;

function VerifyPhoneContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId'); // Provided from redirect or email/sms
  
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<VerifyPhoneValues>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: {
      code: '',
    },
  });

  const verifyPhoneMutation = useVerifyPhone();

  const onSubmit = (values: VerifyPhoneValues) => {
    if (!userId) {
      setGlobalError('User ID is missing. Please restart the verification process.');
      return;
    }

    setGlobalError(null);
    verifyPhoneMutation.mutate(
      { userId, code: values.code },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.validationErrors && error.validationErrors.length > 0) {
              error.validationErrors.forEach((err) => {
                if (err.field === 'code') {
                  form.setError('code', { message: err.message });
                } else {
                  setGlobalError(err.message);
                }
              });
            } else {
              setGlobalError(error.userMessage);
            }
          } else {
            setGlobalError('An unexpected error occurred.');
          }
        },
      }
    );
  };

  if (success) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Phone Verified</CardTitle>
          <CardDescription>
            Your phone number has been successfully verified.
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
        <CardTitle className="text-2xl font-semibold tracking-tight">Verify your phone</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to your phone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {globalError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}
        {!userId ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>User ID is missing from the request URL.</AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" maxLength={6} autoComplete="one-time-code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={verifyPhoneMutation.isPending}
              >
                {verifyPhoneMutation.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Verifying...
                  </>
                ) : (
                  'Verify Phone'
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm text-muted-foreground w-full">
          Didn&apos;t receive a code?{' '}
          <Button variant="link" className="p-0 h-auto font-semibold text-primary">
            Resend Code
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Spinner className="h-6 w-6 text-primary" /></div>}>
      <VerifyPhoneContent />
    </Suspense>
  );
}
