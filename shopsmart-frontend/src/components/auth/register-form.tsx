"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

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
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter (A-Z)')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter (a-z)')
  .regex(/[0-9]/, 'Password must include at least one number (0-9)');

const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address').toLowerCase().or(z.literal('')),
    phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number (e.g. +923001234567)').or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Please provide either an email or phone number',
    path: ['email'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => !(data.password && (data.email === data.password || data.phone === data.password)),
    {
      message: 'Password cannot be the same as your email or phone',
      path: ['password'],
    }
  );

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = form.watch('password') || '';

  const requirements = [
    { label: '8+ characters', satisfied: passwordValue.length >= 8 },
    { label: 'At least 1 number (0-9)', satisfied: /[0-9]/.test(passwordValue) },
    { label: 'At least 1 uppercase (A-Z)', satisfied: /[A-Z]/.test(passwordValue) },
    { label: 'At least 1 lowercase (a-z)', satisfied: /[a-z]/.test(passwordValue) },
  ];

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
        // Automatically log in after registration
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
              router.push('/login');
            },
          }
        );
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.status === 429) {
            setGlobalError('Too many attempts. Please wait a minute before trying again.');
            return;
          }
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
          setGlobalError('An unexpected error occurred. Please try again.');
        }
      },
    });
  };

  const isPending = registerMutation.isPending || loginMutation.isPending;

  return (
    <Card className="w-full max-w-md mx-auto shadow-md rounded-2xl border border-border/60">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-2xl font-black tracking-tight">Create an account</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your email or phone to create your ASORA account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {globalError && (
          <Alert variant="destructive" className="mb-4 text-xs font-semibold py-2.5 rounded-xl">
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
                  <FormLabel className="text-xs font-bold">Email (Optional if phone provided)</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" autoComplete="email" className="rounded-xl h-10 text-xs sm:text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-rose-600 mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Phone (Optional if email provided)</FormLabel>
                  <FormControl>
                    <Input placeholder="+923001234567" autoComplete="tel" className="rounded-xl h-10 text-xs sm:text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-rose-600 mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Create a strong password" autoComplete="new-password" className="rounded-xl h-10 text-xs sm:text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-rose-600 mt-1" />

                  {/* Password requirements live helper */}
                  {passwordValue.length > 0 && (
                    <div className="pt-2 grid grid-cols-2 gap-1.5 bg-secondary/30 p-2.5 rounded-xl border border-border/40 mt-1.5">
                      {requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                          {req.satisfied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                          )}
                          <span className={req.satisfied ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-muted-foreground'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Re-enter your password" autoComplete="new-password" className="rounded-xl h-10 text-xs sm:text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-semibold text-rose-600 mt-1" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-xs sm:text-sm font-bold shadow-md uppercase tracking-wider"
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
      <CardFooter className="pt-0">
        <div className="text-center text-xs text-muted-foreground w-full">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
