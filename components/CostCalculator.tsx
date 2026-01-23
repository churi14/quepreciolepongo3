"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Importaciones de tus componentes lógicos
import IngredientList, { Ingredient } from "@/components/IngredientList";
import LaborCalculator from "@/components/LaborCalculator";
import TeamLaborCalculator from "@/components/TeamLaborCalculator";
import PriceCalculator from "@/components/PriceCalculator";
import FixedCosts from "@/components/FixedCosts";
import Commercialization from "@/components/Commercialization";
import { generatePDF } from "@/lib/pdfGenerator";
import LeadCaptureModal from "@/components/LeadCaptureModal";

interface CostCalculatorProps {
  businessType: string;
  industry: string;
  onBack: () => void;
}

export default function CostCalculator({ businessType, industry, onBack }: CostCalculatorProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: "Ej: Harina 000", cost: 1200 },
  ]);
  const [laborCost, setLaborCost] = useState(0);
  const [fixedCostPerUnit, setFixedCostPerUnit] = useState(0);
  const [sellingExpenses, setSellingExpenses] = useState(0); 
  const [finalPrice, setFinalPrice] = useState(0);
  const [profitAmount, setProfitAmount] = useState(0);
  const [calcStep, setCalcStep] = useState(0);

  const addIngredient = (name: string, cost: number) => setIngredients([...ingredients, { id: Date.now(), name, cost }]);
  const removeIngredient = (id: number) => setIngredients(ingredients.filter((item) => item.id !== id));
  
  const totalMaterials = ingredients.reduce((sum, item) => sum + item.cost, 0);
  const productionCost = totalMaterials + laborCost;
  const totalCost = productionCost + fixedCostPerUnit + sellingExpenses;
  
  const formatMoney = (val: number) => val.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  const calculatorSteps = [
    { title: "Materia Prima", subtitle: `Ingredientes y packaging.`, component: <IngredientList ingredients={ingredients} onAdd={addIngredient} onRemove={removeIngredient} /> },
    { title: "Mano de Obra", subtitle: businessType === "team" ? "Nómina y equipo." : "¿Cuánto vale tu tiempo?", component: businessType === "team" ? <TeamLaborCalculator onCostChange={setLaborCost} /> : <LaborCalculator onCostChange={setLaborCost} /> },
    { title: "Costos Fijos", subtitle: "Gastos mensuales.", component: <FixedCosts onCostChange={setFixedCostPerUnit} /> },
    { title: "Canal de Venta", subtitle: "Impuestos y comisiones.", component: <Commercialization productPrice={finalPrice || productionCost * 2} onCostsChange={(selling) => setSellingExpenses(selling)} /> },
    { title: "Precio Final", subtitle: "Definí tu ganancia.", component: <PriceCalculator totalCost={totalCost} onPriceChange={(price, profit) => { setFinalPrice(price); setProfitAmount(profit); }} /> },
  ];

  // --- VALIDACIÓN PARA AVANZAR ---
  const isNextDisabled = () => {
    // Si estamos en el paso 2 (Costos Fijos), obligamos a que el costo sea mayor a 0
    if (calcStep === 2 && fixedCostPerUnit <= 0) {
        return true; // Bloqueado
    }
    return false; // Habilitado
  };

  return (
    <>
      {/* TARJETA PRINCIPAL (WIZARD) */}
      <div className="flex-1 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative flex flex-col ring-1 ring-black/5">
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-white bg-black px-2 py-1 rounded-full uppercase tracking-wider">PASO {calcStep + 1}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">{calculatorSteps[calcStep].title}</span>
                </div>
                <div className="flex gap-1">
                    {calculatorSteps.map((_, i) => (
                        <div key={i} className={`h-1 w-4 rounded-full transition-all duration-300 ${i <= calcStep ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{calculatorSteps[calcStep].title}</h2>
                        <p className="text-sm text-slate-500 font-medium">{calculatorSteps[calcStep].subtitle}</p>
                    </div>
                    <div>
                        {calculatorSteps[calcStep].component}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-between bg-white items-center rounded-b-[2rem]">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-800 text-sm" onClick={() => calcStep > 0 ? setCalcStep(calcStep - 1) : onBack()}>
                    <ChevronLeft className="mr-1 h-3 w-3" /> Atrás
                </Button>
                
                {calcStep < calculatorSteps.length - 1 && (
                     <Button 
                     size="sm"
                     disabled={isNextDisabled()} // <--- AQUÍ ESTÁ EL BLOQUEO
                     className="bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg px-6 h-10 text-sm shadow-lg shadow-slate-200 hover:shadow-xl transition-all"
                     onClick={() => setCalcStep(calcStep + 1)}
                 >
                     Siguiente <ChevronRight className="ml-1 h-3 w-3" />
                 </Button>
                )}
            </div>
        </div>
      </div>

      {/* TARJETA TICKET (LATERAL) */}
      <div className="hidden lg:flex w-72 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 flex-col overflow-hidden border border-slate-100 ring-1 ring-black/5 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-slate-50 p-4 border-b border-slate-100">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    En tiempo real
                </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Materiales</span>
                        <span className="font-semibold text-slate-900">{formatMoney(totalMaterials)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Mano de Obra</span>
                        <span className="font-semibold text-slate-900">{formatMoney(laborCost)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Fijos</span>
                        <span className="font-semibold text-slate-900">{formatMoney(fixedCostPerUnit)}</span>
                    </div>
                    {sellingExpenses > 0 && (
                        <div className="flex justify-between items-center p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 text-xs">
                            <span className="font-medium">Comisiones</span>
                            <span className="font-bold">{formatMoney(sellingExpenses)}</span>
                        </div>
                    )}
                    <div className="border-t border-dashed border-slate-200 my-2"></div>
                    <div className="flex justify-between items-end">
                        <span className="font-bold text-slate-400 text-[10px] uppercase">Total Costo</span>
                        <span className="font-extrabold text-sm text-slate-900">{formatMoney(totalCost)}</span>
                    </div>
            </div>
            
            <div className="p-4 bg-slate-900 text-white mt-auto text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sugerido</span>
                <div className="text-2xl font-black my-1">{formatMoney(finalPrice)}</div>
                <LeadCaptureModal onSuccess={(u) => generatePDF({ ingredients, laborCost, fixedCost: fixedCostPerUnit, totalCost, profit: profitAmount, finalPrice, productName: u.name })} triggerButton={<Button className="w-full mt-2 bg-white text-black hover:bg-slate-200 font-bold rounded-lg h-9 text-xs">Descargar PDF</Button>} />
            </div>
        </div>
    </>
  );
}