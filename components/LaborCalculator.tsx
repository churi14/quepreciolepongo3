"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // Asegurate de tenerlo instalado
import { Label } from "@/components/ui/label";
import { Clock, Wallet, Info } from "lucide-react";

interface Props {
  onCostChange: (cost: number) => void;
}

export default function LaborCalculator({ onCostChange }: Props) {
  // --- ESTADO: ¿Calculamos mano de obra? ---
  // Por defecto activo, pero el usuario puede apagarlo si es reventa pura
  const [isActive, setIsActive] = useState(true);

  // Configuración General
  const [monthlySalary, setMonthlySalary] = useState(500000); 
  const [hoursPerDay, setHoursPerDay] = useState(6);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  // Tiempo por producto
  const [productionTimeMinutes, setProductionTimeMinutes] = useState(30);

  // CÁLCULOS
  const monthlyHours = hoursPerDay * daysPerWeek * 4.2;
  const hourlyRate = monthlyHours > 0 ? monthlySalary / monthlyHours : 0;
  
  // Si está desactivado, el costo es 0
  const laborCostPerUnit = isActive ? (hourlyRate / 60) * productionTimeMinutes : 0;

  useEffect(() => {
    onCostChange(laborCostPerUnit);
  }, [laborCostPerUnit, onCostChange, isActive]);

  return (
    <div className="space-y-6">
      
      {/* HEADER CON SWITCH DE ACTIVACIÓN */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
        <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-500" />
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700">Calcular tiempo de trabajo</span>
                <span className="text-xs text-slate-400">Desactivalo si solo revendés y no manipulás el producto.</span>
            </div>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {/* CONTENIDO (Solo visible si está activo) */}
      {isActive ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {/* SECCIÓN A: Calcular valor hora */}
            <div className="bg-white p-4 rounded-lg border border-slate-100 space-y-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-500" />
                A. Tu Valor Hora
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Sueldo Mensual Deseado</label>
                    <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400">$</span>
                    <Input 
                        type="number" 
                        className="pl-6 bg-slate-50"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(parseFloat(e.target.value) || 0)}
                    />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Horas Mensuales de Trabajo</label>
                    <div className="flex gap-2">
                    <div className="flex-1">
                        <Input 
                            type="number" 
                            className="bg-slate-50"
                            value={hoursPerDay}
                            onChange={(e) => setHoursPerDay(parseFloat(e.target.value) || 0)}
                            placeholder="Hs/día"
                        />
                        <span className="text-[10px] text-slate-400">Horas por día</span>
                    </div>
                    <div className="flex-1">
                        <Input 
                            type="number" 
                            className="bg-slate-50"
                            value={daysPerWeek}
                            onChange={(e) => setDaysPerWeek(parseFloat(e.target.value) || 0)}
                            placeholder="Días/sem"
                        />
                        <span className="text-[10px] text-slate-400">Días por semana</span>
                    </div>
                    </div>
                </div>
                </div>

                <div className="text-right text-xs text-blue-600 font-medium bg-blue-50 p-2 rounded">
                Tu hora vale: 
                <span suppressHydrationWarning className="font-bold ml-1">
                    ${hourlyRate.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-slate-400 ml-1">({Math.round(monthlyHours)} hs/mes)</span>
                </div>
            </div>

            {/* SECCIÓN B: Tiempo de Producción */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                B. Tiempo dedicado a este producto
                </h3>

                <div className="flex items-center gap-4 bg-white p-3 rounded border border-slate-100">
                    <Input 
                        type="number" 
                        className="w-24 font-bold text-center bg-slate-50"
                        value={productionTimeMinutes}
                        onChange={(e) => setProductionTimeMinutes(parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-sm text-slate-600">Minutos</span>
                    
                    <input 
                        type="range" 
                        min="1" 
                        max="300" 
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        value={productionTimeMinutes}
                        onChange={(e) => setProductionTimeMinutes(parseFloat(e.target.value))}
                    />
                </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center text-sm shadow-md">
                <span>Costo de Tiempo por Unidad:</span>
                <span suppressHydrationWarning className="font-bold text-lg">
                    ${laborCostPerUnit.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                </span>
            </div>
        </div>
      ) : (
        // MENSAJE CUANDO ESTÁ DESACTIVADO
        <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center">
             <p className="text-slate-400 mb-2">Mano de obra desactivada.</p>
             <p className="text-sm text-slate-500">
                El costo de tiempo será <strong>$0</strong> para este cálculo.
             </p>
        </div>
      )}

    </div>
  );
}