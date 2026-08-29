"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Scissors, Upload, ArrowRight, ArrowLeft, Check, Sparkles, 
  RotateCw, ShieldCheck, Truck, AlertCircle, Loader2, Image as ImageIcon,
  CheckCircle2, MessageCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { useProducts } from '@/hooks/use-catalog';
import { useAddToCart } from '@/features/cart/hooks/use-cart';
import { uploadsService } from '@/services/uploads.service';
import { formatCurrency } from '@/lib/utils';
import { WhatsAppOrderDialog } from '@/components/storefront/whatsapp-order-dialog';
import { toast } from 'sonner';

interface ColorOption {
  name: string;
  hex: string;
  shirtBg: string;
  textColor: string;
}

const COLORS: ColorOption[] = [
  { name: 'Onyx Black', hex: '#111113', shirtBg: 'bg-zinc-950', textColor: 'text-zinc-100' },
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

  const { data: productsData } = useProducts({ limit: 20 });
  const products = productsData?.pages?.[0]?.data || [];
  const baseProduct = products.find(p => p.slug.includes('t-shirt') || p.slug.includes('shirt')) || products[0];
  const baseVariant = baseProduct?.variants?.[0];

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSilhouette, setSelectedSilhouette] = useState(SILHOUETTES[0]);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedPosition, setSelectedPosition] = useState(PRINT_POSITIONS[0]);
  
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designPreview, setDesignPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');

  const addToCartMutation = useAddToCart();

  const basePrice = selectedSilhouette.basePrice;
  const customizationPrice = selectedPosition.extraCost;
  const finalPrice = basePrice + customizationPrice;

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
      setUploadedUrl(null);
    };
    reader.readAsDataURL(file);
  };

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

  const handleAddToCart = async () => {
    if (!designPreview) {
      toast.error('Please upload your custom design artwork in Step 05 before adding to cart.');
      setCurrentStep(5);
      return;
    }
    const savedUrl = await handleUploadAndSave();
    if (!savedUrl) return;
    if (!baseVariant) {
      toast.error('Base product variant is loading. Please try again in a moment.');
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
      { productVariantId: baseVariant.id, quantity: 1, customConfig },
      { onSuccess: () => { toast.success('Custom T-Shirt added to cart!'); router.push('/cart'); } }
    );
  };

  const whatsAppCustomItem = {
    title: `ASORA Custom ${selectedSilhouette.name}`,
    size: selectedSize,
    color: selectedColor.name,
    quantity: 1,
    price: finalPrice,
    slugOrId: baseProduct?.slug || 'customizer',
    customConfig: {
      shirtType: selectedSilhouette.id,
      color: selectedColor.name,
      size: selectedSize,
      printPosition: selectedPosition.id,
      designUrl: uploadedUrl || designPreview || undefined,
      previewUrl: uploadedUrl || designPreview || undefined,
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <div className="container max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-6 sm:space-y-8">
        
        <Breadcrumbs items={[
          { label: 'HOME', href: '/' },
          { label: 'CUSTOM STUDIO', href: '/customizer' },
        ]} className="text-zinc-500 font-mono text-[11px]" />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-850 pb-6">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-rose-500 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase">
              <Scissors className="h-3.5 w-3.5" />
              <span>ASORA / CUSTOM STUDIO</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-100 uppercase">
              CUSTOMIZE YOUR T-SHIRT
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Design your custom streetwear piece. Heavyweight 240+ GSM combed cotton with high-definition screenprint.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-left sm:text-right shrink-0">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">CUSTOM PRICE</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-500">{formatCurrency(finalPrice)}</span>
            <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">Heavy Cotton + HD Print</span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1.5 sm:gap-2 border-b border-zinc-850 pb-4 text-center">
          {[
            { step: 1, label: '01 FIT' },
            { step: 2, label: '02 COLOR' },
            { step: 3, label: '03 SIZE' },
            { step: 4, label: '04 PRINT' },
            { step: 5, label: '05 ARTWORK' },
            { step: 6, label: '06 ORDER' },
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          <div className="lg:col-span-5 relative lg:sticky lg:top-24 space-y-3">
            <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-square sm:aspect-[4/3] max-h-[380px] sm:max-h-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-2xl flex items-center justify-center p-4 sm:p-6">
              
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.08),transparent_70%)] pointer-events-none" />

              <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center">
                <span className="px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300 uppercase backdrop-blur-md">
                  {selectedSilhouette.id.toUpperCase()}
                </span>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewSide(previewSide === 'front' ? 'back' : 'front')}
                  className="h-7 px-2.5 rounded bg-zinc-950/80 border-zinc-800 text-[10px] font-mono font-bold text-zinc-200 gap-1.5 backdrop-blur-md hover:bg-zinc-900"
                >
                  <RotateCw className="h-3 w-3 text-rose-500" />
                  <span>VIEW: {previewSide.toUpperCase()}</span>
                </Button>
              </div>

              <div className="relative w-full h-full max-w-[280px] sm:max-w-[320px] flex items-center justify-center pt-3 pb-4">
                
                <svg
                  viewBox="0 0 200 220"
                  className="w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)] transition-all duration-300"
                >
                  <defs>
                    <linearGradient id="tshirtShading" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                      <stop offset="50%" stopColor="#000000" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 60 15 
                       C 75 22, 125 22, 140 15 
                       L 185 45 
                       L 165 80 
                       L 145 68 
                       L 145 205 
                       C 145 210, 55 210, 55 205 
                       L 55 68 
                       L 35 80 
                       L 15 45 
                       Z"
                    fill={selectedColor.hex}
                    stroke="#3f3f46"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M 60 15 
                       C 75 22, 125 22, 140 15 
                       L 185 45 
                       L 165 80 
                       L 145 68 
                       L 145 205 
                       C 145 210, 55 210, 55 205 
                       L 55 68 
                       L 35 80 
                       L 15 45 
                       Z"
                    fill="url(#tshirtShading)"
                  />

                  <path
                    d="M 60 15 C 75 32, 125 32, 140 15"
                    fill="none"
                    stroke="#52525b"
                    strokeWidth="2.5"
                  />
                  {previewSide === 'back' && (
                    <path
                      d="M 65 16 C 85 24, 115 24, 135 16"
                      fill="none"
                      stroke="#71717a"
                      strokeWidth="1.5"
                    />
                  )}

                  <path d="M 55 68 L 70 30" fill="none" stroke="#52525b" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                  <path d="M 145 68 L 130 30" fill="none" stroke="#52525b" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                </svg>

                <div 
                  className={`absolute z-10 flex items-center justify-center transition-all duration-300 ${
                    selectedPosition.id === 'back' || previewSide === 'back'
                      ? 'w-28 h-36 top-16'
                      : 'w-24 h-28 top-16'
                  }`}
                >
                  {designPreview ? (
                    <div className="relative w-full h-full flex items-center justify-center p-1">
                      <img
                        src={designPreview}
                        alt="Custom Print Artwork"
                        className="max-h-full max-w-full object-contain rounded drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full border border-dashed border-rose-500/50 rounded flex flex-col items-center justify-center text-center p-1 bg-rose-950/10 backdrop-blur-[1px]">
                      <ImageIcon className="h-4 w-4 text-rose-500 mb-0.5" />
                      <span className="text-[8px] font-mono font-bold uppercase text-rose-400">
                        {previewSide === 'front' ? 'CHEST PRINT' : 'BACK PRINT'}
                      </span>
                    </div>
                  )}
                </div>

              </div>

              <div className="absolute bottom-2.5 left-3 right-3 z-20 flex justify-between items-center p-2 rounded-lg bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-md text-[10px] font-mono">
                <span className="text-zinc-400 truncate max-w-[140px]">{selectedSilhouette.name}</span>
                <span className="text-rose-400 font-bold">{selectedColor.name} • {selectedSize}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono">
              <span className="text-zinc-400 flex items-center gap-1.5 truncate">
                <Sparkles className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span>{designPreview ? 'Custom artwork loaded' : 'No artwork uploaded yet'}</span>
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 text-[10px] font-mono uppercase bg-zinc-950 border-zinc-800 text-zinc-200 hover:text-white shrink-0"
              >
                <Upload className="h-3 w-3 mr-1" />
                {designPreview ? 'Change Image' : 'Upload Image'}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            
            <div className={`p-5 rounded-xl bg-zinc-900 border ${currentStep === 1 ? 'border-rose-500 shadow-xl' : 'border-zinc-800'} space-y-3`}>
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
                        setCurrentStep(2);
                      }}
                      className={`p-4 rounded-lg text-left transition-all border ${
                        isSelected
                          ? 'bg-zinc-950 border-rose-500 shadow-md'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-zinc-100 uppercase">{sil.name}</span>
                        {isSelected && <Badge className="bg-rose-600 text-[9px] h-4">ACTIVE</Badge>}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 space-y-0.5">
                        <p>{sil.gsm}</p>
                        <p>{sil.fit}</p>
                        <p className="text-rose-400 font-bold pt-1">{formatCurrency(sil.basePrice)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`p-5 rounded-xl bg-zinc-900 border ${currentStep === 2 ? 'border-rose-500 shadow-xl' : 'border-zinc-800'} space-y-3`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                  STEP 02 — SELECT COLOR
                </span>
                {currentStep > 2 && <Check className="h-4 w-4 text-emerald-400" />}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((col) => {
                  const isSelected = selectedColor.name === col.name;
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(col);
                        setCurrentStep(3);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                        isSelected
                          ? 'bg-zinc-950 border-rose-500 text-zinc-100 shadow-md'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-zinc-700"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`p-5 rounded-xl bg-zinc-900 border ${currentStep === 3 ? 'border-rose-500 shadow-xl' : 'border-zinc-800'} space-y-3`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                  STEP 03 — SELECT SIZE
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
                        setCurrentStep(4);
                      }}
                      className={`w-11 h-10 rounded-lg font-mono font-bold text-xs uppercase border transition-all ${
                        isSelected
                          ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`p-5 rounded-xl bg-zinc-900 border ${currentStep === 4 ? 'border-rose-500 shadow-xl' : 'border-zinc-800'} space-y-3`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                  STEP 04 — PRINT PLACEMENT
                </span>
                {currentStep > 4 && <Check className="h-4 w-4 text-emerald-400" />}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PRINT_POSITIONS.map((pos) => {
                  const isSelected = selectedPosition.id === pos.id;
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => {
                        setSelectedPosition(pos);
                        if (pos.id === 'back') setPreviewSide('back');
                        if (pos.id === 'front') setPreviewSide('front');
                        setCurrentStep(5);
                      }}
                      className={`p-3 rounded-lg text-left transition-all border ${
                        isSelected
                          ? 'bg-zinc-950 border-rose-500 shadow-md'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-zinc-100 uppercase mb-1">{pos.name}</div>
                      <p className="text-[10px] text-zinc-400 font-mono leading-tight">{pos.desc}</p>
                      <span className="text-[11px] font-mono text-rose-400 font-bold block mt-2">
                        {pos.extraCost === 0 ? 'FREE' : `+${formatCurrency(pos.extraCost)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`p-5 rounded-xl bg-zinc-900 border ${currentStep === 5 ? 'border-rose-500 shadow-xl' : 'border-zinc-800'} space-y-3`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                  STEP 05 — UPLOAD YOUR ARTWORK
                </span>
                {designPreview && <Check className="h-4 w-4 text-emerald-400" />}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />

              {designPreview ? (
                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-zinc-900 rounded border border-zinc-800 overflow-hidden flex items-center justify-center p-1">
                      <img src={designPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-zinc-200 uppercase">Artwork Attached</p>
                      <p className="text-[10px] font-mono text-zinc-500">{designFile?.name || 'custom-design.png'}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs font-mono uppercase bg-zinc-900 border-zinc-800"
                  >
                    Replace
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-800 hover:border-rose-500/80 rounded-xl p-6 text-center cursor-pointer transition-all bg-zinc-950/40 hover:bg-zinc-950 flex flex-col items-center gap-2"
                >
                  <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-rose-500">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-zinc-100 uppercase">
                      CLICK TO UPLOAD ARTWORK
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                      PNG (transparent recommended), JPG, WEBP • Max 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest block">
                STEP 06 — FINAL REVIEW & ORDER
              </span>

              <div className="space-y-1.5 text-xs font-mono border-t border-zinc-850 pt-3">
                <div className="flex justify-between text-zinc-400">
                  <span>Base Shirt ({selectedSilhouette.name}):</span>
                  <span className="text-zinc-200">{formatCurrency(basePrice)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Print Placement ({selectedPosition.name}):</span>
                  <span className="text-zinc-200">{customizationPrice > 0 ? `+${formatCurrency(customizationPrice)}` : 'PKR 0'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-100 border-t border-zinc-800 pt-2 mt-2">
                  <span>TOTAL FINAL PRICE:</span>
                  <span className="text-rose-500 font-mono text-base">{formatCurrency(finalPrice)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                
                <WhatsAppOrderDialog
                  items={[whatsAppCustomItem]}
                  totalPrice={finalPrice}
                  triggerText="1-Click WhatsApp Order"
                  triggerClassName="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded shadow-lg flex items-center justify-center gap-2"
                />

                <Button
                  type="button"
                  disabled={addToCartMutation.isPending || isUploading}
                  onClick={handleAddToCart}
                  className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-wider rounded shadow-lg flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>UPLOADING ARTWORK...</span>
                    </>
                  ) : addToCartMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>ADDING TO BAG...</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="h-3.5 w-3.5" />
                      <span>ADD TO BAG</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-mono text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>High-Density HD Screenprint</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>Cash on Delivery (COD)</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
