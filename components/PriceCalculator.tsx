"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { TrendingUp } from "lucide-react";

interface Props {
  totalCost: number;
  onPriceChange: (price: number, margin: number) => void;
}

export default function PriceCalculator({ totalCost, onPriceChange }: Props) {
  const [margin, setMargin] = useState(30);
  
  // Cálculo simple de Markup
  const profitAmount = totalCost * (margin / 100);
  const suggestedPrice = totalCost + profitAmount;

  useEffect(() => {
    onPriceChange(suggestedPrice, profitAmount);
  }, [suggestedPrice, profitAmount, onPriceChange]);

  return (
    <div className="space-y-6">
      
      {/* Selector de Ganancia */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            ¿Cuánto querés ganar?
            </h3>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                {margin}%
            </span>
        </div>

        <div className="flex items-center gap-4">
            <Slider 
                value={[margin]} 
                max={200} 
                step={5}
                onValueChange={(vals) => setMargin(vals[0])}
                className="flex-1"
            />
            <div className="w-20 relative">
                <Input 
                    type="number" 
                    value={margin} 
                    onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                    className="pr-6 text-right bg-white"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
            </div>
        </div>
      </div>

      {/* Visualización de la Ganancia Neta */}
      <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded border border-slate-100">
              <span className="text-xs text-slate-500 block mb-1">Costo Total (Base)</span>
              {/* AQUÍ ESTABA EL ERROR DE HIDRATACIÓN */}
              <span suppressHydrationWarning className="font-semibold text-slate-700">
                ${totalCost.toLocaleString("es-AR")}
              </span>
          </div>
          <div className="bg-green-50 p-3 rounded border border-green-100">
              <span className="text-xs text-green-600 block mb-1">Tu Ganancia Neta</span>
              {/* AQUÍ TAMBIÉN AGREGAMOS LA PROTECCIÓN */}
              <span suppressHydrationWarning className="font-bold text-green-700">
                +${profitAmount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </span>
          </div>
      </div>

      {/* Precio Final Sugerido */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2">
        <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Precio de Venta Sugerido</span>
        <div className="flex items-start text-4xl font-extrabold tracking-tight">
            <span className="text-2xl mt-1 opacity-50">$</span>
            {/* Y AQUÍ TAMBIÉN */}
            <span suppressHydrationWarning>
                {suggestedPrice.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
            </span>
        </div>
      </div>

    </div>
  );
}