"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { useRequestPasswordReset } from '@/hooks/use-auth';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ApiError } from '@/lib/api-client';
import { CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Email or username is required'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: '',
    },
  });

  const requestResetMutation = useRequestPasswordReset();

  const onSubmit = (values: ForgotPasswordValues) => {
    setGlobalError(null);
    setSuccessMessage(null);
    
    requestResetMutation.mutate(values.identifier, {
      onSuccess: () => {
        setSuccessMessage('If an account exists, a password reset link has been sent to your email or phone.');
        form.reset();
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.validationErrors && error.validationErrors.length > 0) {
            error.validationErrors.forEach((err: { field: string; message: string }) => {
              if (err.field === 'identifier') {
                form.setError(err.field as "identifier", { message: err.message });
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
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email or phone number and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <Alert className="mb-4 bg-primary/10 text-primary border-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertTitle>Check your inbox</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {globalError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        {!successMessage && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={requestResetMutation.isPending}
              >
                {requestResetMutation.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Sending link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm text-muted-foreground w-full">
          Remember your password?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
