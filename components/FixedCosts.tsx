"use client";

import { useState, useEffect } from "react";
import { Zap, Building, AlertTriangle } from "lucide-react";

interface FixedCostsProps {
  onCostChange: (costPerUnit: number) => void;
}

export default function FixedCosts({ onCostChange }: FixedCostsProps) {
  const [totalFixedMonthly, setTotalFixedMonthly] = useState(0);
  const [estimatedUnits, setEstimatedUnits] = useState(100); // Default para evitar división por 0

  useEffect(() => {
    // Calculamos cuánto "pesa" el costo fijo en cada unidad vendida
    if (estimatedUnits > 0) {
      const costPerUnit = totalFixedMonthly / estimatedUnits;
      onCostChange(costPerUnit);
    } else {
      onCostChange(0);
    }
  }, [totalFixedMonthly, estimatedUnits, onCostChange]);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      
      {/* Explicación Educativa (La nueva lógica de Mercado) */}
      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
        <div className="space-y-1">
            <p className="text-xs font-bold text-yellow-800">Cambio de Mentalidad:</p>
            <p className="text-xs text-yellow-700 leading-relaxed">
            Los gastos fijos (Alquiler, Luz) son <strong>Gastos de Estructura</strong>, no costos del producto. 
            El objetivo no es subir el precio para pagarlos, sino <strong>vender suficiente cantidad</strong> para diluirlos.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Gastos Totales */}
        <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Gastos Fijos Mensuales ($ Total)
            </label>
            <div className="relative">
                <Building className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input 
                    type="number" 
                    placeholder="Ej: 500000"
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                    onChange={(e) => setTotalFixedMonthly(Number(e.target.value))}
                />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Sumá alquiler, servicios, sueldos fijos, etc.</p>
        </div>

        {/* 2. Ventas Estimadas */}
        <div>
            <label className="block text-xs font-bold text-blue-700 uppercase mb-2">
                ¿Cuántas unidades vendés por mes?
            </label>
            <div className="relative">
                <Zap className="absolute left-3 top-3 h-5 w-5 text-blue-400" />
                <input 
                    type="number" 
                    value={estimatedUnits}
                    className="w-full pl-10 p-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-900"
                    onChange={(e) => setEstimatedUnits(Number(e.target.value))}
                />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">A mayor volumen de venta, menos le "pesa" el alquiler a cada producto.</p>
        </div>
      </div>

      {/* Resultado en Tiempo Real */}
      <div className="p-4 bg-slate-900 rounded-xl text-white flex justify-between items-center shadow-lg">
          <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Impacto por Unidad</p>
              <p className="text-[10px] text-slate-500">Lo que necesitás cubrir con cada venta.</p>
          </div>
          <div className="text-right">
              <span className="text-2xl font-black">
                ${estimatedUnits > 0 ? (totalFixedMonthly / estimatedUnits).toLocaleString('es-AR', {maximumFractionDigits: 0}) : 0}
              </span>
          </div>
      </div>

    </div>
  );
}