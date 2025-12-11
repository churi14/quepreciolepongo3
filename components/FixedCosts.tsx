"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Trash2 } from "lucide-react";

interface Props {
  onCostChange: (costPerUnit: number) => void;
}

export default function FixedCosts({ onCostChange }: Props) {
  // 1. Lista de Gastos Mensuales (Ahora dinámica)
  const [expenses, setExpenses] = useState([
    { id: 1, name: "Alquiler / Espacio", cost: 0 },
    { id: 2, name: "Luz / Gas / Internet", cost: 0 },
    { id: 3, name: "Monotributo / IIBB", cost: 0 },
    { id: 4, name: "Marketing / Ads", cost: 0 },
  ]);

  // Estados para nuevo gasto
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseCost, setNewExpenseCost] = useState("");

  // 2. Unidades que espera vender al mes
  const [monthlyUnits, setMonthlyUnits] = useState(100); 

  // --- CÁLCULOS ---
  const totalMonthlyFixed = expenses.reduce((sum, item) => sum + item.cost, 0);
  const costPerUnit = monthlyUnits > 0 ? totalMonthlyFixed / monthlyUnits : 0;

  useEffect(() => {
    onCostChange(costPerUnit);
  }, [costPerUnit, onCostChange]);

  // Funciones para editar la lista
  const updateCost = (id: number, newCost: string) => {
    const value = parseFloat(newCost) || 0;
    setExpenses(expenses.map(e => e.id === id ? { ...e, cost: value } : e));
  };

  const addExpense = () => {
    if (!newExpenseName) return;
    setExpenses([
      ...expenses, 
      { id: Date.now(), name: newExpenseName, cost: parseFloat(newExpenseCost) || 0 }
    ]);
    setNewExpenseName("");
    setNewExpenseCost("");
  };

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4" />
          Gastos Fijos Mensuales
        </h3>
        
        {/* LISTA EDITABLE */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {expenses.map((item) => (
            <div key={item.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <span className="text-xs text-slate-600 flex-1 truncate">{item.name}</span>
              <div className="relative w-24">
                <span className="absolute left-2 top-1.5 text-xs text-slate-400">$</span>
                <Input 
                  className="h-8 text-xs pl-5 text-right bg-white" 
                  value={item.cost || ""} 
                  placeholder="0"
                  onChange={(e) => updateCost(item.id, e.target.value)}
                />
              </div>
              {/* Botón borrar (solo para los agregados o todos si querés) */}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => removeExpense(item.id)}>
                 <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* AGREGAR NUEVO GASTO */}
        <div className="mt-4 pt-3 border-t border-purple-200/50 flex gap-2 items-center">
             <Input 
                className="h-8 text-xs bg-white" 
                placeholder="Ej: Flete / Contador..." 
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExpense()}
             />
             <div className="relative w-24">
                <span className="absolute left-2 top-1.5 text-xs text-slate-400">$</span>
                <Input 
                    className="h-8 text-xs pl-5 bg-white" 
                    placeholder="0"
                    value={newExpenseCost}
                    onChange={(e) => setNewExpenseCost(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addExpense()}
                />
             </div>
             <Button size="icon" className="h-8 w-8 bg-purple-600 hover:bg-purple-700" onClick={addExpense}>
                 <Plus className="h-4 w-4" />
             </Button>
        </div>
        
        <div className="mt-3 text-right text-xs font-bold text-purple-700">
            Total Gastos: ${totalMonthlyFixed.toLocaleString()} / mes
        </div>
      </div>

      {/* EL DIVISOR: ¿Cuánto vendés? */}
      <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            ¿Cuántas unidades vendés al mes?
            <span className="text-xs font-normal text-slate-400 ml-1">(Estimado)</span>
          </label>
          <div className="flex items-center gap-3">
            <Input 
                type="number" 
                value={monthlyUnits} 
                onChange={(e) => setMonthlyUnits(parseFloat(e.target.value) || 0)}
                className="text-center font-bold text-lg h-12 bg-white"
            />
            <span className="text-sm text-slate-500 w-full leading-tight">
                Tus gastos de <strong>${totalMonthlyFixed.toLocaleString()}</strong> se dividen entre tus ventas.
            </span>
          </div>
      </div>

      {/* RESULTADO */}
      <div className="flex justify-between items-center bg-white p-3 border rounded-md shadow-sm">
          <span className="text-sm text-slate-600">Impacto por Unidad:</span>
          <span className="font-bold text-purple-600 text-lg" suppressHydrationWarning>
            +${costPerUnit.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
          </span>
      </div>
    </div>
  );
}