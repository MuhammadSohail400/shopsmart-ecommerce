"use client";

import { useState } from 'react';
import { Settings, Save, ShieldCheck, DollarSign, Globe, Percent, Plus } from 'lucide-react';
import { useAdminSettings, useUpdateSetting, useTaxRules, useCreateTaxRule } from '@/hooks/use-admin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { data: settings, isLoading: isLoadingSettings } = useAdminSettings();
  const { data: taxRules, isLoading: isLoadingTax } = useTaxRules();
  const updateSettingMutation = useUpdateSetting();
  const createTaxRuleMutation = useCreateTaxRule();

  const [storeName, setStoreName] = useState('ShopSmart Fashion');
  const [currency, setCurrency] = useState('PKR');
  const [supportEmail, setSupportEmail] = useState('support@shopsmart.ai');
  const [supportPhone, setSupportPhone] = useState('+92 300 1234567');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('2500');

  // Tax Rule Form
  const [taxName, setTaxName] = useState('Standard Sales Tax');
  const [taxCountry, setTaxCountry] = useState('PK');
  const [taxRate, setTaxRate] = useState('0');

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettingMutation.mutateAsync({ key: 'store_name', value: storeName });
    await updateSettingMutation.mutateAsync({ key: 'free_shipping_threshold', value: freeShippingThreshold });
    toast.success('Platform settings saved');
  };

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTaxRuleMutation.mutateAsync({
      name: taxName,
      country: taxCountry,
      rate: Number(taxRate),
    });
    setTaxName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
          Platform Settings & Tax Rules
        </h2>
        <p className="text-xs text-muted-foreground font-medium">
          Configure global store parameters, support contacts, currency formatting, and regional taxation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Store Settings Form */}
        <Card className="p-5 rounded-2xl border-border space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="font-black text-sm uppercase text-foreground">General Store Profile</h3>
          </div>

          <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="sname" className="text-xs font-bold">Store Brand Name</Label>
              <Input
                id="sname"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="text-xs"
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
                  className="text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fship" className="text-xs font-bold">Free Shipping Minimum (PKR)</Label>
                <Input
                  id="fship"
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  className="text-xs font-mono"
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
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sphone" className="text-xs font-bold">Support WhatsApp / Helpline</Label>
                <Input
                  id="sphone"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={updateSettingMutation.isPending}
              className="font-bold text-xs gap-1.5 rounded-full"
            >
              <Save className="h-3.5 w-3.5" /> Save Store Settings
            </Button>
          </form>
        </Card>

        {/* Tax Rules & Legal */}
        <Card className="p-5 rounded-2xl border-border space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Percent className="h-4 w-4 text-primary" />
            <h3 className="font-black text-sm uppercase text-foreground">Tax Rules & Rates</h3>
          </div>

          <form onSubmit={handleCreateTax} className="space-y-3 text-xs bg-secondary/30 p-3.5 rounded-xl border border-border">
            <div className="font-bold text-foreground">Add New Tax Jurisdiction</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 col-span-2">
                <Label className="text-[11px] font-bold">Tax Name</Label>
                <Input
                  placeholder="e.g. Sales Tax (GST)"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  className="text-xs h-8"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Rate (%)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="text-xs h-8"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="xs"
              disabled={createTaxRuleMutation.isPending}
              className="font-bold text-[11px] gap-1"
            >
              <Plus className="h-3 w-3" /> Add Rule
            </Button>
          </form>

          {/* Existing Rules List */}
          <div className="space-y-2">
            <div className="text-[10px] font-extrabold uppercase text-muted-foreground">
              Configured Jurisdictions
            </div>
            {!taxRules || taxRules.length === 0 ? (
              <div className="p-3 rounded-xl bg-secondary/20 border border-border text-xs text-muted-foreground">
                0% Direct GST Configured (All catalog items priced inclusive of tax).
              </div>
            ) : (
              taxRules.map((rule) => (
                <div key={rule.id} className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-foreground">{rule.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">Country: {rule.country}</div>
                  </div>
                  <Badge variant="outline" className="font-black font-mono">
                    {rule.rate}%
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
