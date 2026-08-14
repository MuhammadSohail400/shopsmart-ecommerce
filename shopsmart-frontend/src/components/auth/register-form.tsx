"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { useRegister, useLogin } from '@/hooks/use-auth';
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
import { PasswordInput } from '@/components/ui/password-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api-client';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const registerSchema = z
  .object({
    email: z.string().email('Invalid email format').toLowerCase().or(z.literal('')),
    phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number format').or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone is required',
    path: ['email'], // attach error to email field by default if both are empty
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => !(data.password && (data.email === data.password || data.phone === data.password)),
    {
      message: 'Password cannot match your email or phone',
      path: ['password'],
    }
  );

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useRegister();
  const loginMutation = useLogin();

  const onSubmit = (values: RegisterValues) => {
    setGlobalError(null);
    const payload = {
      email: values.email || undefined,
      phone: values.phone || undefined,
      password: values.password,
    };

    registerMutation.mutate(payload as Parameters<typeof registerMutation.mutate>[0], {
      onSuccess: () => {
        // Automatically log them in after successful registration
        loginMutation.mutate(
          {
            identifier: (payload.email || payload.phone) as string,
            password: payload.password,
          },
          {
            onSuccess: () => {
              router.push('/');
            },
            onError: () => {
              // If auto-login fails, redirect to login page
              router.push('/login');
            },
          }
        );
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.validationErrors && error.validationErrors.length > 0) {
            error.validationErrors.forEach((err: { field: string; message: string }) => {
              if (['email', 'phone', 'password'].includes(err.field)) {
                form.setError(err.field as "email" | "phone" | "password", { message: err.message });
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

  const isPending = registerMutation.isPending || loginMutation.isPending;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Create an account</CardTitle>
        <CardDescription>
          Enter your email or phone to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {globalError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional if phone provided)</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional if email provided)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" autoComplete="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
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
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm text-muted-foreground w-full">
          Already have an account?{' '}
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
