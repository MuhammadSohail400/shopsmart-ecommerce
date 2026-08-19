"use client";

import { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Globe, Percent, Plus, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  useAdminSettings,
  useUpdateBulkSettings,
  useTaxRules,
  useCreateTaxRule,
  useDeleteTaxRule,
} from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { data: settings, isLoading: isLoadingSettings, refetch, isFetching } = useAdminSettings();
  const { data: taxRules, isLoading: isLoadingTax } = useTaxRules();
  const updateBulkMutation = useUpdateBulkSettings();
  const createTaxRuleMutation = useCreateTaxRule();
  const deleteTaxRuleMutation = useDeleteTaxRule();

  const [storeName, setStoreName] = useState('ShopSmart Fashion');
  const [currency, setCurrency] = useState('PKR');
  const [supportEmail, setSupportEmail] = useState('support@shopsmart.ai');
  const [supportPhone, setSupportPhone] = useState('+92 300 1234567');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('2500');
  const [isSaving, setIsSaving] = useState(false);

  // Tax Rule Form
  const [taxName, setTaxName] = useState('Standard Sales Tax');
  const [taxCountry, setTaxCountry] = useState('PK');
  const [taxRegion, setTaxRegion] = useState('');
  const [taxRate, setTaxRate] = useState('0');

  // Sync settings when loaded from backend database
  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      settings.forEach((s) => {
        if (s.key === 'store_name') setStoreName(s.value);
        if (s.key === 'currency') setCurrency(s.value);
        if (s.key === 'support_email') setSupportEmail(s.value);
        if (s.key === 'support_phone') setSupportPhone(s.value);
        if (s.key === 'free_shipping_threshold') setFreeShippingThreshold(s.value);
      });
    }
  }, [settings]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateBulkMutation.mutateAsync({
        store_name: storeName.trim(),
        currency: currency.trim().toUpperCase(),
        free_shipping_threshold: freeShippingThreshold.trim(),
        support_email: supportEmail.trim(),
        support_phone: supportPhone.trim(),
      });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const numRate = parseFloat(taxRate);
      const decimalRate = numRate > 1 ? numRate / 100 : numRate;

      await createTaxRuleMutation.mutateAsync({
        country: taxCountry.trim().toUpperCase(),
        region: taxRegion.trim() || undefined,
        rate: decimalRate,
        name: taxName.trim() || 'Standard Sales Tax',
      });
      setTaxRate('0');
      setTaxRegion('');
      toast.success('Tax jurisdiction added successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create tax rule');
    }
  };

  const handleDeleteTax = async (id: string) => {
    if (confirm('Delete this tax rule?')) {
      deleteTaxRuleMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-primary" />
            Platform Settings & Tax Rules
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure global store parameters, customer support contacts, currency formatting, and regional taxation.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-xl gap-2 font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Store Settings Form */}
        <Card className="rounded-2xl border-border shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <CardTitle className="font-black text-sm uppercase text-foreground">General Store Profile</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              These settings control branding, free shipping thresholds, and public contact information.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            {isLoadingSettings ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : (
              <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="sname" className="text-xs font-bold">Store Brand Name</Label>
                  <Input
                    id="sname"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="text-xs rounded-xl"
                    placeholder="e.g. ShopSmart Fashion"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="curr" className="text-xs font-bold">Default Currency</Label>
                    <Input
                      id="curr"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="text-xs font-mono font-bold rounded-xl"
                      placeholder="PKR"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="fship" className="text-xs font-bold">Free Shipping Minimum ({currency})</Label>
                    <Input
                      id="fship"
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      className="text-xs font-mono rounded-xl"
                      placeholder="2500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="semail" className="text-xs font-bold">Customer Support Email</Label>
                    <Input
                      id="semail"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="text-xs rounded-xl"
                      placeholder="support@shopsmart.ai"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sphone" className="text-xs font-bold">Support WhatsApp / Helpline</Label>
                    <Input
                      id="sphone"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="text-xs rounded-xl"
                      placeholder="+92 300 1234567"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="font-bold text-xs gap-1.5 rounded-xl bg-primary text-primary-foreground mt-2"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? 'Saving Settings...' : 'Save Store Settings'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Tax Rules & Rates */}
        <Card className="rounded-2xl border-border shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              <CardTitle className="font-black text-sm uppercase text-foreground">Tax Rules & Rates</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Define regional and national value-added sales tax rules applied at checkout.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            <form onSubmit={handleCreateTax} className="space-y-3 text-xs bg-muted/40 p-4 rounded-xl border border-border">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-primary" /> Add New Tax Jurisdiction
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 col-span-2">
                  <Label className="text-[11px] font-bold">Country Code (2 letters)</Label>
                  <Input
                    placeholder="e.g. PK or US"
                    value={taxCountry}
                    maxLength={2}
                    onChange={(e) => setTaxCountry(e.target.value.toUpperCase())}
                    className="text-xs h-8 font-mono rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold">Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 5"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="text-xs h-8 font-mono rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold">State / Province / Region (Optional)</Label>
                <Input
                  placeholder="e.g. Sindh, Punjab, CA (leave blank for nationwide)"
                  value={taxRegion}
                  onChange={(e) => setTaxRegion(e.target.value)}
                  className="text-xs h-8 rounded-lg"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={createTaxRuleMutation.isPending}
                className="font-bold text-xs gap-1 rounded-xl h-8"
              >
                <Plus className="h-3.5 w-3.5" /> Add Rule
              </Button>
            </form>

            {/* Existing Rules List */}
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Configured Jurisdictions
              </div>
              {isLoadingTax ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ) : !taxRules || taxRules.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>0% Direct GST Configured (All catalog items priced inclusive of tax).</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {taxRules.map((rule) => (
                    <div key={rule.id} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-foreground font-mono">
                          {rule.country} {rule.region ? `(${rule.region})` : '(Nationwide)'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Rate applied: {(Number(rule.rate) * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-black font-mono">
                          {(Number(rule.rate) * 100).toFixed(1)}%
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTax(rule.id)}
                          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
