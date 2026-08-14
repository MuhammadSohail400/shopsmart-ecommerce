"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { useConfirmPasswordReset } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { ApiError } from '@/lib/api-client';
import { CheckCircle2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const confirmResetMutation = useConfirmPasswordReset();

  const onSubmit = (values: ResetPasswordValues) => {
    if (!token) {
      setGlobalError('Invalid or missing reset token.');
      return;
    }

    setGlobalError(null);
    
    confirmResetMutation.mutate(
      { token, newPassword: values.newPassword },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.validationErrors && error.validationErrors.length > 0) {
              error.validationErrors.forEach((err: { field: string; message: string }) => {
                if (err.field === 'newPassword') {
                  form.setError(err.field as "newPassword", { message: err.message });
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
          <CardTitle className="text-2xl font-semibold tracking-tight">Password Reset Complete</CardTitle>
          <CardDescription>
            Your password has been successfully updated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-primary/10 text-primary border-primary/20">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>You can now sign in with your new password.</AlertDescription>
          </Alert>
          <Link href="/login" className={buttonVariants({ variant: 'default', className: 'w-full' })}>
            Go to Login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Set new password</CardTitle>
        <CardDescription>
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {globalError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}
        {!token ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>Missing reset token. Please check your email link.</AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={confirmResetMutation.isPending}
              >
                {confirmResetMutation.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
