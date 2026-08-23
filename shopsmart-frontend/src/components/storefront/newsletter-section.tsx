"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSubscribeNewsletter } from '@/features/marketing/hooks/use-newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-client';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export function NewsletterSection() {
  const subscribeMutation = useSubscribeNewsletter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data: NewsletterFormData) => {
    subscribeMutation.mutate(data.email, {
      onSuccess: () => {
        toast.success("You're on the list! Welcome to ASORA Drops.");
        reset();
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          toast.error(err.userMessage || 'Subscription failed. Please try again.');
        } else {
          toast.error('Subscription failed. Please try again.');
        }
      },
    });
  };

  return (
    <section className="container py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-primary/15 via-primary/5 to-background border border-primary/20 p-8 sm:p-12 md:p-16 shadow-lg">
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            Stay in the Loop
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
            Unlock 10% Off Your First Order
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Subscribe to our weekly digest for exclusive deals, new arrivals, and smart shopping guides.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto pt-2"
          >
            <div className="relative w-full">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email address..."
                className="pl-10 h-12 rounded-full bg-background/80 backdrop-blur-sm border-border/80 text-sm shadow-sm"
                {...register('email')}
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto h-12 px-8 rounded-full font-bold shadow-md hover:shadow-lg transition-all shrink-0"
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending ? 'Joining...' : 'Subscribe'}
            </Button>
          </form>
          {errors.email && (
            <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
          )}

          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No spam ever
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Unsubscribe anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
