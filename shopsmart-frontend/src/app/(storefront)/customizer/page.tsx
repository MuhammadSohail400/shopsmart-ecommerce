"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Scissors, Upload, ArrowRight, ArrowLeft, Check, Sparkles, 
  RotateCw, ShieldCheck, Truck, AlertCircle, Loader2, Image as ImageIcon,
  CheckCircle2, Layers
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { useProducts } from '@/hooks/use-catalog';
import { useAddToCart } from '@/features/cart/hooks/use-cart';
import { uploadsService } from '@/services/uploads.service';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface ColorOption {
  name: string;
  hex: string;
  shirtBg: string;
  textColor: string;
}

const COLORS: ColorOption[] = [
  { name: 'Onyx Black', hex: '#0a0a0c', shirtBg: 'bg-zinc-950', textColor: 'text-zinc-100' },
  { name: 'Pure White', hex: '#f4f4f5', shirtBg: 'bg-zinc-100', textColor: 'text-zinc-900' },
  { name: 'Charcoal Grey', hex: '#27272a', shirtBg: 'bg-zinc-800', textColor: 'text-zinc-100' },
  { name: 'Dark Crimson', hex: '#881337', shirtBg: 'bg-rose-950', textColor: 'text-rose-100' },
  { name: 'Heather Slate', hex: '#3f3f46', shirtBg: 'bg-zinc-700', textColor: 'text-zinc-100' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const SILHOUETTES = [
  {
    id: 'oversized',
    name: 'Oversized Streetwear T-Shirt',
    gsm: '240+ GSM Heavyweight',
    fit: 'Drop-Shoulder Boxy Fit',
    basePrice: 2500,
  },
  {
    id: 'regular',
    name: 'Classic Regular T-Shirt',
    gsm: '200 GSM Combed Cotton',
    fit: 'Modern Tailored Fit',
    basePrice: 2200,
  },
];

const PRINT_POSITIONS = [
  {
    id: 'front',
    name: 'Front Chest Graphic',
    desc: 'Centered aesthetic chest artwork hit',
    extraCost: 0,
  },
  {
    id: 'back',
    name: 'Full Back Artwork',
    desc: 'Large statement back streetwear print',
    extraCost: 0,
  },
  {
    id: 'front_back',
    name: 'Front + Back Double Hit',
    desc: 'Chest graphic + Full back statement artwork',
    extraCost: 400,
  },
];

export default function CustomizerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Query custom products / base variants from catalog
  const { data: productsData } = useProducts({ limit: 20 });
  const products = productsData?.pages?.[0]?.data || [];

  // Find or fallback base product
  const baseProduct = products.find(p => p.slug.includes('t-shirt') || p.slug.includes('shirt')) || products[0];
  const baseVariant = baseProduct?.variants?.[0];

  // Customizer State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSilhouette, setSelectedSilhouette] = useState(SILHOUETTES[0]);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedPosition, setSelectedPosition] = useState(PRINT_POSITIONS[0]);
  
  // Design & Upload State
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designPreview, setDesignPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');

  // Add to cart
  const addToCartMutation = useAddToCart();

  // Price Calculation (Server-Validated Rule)
  const basePrice = selectedSilhouette.basePrice;
  const customizationPrice = selectedPosition.extraCost;
  const finalPrice = basePrice + customizationPrice;

  // Handle local image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setDesignFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setDesignPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Upload to backend
  const handleUploadAndSave = async (): Promise<string | null> => {
    if (!designPreview) {
      toast.error('Please select an image for your custom design.');
      return null;
    }

    if (uploadedUrl) return uploadedUrl;

    try {
      setIsUploading(true);
      const res = await uploadsService.uploadCustomDesign(designPreview);
      setUploadedUrl(res.url);
      return res.url;
    } catch (err: any) {
      toast.error(err.userMessage || 'Failed to upload custom design.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Add To Cart
  const handleAddToCart = async () => {
    if (!designPreview) {
      toast.error('Please upload your custom design artwork before adding to cart.');
      setCurrentStep(5);
      return;
    }

    const savedUrl = await handleUploadAndSave();
    if (!savedUrl) return;

    if (!baseVariant) {
      toast.error('Base product variant unavailable. Please try again.');
      return;
    }

    const customConfig = {
      shirtType: selectedSilhouette.id,
      color: selectedColor.name,
      size: selectedSize,
      printPosition: selectedPosition.id,
      designUrl: savedUrl,
      previewUrl: savedUrl,
      basePrice,
      customizationPrice,
      finalPrice,
    };

    addToCartMutation.mutate(
      {
        productVariantId: baseVariant.id,
        quantity: 1,
        customConfig,
      },
      {
        onSuccess: () => {
          toast.success('Custom T-Shirt added to cart!');
          router.push('/cart');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="container max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-6 sm:space-y-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'HOME', href: '/' },
          { label: 'CUSTOM STUDIO', href: '/customizer' },
        ]} className="text-zinc-500 font-mono text-[11px]" />

        {/* Studio Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-850 pb-6">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-rose-500 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase">
              <Scissors className="h-3.5 w-3.5" />
              <span>ASORA / CUSTOM STUDIO</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-100 uppercase">
              CUSTOMIZE YOUR T-SHIRT
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Your design. Your fit. Your story. Heavyweight 240+ GSM combed cotton with high-density DTF screenprint.
            </p>
          </div>

          {/* Live Price Tag */}
          <div className="p-4 rounded-md bg-zinc-900 border border-zinc-800 text-left sm:text-right">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">CUSTOM PRICE</span>
            <span className="text-2xl font-black font-mono text-rose-500">{formatCurrency(finalPrice)}</span>
            <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">Includes Print & Heavy Cotton</span>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-6 gap-2 border-b border-zinc-850 pb-4 text-center">
          {[
            { step: 1, label: '01 SHIRT' },
            { step: 2, label: '02 COLOR' },
            { step: 3, label: '03 SIZE' },
            { step: 4, label: '04 PRINT' },
            { step: 5, label: '05 DESIGN' },
            { step: 6, label: '06 REVIEW' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`py-2 px-1 rounded text-[10px] sm:text-xs font-mono font-bold uppercase transition-all ${
                currentStep === s.step
                  ? 'bg-rose-600 text-white shadow-md'
                  : currentStep > s.step
                  ? 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                  : 'bg-zinc-950 text-zinc-600 border border-zinc-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── MAIN STUDIO WORKSPACE ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Live Interactive T-Shirt Preview Canvas (6 cols) */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-zinc-900/90 border border-zinc-800 shadow-2xl flex items-center justify-center p-6 sm:p-10">
              
              {/* Subtle Atmospheric Studio Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.06),transparent_70%)] pointer-events-none" />

              {/* Front/Back Flip Toggle */}
              <div className="absolute top-4 right-4 z-20 flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewSide(previewSide === 'front' ? 'back' : 'front')}
                  className="h-8 px-3 rounded bg-zinc-950/80 border-zinc-800 text-[11px] font-mono font-bold text-zinc-200 gap-1.5 backdrop-blur-md hover:bg-zinc-900"
                >
                  <RotateCw className="h-3.5 w-3.5 text-rose-500" />
                  <span>VIEW: {previewSide.toUpperCase()}</span>
                </Button>
              </div>

              {/* T-Shirt Silhouette Vector Mockup Shape */}
              <div 
                className={`relative w-full max-w-sm aspect-[4/5] rounded-3xl transition-colors duration-500 flex items-center justify-center border-2 border-zinc-800/80 shadow-2xl p-6 ${
                  selectedColor.name === 'Pure White' 
                    ? 'bg-zinc-200 text-zinc-900' 
                    : selectedColor.name === 'Dark Crimson' 
                    ? 'bg-rose-950 text-white' 
                    : selectedColor.name === 'Charcoal Grey' 
                    ? 'bg-zinc-800 text-white'
                    : selectedColor.name === 'Heather Slate'
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-950 text-white'
                }`}
              >
                {/* Collar indicator */}
                <div className="absolute top-0 w-24 h-6 border-b-2 border-zinc-600/40 rounded-b-full" />
                
                {/* Print Placement Box */}
                <div className={`relative border-2 border-dashed border-rose-500/40 rounded-md flex flex-col items-center justify-center p-3 transition-all ${
                  selectedPosition.id === 'back' || previewSide === 'back'
                    ? 'w-48 h-64 mt-4'
                    : 'w-40 h-48 mt-2'
                }`}>
                  {designPreview ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      <img
                        src={designPreview}
                        alt="Custom Print Artwork"
                        className="max-h-full max-w-full object-contain rounded drop-shadow-xl"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-4 space-y-2 opacity-60">
                      <ImageIcon className="h-8 w-8 mx-auto text-rose-500" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">
                        {previewSide === 'front' ? 'FRONT PRINT AREA' : 'BACK PRINT AREA'}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">
                        Upload artwork in Step 05
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Hem Tag */}
                <div className="absolute bottom-3 left-4 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                  ASORA • {selectedSilhouette.id.toUpperCase()} • {selectedSize}
                </div>
              </div>

              {/* Floating Spec Bar */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-center p-3 rounded bg-zinc-950/90 border border-zinc-800 backdrop-blur-md text-[11px] font-mono">
                <span className="text-zinc-400">{selectedSilhouette.name}</span>
                <span className="text-rose-400 font-bold">{selectedColor.name} • {selectedSize}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Step-by-Step Configuration Panel (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* ── STEP 1: SHIRT SILHOUETTE ── */}
            <div className={`p-6 rounded-md bg-zinc-900 border ${currentStep === 1 ? 'border-rose-500 shadow-xl' : 'border-zinc-800'} space-y-4`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                  STEP 01 — CHOOSE SILHOUETTE
                </span>
                {currentStep > 1 && <Check className="h-4 w-4 text-emerald-400" />}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SILHOUETTES.map((sil) => {
                  const isSelected = selectedSilhouette.id === sil.id;
                  return (
                    <button
                      key={sil.id}
                      type="button"
                      onClick={() => {
                        setSelectedSilhouette(sil);
                        if (currentStep === 1) setCurrentStep(2);
                      }}
                      className={`p-4 rounded text-left border transition-all ${
                        isSelected
                          ? 'bg-zinc-950 border-rose-500 shadow-lg'
                          : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-zinc-100 uppercase block">
                        {sil.name}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 block mt-1">
                        {sil.gsm}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {sil.fit}
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-500 block mt-3">
                        {formatCurrency(sil.basePrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── STEP 2: COLOR SELECTION ── */}
            <div className={`p-6 rounded-md bg-zinc-900 border ${currentStep === 2 ? 'border-rose-500 shadow-xl' : 'border-zinc-800'} space-y-4`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                  STEP 02 — SELECT SHIRT COLOR
                </span>
                {currentStep > 2 && <Check className="h-4 w-4 text-emerald-400" />}
              </div>

              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => {
                  const isSelected = selectedColor.name === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c);
                        if (currentStep === 2) setCurrentStep(3);
                      }}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded border transition-all ${
                        isSelected
                          ? 'bg-zinc-950 border-rose-500 text-white shadow-md'
                          : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span 
                        className="h-4 w-4 rounded-full border border-zinc-600 inline-block" 
                        style={{ backgroundColor: c.hex }} 
                      />
                      <span className="text-xs font-mono font-bold">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── STEP 3: SIZE SELECTION ── */}
            <div className={`p-6 rounded-md bg-zinc-900 border ${currentStep === 3 ? 'border-rose-500 shadow-xl' : 'border-zinc-800'} space-y-4`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                  STEP 03 — SELECT SIZE (STREETWEAR CUT)
                </span>
                {currentStep > 3 && <Check className="h-4 w-4 text-emerald-400" />}
              </div>

              <div className="flex flex-wrap gap-2">
                {SIZES.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setSelectedSize(sz);
                        if (currentStep === 3) setCurrentStep(4);
                      }}
                      className={`h-11 w-14 rounded text-xs font-mono font-bold border transition-all ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── STEP 4: PRINT PLACEMENT ── */}
            <div className={`p-6 rounded-md bg-zinc-900 border ${currentStep === 4 ? 'border-rose-500 shadow-xl' : 'border-zinc-800'} space-y-4`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                  STEP 04 — PRINT PLACEMENT
                </span>
                {currentStep > 4 && <Check className="h-4 w-4 text-emerald-400" />}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRINT_POSITIONS.map((pos) => {
                  const isSelected = selectedPosition.id === pos.id;
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => {
                        setSelectedPosition(pos);
                        if (pos.id === 'back') setPreviewSide('back');
                        else setPreviewSide('front');
                        if (currentStep === 4) setCurrentStep(5);
                      }}
                      className={`p-3.5 rounded text-left border transition-all ${
                        isSelected
                          ? 'bg-zinc-950 border-rose-500 shadow-md'
                          : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-zinc-100 uppercase block leading-tight">
                        {pos.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-1 leading-snug">
                        {pos.desc}
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-400 block mt-2">
                        {pos.extraCost > 0 ? `+${formatCurrency(pos.extraCost)}` : 'INCLUDED'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── STEP 5: DESIGN UPLOAD ── */}
            <div className={`p-6 rounded-md bg-zinc-900 border ${currentStep === 5 ? 'border-rose-500 shadow-xl' : 'border-zinc-800'} space-y-4`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                  STEP 05 — UPLOAD YOUR ARTWORK
                </span>
                {designPreview && <Check className="h-4 w-4 text-emerald-400" />}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {designPreview ? (
                <div className="flex items-center gap-4 p-4 rounded bg-zinc-950 border border-zinc-800">
                  <img
                    src={designPreview}
                    alt="Uploaded Artwork"
                    className="h-16 w-16 object-contain rounded bg-zinc-900 border border-zinc-800 p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-bold text-zinc-100 truncate">
                      {designFile?.name || 'custom-artwork.png'}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400">
                      {designFile ? `${(designFile.size / 1024).toFixed(1)} KB` : 'Ready to print'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-3 text-[11px] font-mono border-zinc-800 bg-zinc-900 text-zinc-200"
                  >
                    CHANGE
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-800 hover:border-rose-500/60 rounded-md p-8 text-center cursor-pointer transition-colors bg-zinc-950/40 space-y-3"
                >
                  <div className="h-12 w-12 rounded-full bg-rose-600/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-zinc-100 uppercase">
                      CLICK TO UPLOAD ARTWORK
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      PNG (transparent recommended), JPG, WEBP • Max 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── STEP 6: SUMMARY & ADD TO CART ── */}
            <div className="p-6 rounded-md bg-zinc-900 border border-zinc-800 space-y-4">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest block">
                STEP 06 — FINAL REVIEW & PRICING
              </span>

              <div className="space-y-2 text-xs font-mono border-t border-zinc-850 pt-3">
                <div className="flex justify-between text-zinc-400">
                  <span>Base Shirt ({selectedSilhouette.name}):</span>
                  <span className="text-zinc-200">{formatCurrency(basePrice)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Print Placement ({selectedPosition.name}):</span>
                  <span className="text-zinc-200">{customizationPrice > 0 ? `+${formatCurrency(customizationPrice)}` : 'PKR 0'}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Color & Size:</span>
                  <span className="text-zinc-200">{selectedColor.name} / {selectedSize}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-100 border-t border-zinc-800 pt-2 mt-2">
                  <span>TOTAL FINAL PRICE:</span>
                  <span className="text-rose-500 font-mono text-base">{formatCurrency(finalPrice)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  disabled={addToCartMutation.isPending || isUploading}
                  onClick={handleAddToCart}
                  className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-widest rounded shadow-xl flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>UPLOADING ARTWORK...</span>
                    </>
                  ) : addToCartMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>ADDING TO CART...</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="h-4 w-4" />
                      <span>ADD CUSTOM T-SHIRT TO CART</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-mono text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>High-Density Screenprint</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>Cash on Delivery</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
