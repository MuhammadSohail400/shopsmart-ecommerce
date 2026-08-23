"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSubmitContactMessage } from '@/features/contact/hooks/use-contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePublicSettings } from '@/hooks/use-admin';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-client';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  email: z.string().email('Please provide a valid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be 200 characters or fewer'),
  message: z.string().min(5, 'Message must be at least 5 characters').max(3000, 'Message must be 3000 characters or fewer'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submitContactMutation = useSubmitContactMessage();
  const { data: publicSettings } = usePublicSettings();

  const supportEmail = publicSettings?.support_email || 'support@asora.pk';
  const supportPhone = publicSettings?.whatsapp_number || publicSettings?.support_phone || '03110297772';
  const storeName = publicSettings?.store_name || 'ASORA';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const messageText = watch('message') || '';

  const onSubmit = (data: ContactFormData) => {
    setErrorMessage(null);
    submitContactMutation.mutate(data, {
      onSuccess: () => {
        setIsSuccess(true);
        toast.success('Message sent! Our support team will get back to you soon.');
        reset();
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          setErrorMessage(err.userMessage || 'Failed to send message. Please try again.');
        } else {
          setErrorMessage('Failed to send message. Please try again.');
        }
      },
    });
  };

  return (
    <div className="container max-w-6xl py-12 px-4">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
          Get in Touch
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Have a question about an order, product, or partnership? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Contact Information</CardTitle>
              <CardDescription className="text-xs">
                Reach out directly or use the inquiry form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-3 text-sm">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Email Support</p>
                  <a href={`mailto:${supportEmail}`} className="text-xs text-primary hover:underline mt-0.5 block">{supportEmail}</a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Helpline & WhatsApp</p>
                  <a href={`tel:${supportPhone}`} className="text-xs text-primary hover:underline mt-0.5 block">{supportPhone}</a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Headquarters</p>
                  <p className="text-xs text-muted-foreground mt-0.5">100 Innovation Way, Suite 400<br />San Francisco, CA 94105</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Business Hours</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Mon – Fri: 9:00 AM – 6:00 PM EST</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we will respond within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Thank you!</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your inquiry has been submitted to our support team. We&apos;ll get back to you shortly.
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-full mt-4"
                    onClick={() => setIsSuccess(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-xs font-bold">Submission Error</AlertTitle>
                      <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Your Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Jane Doe"
                        className="rounded-xl h-11"
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        className="rounded-xl h-11"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      placeholder="e.g. Inquiry about product sizing / Order help"
                      className="rounded-xl h-11"
                      {...register('subject')}
                    />
                    {errors.subject && (
                      <p className="text-xs text-destructive">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Message *
                      </Label>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {messageText.length}/3000
                      </span>
                    </div>
                    <Textarea
                      id="message"
                      placeholder="How can our customer experience team assist you?"
                      className="min-h-[140px] rounded-xl resize-none"
                      maxLength={3000}
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="text-xs text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto rounded-full font-bold px-8 h-12 shadow-md gap-2"
                    disabled={submitContactMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                    {submitContactMutation.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
