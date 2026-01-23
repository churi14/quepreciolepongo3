"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

interface PriceCalculatorProps {
  totalCost: number; // Costo Total (Variable + Fijo asignado)
  onPriceChange: (finalPrice: number, profit: number) => void;
}

export default function PriceCalculator({ totalCost, onPriceChange }: PriceCalculatorProps) {
  const [marketPrice, setMarketPrice] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [profitAmount, setProfitAmount] = useState(0);

  // Cuando el usuario cambia el precio de mercado, recalculamos la ganancia
  useEffect(() => {
    const profit = marketPrice - totalCost;
    const margin = marketPrice > 0 ? (profit / marketPrice) * 100 : 0;
    
    setProfitAmount(profit);
    setProfitMargin(margin);
    onPriceChange(marketPrice, profit);
  }, [marketPrice, totalCost, onPriceChange]);

  // Formato moneda
  const f = (n: number) => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      
      {/* Resumen de Costos */}
      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Costo Total Unitario</p>
              <p className="text-[10px] text-slate-400">(Materiales + Mano de Obra + Estructura)</p>
          </div>
          <div className="text-xl font-bold text-slate-900">
              {f(totalCost)}
          </div>
      </div>

      {/* Input: El Mercado Manda */}
      <div>
          <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              ¿A cuánto lo venden tus competidores?
          </label>
          <div className="relative">
              <span className="absolute left-4 top-4 text-slate-400 font-bold">$</span>
              <input 
                  type="number" 
                  className="w-full pl-8 p-4 text-lg font-bold bg-white border-2 border-slate-200 rounded-2xl focus:border-black outline-none transition-all shadow-sm"
                  placeholder="Ej: 1500"
                  onChange={(e) => setMarketPrice(Number(e.target.value))}
              />
          </div>
          <p className="text-xs text-slate-500 mt-2">Poné el precio real de mercado. Nosotros te decimos si es negocio para vos.</p>
      </div>

      {/* Análisis de Rentabilidad */}
      {marketPrice > 0 && (
          <div className={`p-5 rounded-2xl border ${profitAmount > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                  {profitAmount > 0 ? <CheckCircle className="text-green-600 h-6 w-6 mt-1" /> : <AlertCircle className="text-red-600 h-6 w-6 mt-1" />}
                  <div>
                      <h3 className={`font-bold text-lg ${profitAmount > 0 ? 'text-green-800' : 'text-red-800'}`}>
                          {profitAmount > 0 ? '¡Es un precio viable!' : 'Estás perdiendo plata'}
                      </h3>
                      <p className={`text-sm mt-1 leading-relaxed ${profitAmount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {profitAmount > 0 
                            ? `Con este precio de mercado, cubrís todos tus costos y te quedan ${f(profitAmount)} (${profitMargin.toFixed(1)}%) de ganancia limpia por unidad.` 
                            : `¡Cuidado! Tu costo (${f(totalCost)}) es mayor al precio de mercado. O bajás costos, o vendés más cantidad para diluir los fijos.`}
                      </p>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}