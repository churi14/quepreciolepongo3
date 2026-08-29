"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Building, CreditCard } from "lucide-react";

interface CommercializationProps {
  productPrice: number;
  // Antes se pasaba el costo de venta ya calculado en $ (onCostsChange), usando
  // un precio "adivinado" (productionCost * 2) porque este paso ocurre ANTES de
  // que el usuario defina el precio real en el paso "Precio Final". Eso dejaba
  // las comisiones/impuestos congeladas con un monto que no se recalculaba
  // cuando el usuario cambiaba el precio de mercado.
  // Ahora exponemos la TASA (fracción del precio) y quien consume este
  // componente calcula el monto en $ multiplicando por el precio real vigente
  // en cada momento (ver CostCalculator).
  onRateChange: (rate: number) => void;
}

export default function Commercialization({ productPrice, onRateChange }: CommercializationProps) {
  // Estado para el tipo de canal
  const [channelType, setChannelType] = useState<"mercadolibre" | "tienda" | "manual">("tienda");
  
  // Estados para Tienda/Local
  const [province, setProvince] = useState("buenos_aires");
  const [isMonotributoUnificado, setIsMonotributoUnificado] = useState(false);
  const [ecommercePlatform, setEcommercePlatform] = useState("ninguna");
  const [paymentMethod, setPaymentMethod] = useState("modo"); // Default MODO (0%)

  // Tasa total (fracción del precio de venta) que representa impuestos + plataforma + medio de cobro
  const [sellingRate, setSellingRate] = useState(0);

  // DATOS MAESTROS
  const provinces = [
    { id: "buenos_aires", label: "Buenos Aires (3.5%)", rate: 0.035 },
    { id: "caba", label: "CABA (3.0%)", rate: 0.03 },
    { id: "cordoba", label: "Córdoba (4.75%)", rate: 0.0475 },
    { id: "santa_fe", label: "Santa Fe (4.5%)", rate: 0.045 },
    { id: "otra", label: "Otra (3.0% prom)", rate: 0.03 },
  ];

  const platforms = [
    { id: "ninguna", label: "Ninguna / Presencial (0%)", fee: 0, fixed: 0 }, 
    { id: "tiendanube", label: "Tienda Nube (2% costo transac.)", fee: 0.02, fixed: 0 },
    { id: "empretienda", label: "Empretienda (0% comisión)", fee: 0, fixed: 0 },
    { id: "wix", label: "Wix eCommerce (0%)", fee: 0, fixed: 0 },
    { id: "shopify", label: "Shopify (2% aprox)", fee: 0.02, fixed: 0 },
    { id: "whatsapp", label: "Venta Directa / WhatsApp (0%)", fee: 0, fixed: 0 },
  ];

  const paymentMethods = [
    { id: "mp_credito", label: "Mercado Pago (Crédito Inmediato - 6.39%)", rate: 0.0639 },
    { id: "mp_qr", label: "Mercado Pago (QR Saldo - 0.8%)", rate: 0.008 },
    { id: "uala", label: "Ualá Bis (General - 4.9%)", rate: 0.049 },
    { id: "payway", label: "Payway (Crédito Inmediato - 5.5%)", rate: 0.055 },
    { id: "getnet", label: "Getnet (Santander - 6.19%)", rate: 0.0619 },
    { id: "modo", label: "MODO / Transferencia (0%)", rate: 0 },
    { id: "efectivo", label: "Efectivo (0%)", rate: 0 },
  ];

  // Efecto para calcular la TASA total (no depende del precio: es % del precio).
  // Nota: los "fixed" de plataforma son montos fijos en $, no tasas — hoy todos
  // valen 0 en el listado de plataformas, así que no rompen esta simplificación.
  // Si en el futuro se agrega una plataforma con costo fijo real, hay que
  // volver a sumar ese monto aparte (no como parte de la tasa).
  useEffect(() => {
    let rate = 0;

    if (channelType === "tienda") {
        // 1. Impuestos (IIBB)
        if (!isMonotributoUnificado) {
            const prov = provinces.find(p => p.id === province);
            if (prov) rate += prov.rate;
        }

        // 2. Plataforma
        const plat = platforms.find(p => p.id === ecommercePlatform);
        if (plat) {
            rate += plat.fee;
        }

        // 3. Medio de Cobro
        const pay = paymentMethods.find(p => p.id === paymentMethod);
        if (pay) {
            rate += pay.rate;
        }

    } else if (channelType === "mercadolibre") {
        // Ejemplo simplificado MELI (13% Clásica aprox)
        rate += 0.13;
    }

    setSellingRate(rate);
    onRateChange(rate);
  }, [channelType, province, isMonotributoUnificado, ecommercePlatform, paymentMethod, onRateChange]);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        
        {/* Selector de Canal Principal */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
            <button onClick={() => setChannelType("mercadolibre")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${channelType === "mercadolibre" ? "bg-white text-yellow-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                Mercado Libre
            </button>
            <button onClick={() => setChannelType("tienda")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${channelType === "tienda" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                Tienda / Local
            </button>
            <button onClick={() => setChannelType("manual")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${channelType === "manual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                Manual
            </button>
        </div>

        {/* Opciones para Tienda / Local */}
        {channelType === "tienda" && (
            <div className="p-4 border border-slate-200 rounded-xl space-y-4 bg-white">
                
                {/* A. Impuestos */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                           <Building className="w-3 h-3" /> Provincia (Retención IIBB)
                        </label>
                        <select 
                            className="w-full mt-1 bg-transparent font-semibold text-slate-700 text-sm outline-none cursor-pointer"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            disabled={isMonotributoUnificado}
                        >
                            {provinces.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
                        <span className="text-[10px] text-slate-500 w-24 leading-tight">
                            Tengo Monotributo Unificado <br/>
                            <span className="text-[8px] opacity-70">Exento de retenciones bancarias (SIRCUPA)</span>
                        </span>
                        <div 
                            className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${isMonotributoUnificado ? 'bg-blue-600' : 'bg-slate-300'}`}
                            onClick={() => setIsMonotributoUnificado(!isMonotributoUnificado)}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isMonotributoUnificado ? 'translate-x-4' : ''}`} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* B. Plataforma */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
                           <ShoppingCart className="w-3 h-3" /> Plataforma E-commerce
                        </label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            value={ecommercePlatform}
                            onChange={(e) => setEcommercePlatform(e.target.value)}
                        >
                            {platforms.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* C. Medio de Cobro (¡AQUÍ ESTÁ!) */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
                           <CreditCard className="w-3 h-3" /> Medio de Cobro (Tarifas 2025)
                        </label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            {paymentMethods.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

            </div>
        )}

        {/* Resumen del Costo (estimado con el precio actual; se recalcula solo cuando definas el precio final) */}
        <div className="flex justify-between items-center p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <div>
                <p className="text-xs font-bold text-indigo-800 uppercase">Costo de Venta Estimado</p>
                <p className="text-[10px] text-indigo-600">Comisión Plataforma + Cobro + Impuestos ({(sellingRate * 100).toFixed(1)}% del precio)</p>
            </div>
            <div className="text-xl font-black text-indigo-900">
                ${(productPrice * sellingRate).toLocaleString('es-AR', {maximumFractionDigits: 0})}
            </div>
        </div>

    </div>
  );
}