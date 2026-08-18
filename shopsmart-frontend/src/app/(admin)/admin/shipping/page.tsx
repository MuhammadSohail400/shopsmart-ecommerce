"use client";

import { useState } from 'react';
import { Truck, Plus, MapPin } from 'lucide-react';
import { useShippingZones, useCreateShippingZone, useCreateShippingRate } from '@/hooks/use-admin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminShippingPage() {
  const { data: zones, isLoading } = useShippingZones();
  const createZoneMutation = useCreateShippingZone();
  const createRateMutation = useCreateShippingRate();

  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [countries, setCountries] = useState('PK');

  // Rate Modal State
  const [selectedZoneForRate, setSelectedZoneForRate] = useState<string | null>(null);
  const [rateName, setRateName] = useState('');
  const [rateCost, setRateCost] = useState('');
  const [minDays, setMinDays] = useState('2');
  const [maxDays, setMaxDays] = useState('5');

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName) return;

    await createZoneMutation.mutateAsync({
      name: zoneName,
      countries: countries.split(',').map((c) => c.trim()),
    });

    setIsZoneModalOpen(false);
    setZoneName('');
  };

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZoneForRate || !rateName || !rateCost) return;

    await createRateMutation.mutateAsync({
      zoneId: selectedZoneForRate,
      name: rateName,
      rate: Number(rateCost),
      estimatedDaysMin: Number(minDays),
      estimatedDaysMax: Number(maxDays),
    });

    setSelectedZoneForRate(null);
    setRateName('');
    setRateCost('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            Shipping Zones & Rates
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Configure delivery coverage regions, standard & express freight rates, and delivery timeframes.
          </p>
        </div>

        <Dialog open={isZoneModalOpen} onOpenChange={setIsZoneModalOpen}>
          <DialogTrigger
            render={
              <Button className="font-bold rounded-full text-xs gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> Add Shipping Zone
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-black uppercase tracking-tight">
                Create Shipping Zone
              </DialogTitle>
              <DialogDescription className="text-xs">
                Group geographical territories for unified courier rates.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateZone} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="zname" className="text-xs font-bold">Zone Name</Label>
                <Input
                  id="zname"
                  placeholder="e.g. Nationwide Pakistan (Domestic)"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="zcountries" className="text-xs font-bold">Countries (Comma-separated ISO codes)</Label>
                <Input
                  id="zcountries"
                  placeholder="PK"
                  value={countries}
                  onChange={(e) => setCountries(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsZoneModalOpen(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createZoneMutation.isPending}
                  className="text-xs font-bold"
                >
                  {createZoneMutation.isPending ? 'Creating...' : 'Save Zone'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shipping Zones List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading shipping configuration...
          </div>
        ) : !zones || zones.length === 0 ? (
          <Card className="p-8 text-center rounded-2xl border-border text-xs text-muted-foreground">
            <Truck className="h-8 w-8 mx-auto text-primary mb-2 opacity-80" />
            <p className="font-bold text-foreground">No custom shipping zones created yet</p>
            <p className="text-[11px] mt-0.5">Click "Add Shipping Zone" to set up courier pricing tables.</p>
          </Card>
        ) : (
          zones.map((zone) => (
            <Card key={zone.id} className="p-5 rounded-2xl border-border space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-foreground uppercase">{zone.name}</h3>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      Countries: {zone.countries?.join(', ') || 'All'}
                    </div>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setSelectedZoneForRate(zone.id)}
                  className="font-bold text-[11px] gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Delivery Option
                </Button>
              </div>

              {/* Rate Rules Table */}
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Available Delivery Methods
                </div>

                {!zone.rates || zone.rates.length === 0 ? (
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border/60 text-xs text-muted-foreground">
                    Standard Flat Rate (Rs. 200) • Orders over Rs. 2,500 Free.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {zone.rates.map((rate) => (
                      <div key={rate.id} className="p-3 rounded-xl bg-secondary/30 border border-border flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-foreground">{rate.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {rate.estimatedDaysMin}-{rate.estimatedDaysMax} Business Days
                          </div>
                        </div>
                        <Badge variant="outline" className="font-black font-mono text-primary">
                          {rate.rate === 0 ? 'FREE' : `Rs. ${rate.rate}`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Rate Modal */}
      <Dialog open={!!selectedZoneForRate} onOpenChange={(open) => !open && setSelectedZoneForRate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight">
              Add Delivery Rate Option
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure courier pricing and timeframe for this territory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rname" className="text-xs font-bold">Delivery Method Name</Label>
              <Input
                id="rname"
                placeholder="e.g. Express Courier (TCS / Leopard)"
                value={rateName}
                onChange={(e) => setRateName(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rcost" className="text-xs font-bold">Shipping Cost (PKR)</Label>
              <Input
                id="rcost"
                type="number"
                placeholder="250"
                value={rateCost}
                onChange={(e) => setRateCost(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mind" className="text-xs font-bold">Min Days</Label>
                <Input
                  id="mind"
                  type="number"
                  value={minDays}
                  onChange={(e) => setMinDays(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxd" className="text-xs font-bold">Max Days</Label>
                <Input
                  id="maxd"
                  type="number"
                  value={maxDays}
                  onChange={(e) => setMaxDays(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedZoneForRate(null)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createRateMutation.isPending}
                className="text-xs font-bold"
              >
                {createRateMutation.isPending ? 'Saving...' : 'Save Rate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
