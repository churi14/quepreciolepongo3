"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; 
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; 
import { ShoppingBag, Truck, CreditCard, Store, Info, AlertTriangle, Building2 } from "lucide-react";

interface Props {
  productPrice: number; 
  onCostsChange: (sellingCosts: number) => void;
}

export default function Commercialization({ productPrice, onCostsChange }: Props) {
  const [channel, setChannel] = useState("ml"); // "ml" | "shop" | "manual"

  // --- 1. MERCADO LIBRE LOGIC ---
  const [mlType, setMlType] = useState<"clasica" | "premium">("clasica");
  const [mlShipping, setMlShipping] = useState(false);
  const [mlProvince, setMlProvince] = useState("ba");
  const [isUnifiedMonotax, setIsUnifiedMonotax] = useState(false); // Nuevo: Monotributo Unificado

  // Tasas IIBB Estimadas 2025 (Investigación Real)
  // Nota: Monotributo Unificado (Régimen Simplificado) exime de retenciones bancarias/fintech en BA, Cba, etc.
  const mlTaxRates: Record<string, number> = {
    "ba": 3.5,    // Buenos Aires (ARBA - Padrón Gral)
    "caba": 3.0,  // CABA (SIRCREB Gral)
    "cba": 4.75,  // Córdoba
    "sf": 4.5,    // Santa Fe
    "tuc": 5.0,   // Tucumán (Riesgo fiscal alto)
    "mza": 3.0,   // Mendoza
    "general": 3.5 // Promedio país
  };

  // --- 2. TIENDA PROPIA / PLATAFORMAS ---
  const [shopPlatform, setShopPlatform] = useState("tiendanube"); 
  const [shopGateway, setShopGateway] = useState("mp"); 

  const platformFees: Record<string, number> = {
    "tiendanube": 2.0,   // Plan Clásico (2% por transacción)
    "empretienda": 0.0,  // Sin comisión por venta
    "wix": 0.0,          // Solo cobra el gateway
    "shopify": 2.0,      // Basic Shopify
    "personal": 0.0      // Venta por Instagram/WhatsApp
  };

  const gatewayFees: Record<string, number> = {
    "mp_qr": 0.97,       // MP QR Dinero en Cuenta (0.8% + IVA)
    "mp_point": 3.99,    // MP Point Débito (3.38% aprox con IVA)
    "mp_credit": 7.73,   // MP Crédito Inmediato (6.39% + IVA)
    "uala": 5.93,        // Ualá Bis (4.9% + IVA)
    "payway_deb": 1.21,  // Payway Débito (1.0% + IVA)
    "payway_cred": 6.65, // Payway Crédito Inmediato (5.5% + IVA aprox)
    "getnet": 7.49,      // Getnet Crédito Inmediato (6.19% + IVA)
    "modo": 0.0,         // Transferencia directa (0%)
    "custom": 0.0
  };
  
  const [customGatewayFee, setCustomGatewayFee] = useState("0");

  // --- 3. MANUAL ---
  const [manualCommissions, setManualCommissions] = useState([
    { id: 1, name: "Comisión Venta", percentage: 10.0 },
    { id: 2, name: "Impuestos (IIBB)", percentage: 3.5 },
  ]);

  const onCostsChangeRef = useRef(onCostsChange);
  useEffect(() => { onCostsChangeRef.current = onCostsChange; });

  // --- CÁLCULO PRINCIPAL ---
  const calculateSellingCosts = () => {
    const priceBase = productPrice || 0;
    let total = 0;

    if (channel === "ml") {
        // --- MERCADO LIBRE ---
        const commissionRate = mlType === "clasica" ? 0.14 : 0.31; 
        total += priceBase * commissionRate;

        if (priceBase > 0 && priceBase < 15000) {
          total += 1500;
        }
        
        const isShippingMandatory = priceBase >= 30000;
        if (mlShipping || isShippingMandatory) {
            total += 6500; 
        }

        // Cálculo Inteligente de IIBB
        // Si tiene Monotributo Unificado, la retención suele ser 0% en billeteras (SIRCUPA/ARBA).
        const provinceRate = mlTaxRates[mlProvince] || mlTaxRates["general"];
        const finalTaxRate = isUnifiedMonotax ? 0 : (provinceRate / 100);
        
        total += priceBase * finalTaxRate;

    } else if (channel === "shop") {
        // --- TIENDA PROPIA ---
        const platformPct = platformFees[shopPlatform] || 0;
        total += priceBase * (platformPct / 100);

        let gatewayPct = gatewayFees[shopGateway] || 0;
        if (shopGateway === "custom") gatewayPct = parseFloat(customGatewayFee) || 0;
        total += priceBase * (gatewayPct / 100);

        // Impuestos también aplican aquí si cobra por billetera virtual
        const provinceRate = mlTaxRates[mlProvince] || mlTaxRates["general"];
        const finalTaxRate = isUnifiedMonotax ? 0 : (provinceRate / 100);
        total += priceBase * finalTaxRate;

    } else {
        // --- MANUAL ---
        const totalPercent = manualCommissions.reduce((sum, item) => sum + item.percentage, 0);
        total += priceBase * (totalPercent / 100);
    }

    return total;
  };

  const totalSellingCosts = calculateSellingCosts();

  useEffect(() => {
    onCostsChangeRef.current(totalSellingCosts);
  }, [totalSellingCosts]);

  const updateManualComm = (id: number, val: string) => {
    setManualCommissions(manualCommissions.map(c => c.id === id ? { ...c, percentage: parseFloat(val) || 0 } : c));
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER TABS */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 p-4 pb-0">
             <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <Store className="h-4 w-4 text-blue-600" />
                Canal de Venta y Cobro
             </h3>
             <Tabs value={channel} onValueChange={setChannel} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-200/50 p-1">
                    <TabsTrigger value="ml" className="text-xs md:text-sm">Mercado Libre</TabsTrigger>
                    <TabsTrigger value="shop" className="text-xs md:text-sm">Tienda / Local</TabsTrigger>
                    <TabsTrigger value="manual" className="text-xs md:text-sm">Manual</TabsTrigger>
                </TabsList>
             </Tabs>
          </div>

          <div className="p-6 bg-white">
            
            {/* CONFIGURACIÓN FISCAL (COMÚN A ML Y SHOP) */}
            {(channel === "ml" || channel === "shop") && (
                <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                             <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> Provincia (Retención IIBB)
                             </label>
                             <Select value={mlProvince} onValueChange={setMlProvince}>
                                <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ba">Buenos Aires (3.5%)</SelectItem>
                                    <SelectItem value="caba">CABA (3.0%)</SelectItem>
                                    <SelectItem value="cba">Córdoba (4.75%)</SelectItem>
                                    <SelectItem value="sf">Santa Fe (4.5%)</SelectItem>
                                    <SelectItem value="tuc">Tucumán (5.0%)</SelectItem>
                                    <SelectItem value="mza">Mendoza (3.0%)</SelectItem>
                                </SelectContent>
                            </Select>
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-white px-2 rounded border border-slate-200">
                        <label className="text-xs font-medium text-slate-600 leading-tight">
                            Tengo Monotributo Unificado
                            <span className="block text-[9px] text-slate-400">Exento de retenciones bancarias (SIRCUPA)</span>
                        </label>
                        <Switch checked={isUnifiedMonotax} onCheckedChange={setIsUnifiedMonotax} />
                    </div>
                </div>
            )}

            {/* 1. MERCADO LIBRE */}
            {channel === "ml" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Tipo de Publicación</label>
                        <Select value={mlType} onValueChange={(v: any) => setMlType(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="clasica">Clásica (Expo Alta - 14%)</SelectItem>
                                <SelectItem value="premium">Premium (Cuotas s/int - 31%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200">
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-slate-500" />
                            <label className="text-xs font-medium text-slate-700">Ofrecer Envío Gratis</label>
                        </div>
                        {(productPrice || 0) >= 30000 ? (
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Obligatorio ({'>'} $30k)
                            </span>
                        ) : (
                            <Switch checked={mlShipping} onCheckedChange={setMlShipping} />
                        )}
                    </div>
                </div>
            )}

            {/* 2. TIENDA PROPIA */}
            {channel === "shop" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                    {/* A. PLATAFORMA */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <ShoppingBag className="h-3 w-3" /> Plataforma E-commerce
                        </label>
                        <Select value={shopPlatform} onValueChange={setShopPlatform}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccioná plataforma" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tiendanube">Tienda Nube (2% costo transac.)</SelectItem>
                                <SelectItem value="empretienda">Empretienda (0% comisión)</SelectItem>
                                <SelectItem value="wix">Wix eCommerce (0%)</SelectItem>
                                <SelectItem value="shopify">Shopify (2% aprox)</SelectItem>
                                <SelectItem value="personal">Venta Directa / WhatsApp (0%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border-t border-slate-100"></div>

                    {/* B. PASARELA DE PAGO */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="h-3 w-3" /> Medio de Cobro (Tarifas 2025)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select value={shopGateway} onValueChange={setShopGateway}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pasarela de pago" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mp_credit">Mercado Pago (Crédito Inmediato - 6.39%)</SelectItem>
                                    <SelectItem value="mp_qr">Mercado Pago (QR Saldo - 0.8%)</SelectItem>
                                    <SelectItem value="uala">Ualá Bis (General - 4.9%)</SelectItem>
                                    <SelectItem value="payway_cred">Payway (Crédito Inmediato - 5.5%)</SelectItem>
                                    <SelectItem value="getnet">Getnet (Santander - 6.19%)</SelectItem>
                                    <SelectItem value="modo">MODO / Transferencia (0%)</SelectItem>
                                    <SelectItem value="custom">Otra / Personalizado</SelectItem>
                                </SelectContent>
                            </Select>

                            {shopGateway === "custom" && (
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        placeholder="% Comisión"
                                        value={customGatewayFee}
                                        onChange={(e) => setCustomGatewayFee(e.target.value)}
                                        className="pr-6"
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                           * Las tasas incluyen IVA aproximado. Si tenés Monotributo Unificado, no se suman retenciones extra.
                        </p>
                    </div>
                </div>
            )}

            {/* 3. MANUAL */}
            {channel === "manual" && (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    <p className="text-xs text-slate-500 mb-2">Definí tus propios porcentajes.</p>
                    {manualCommissions.map((comm) => (
                        <div key={comm.id} className="flex items-center gap-2">
                            <Input 
                                className="h-9 text-xs flex-1 bg-slate-50" 
                                value={comm.name} 
                                onChange={(e) => {
                                    const newVal = e.target.value;
                                    setManualCommissions(manualCommissions.map(c => c.id === comm.id ? { ...c, name: newVal } : c));
                                }}
                            />
                            <div className="relative w-24">
                                <Input 
                                    className="h-9 text-xs text-right pr-6 bg-white" 
                                    value={comm.percentage} 
                                    onChange={(e) => updateManualComm(comm.id, e.target.value)}
                                />
                                <span className="absolute right-2 top-2.5 text-xs text-slate-400">%</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

          </div>

          {/* FOOTER RESULTADO */}
          <div className="bg-indigo-50/50 p-4 border-t border-indigo-100 flex justify-between items-center">
              <div className="flex flex-col">
                  <span className="text-xs font-bold text-indigo-900 uppercase">Costo de Venta Total</span>
                  <span className="text-[10px] text-indigo-400">Incluye comisión, envío e impuestos (IIBB)</span>
              </div>
              <span suppressHydrationWarning className="text-xl font-bold text-indigo-700">
                  ${Math.round(totalSellingCosts).toLocaleString("es-AR")}
              </span>
          </div>
      </div>
    </div>
  );
}