"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, User, Users, Utensils, Shirt, Zap, ShoppingBag, HelpCircle, X, Minus, Equal, Divide } from "lucide-react";

// TUS IMPORTACIONES (Verifica las rutas)
import IngredientList, { Ingredient } from "@/components/IngredientList";
import LaborCalculator from "@/components/LaborCalculator";
import TeamLaborCalculator from "@/components/TeamLaborCalculator";
import PriceCalculator from "@/components/PriceCalculator";
import FixedCosts from "@/components/FixedCosts";
import Commercialization from "@/components/Commercialization";
import { generatePDF } from "@/lib/pdfGenerator";
import LeadCaptureModal from "@/components/LeadCaptureModal";

export default function Home() {
  // --- TUS ESTADOS DE DATOS ---
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: "Ej: Harina 000", cost: 1200 },
  ]);
  const [laborCost, setLaborCost] = useState(0);
  const [fixedCostPerUnit, setFixedCostPerUnit] = useState(0);
  const [sellingExpenses, setSellingExpenses] = useState(0); 
  const [finalPrice, setFinalPrice] = useState(0);
  const [profitAmount, setProfitAmount] = useState(0);

  // --- TU ESTADO DEL FLUJO ---
  const [viewState, setViewState] = useState<"welcome" | "profile-type" | "profile-industry" | "calculator">("welcome");
  const [businessType, setBusinessType] = useState(""); 
  const [industry, setIndustry] = useState(""); 
  const [calcStep, setCalcStep] = useState(0);

  // --- TUS FUNCIONES ---
  const addIngredient = (name: string, cost: number) => setIngredients([...ingredients, { id: Date.now(), name, cost }]);
  const removeIngredient = (id: number) => setIngredients(ingredients.filter((item) => item.id !== id));
  
  const totalMaterials = ingredients.reduce((sum, item) => sum + item.cost, 0);
  const productionCost = totalMaterials + laborCost;
  const totalCost = productionCost + fixedCostPerUnit + sellingExpenses;
  
  const formatMoney = (val: number) => val.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  // --- PASOS CALCULADORA ---
  const calculatorSteps = [
    { title: "Materia Prima", subtitle: `Ingredientes y packaging.`, component: <IngredientList ingredients={ingredients} onAdd={addIngredient} onRemove={removeIngredient} /> },
    { title: "Mano de Obra", subtitle: businessType === "team" ? "Nómina y equipo." : "¿Cuánto vale tu tiempo?", component: businessType === "team" ? <TeamLaborCalculator onCostChange={setLaborCost} /> : <LaborCalculator onCostChange={setLaborCost} /> },
    { title: "Costos Fijos", subtitle: "Gastos mensuales.", component: <FixedCosts onCostChange={setFixedCostPerUnit} /> },
    { title: "Canal de Venta", subtitle: "Impuestos y comisiones.", component: <Commercialization productPrice={finalPrice || productionCost * 2} onCostsChange={(selling) => setSellingExpenses(selling)} /> },
    { title: "Precio Final", subtitle: "Definí tu ganancia.", component: <PriceCalculator totalCost={totalCost} onPriceChange={(price, profit) => { setFinalPrice(price); setProfitAmount(profit); }} /> },
  ];

  // --- RENDER CONTENT (Diseño Compacto) ---
  const renderCardContent = () => {
    
    // 2. PERFIL: TIPO DE NEGOCIO
    if (viewState === "profile-type") {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                    ¿Trabajás solo o en equipo?
                </h2>
                <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                    <button onClick={() => { setBusinessType("solo"); setViewState("profile-industry"); }} className="group p-6 border border-slate-200 rounded-2xl hover:border-blue-500 hover:ring-2 hover:ring-blue-50 transition-all flex items-center gap-4 bg-white shadow-sm hover:shadow-md">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-900">Solo / Freelance</h3>
                            <p className="text-sm text-slate-500">Hago todo por mi cuenta.</p>
                        </div>
                    </button>
                    <button onClick={() => { setBusinessType("team"); setViewState("profile-industry"); }} className="group p-6 border border-slate-200 rounded-2xl hover:border-purple-500 hover:ring-2 hover:ring-purple-50 transition-all flex items-center gap-4 bg-white shadow-sm hover:shadow-md">
                        <div className="bg-purple-100 p-3 rounded-xl">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-900">PyME / Equipo</h3>
                            <p className="text-sm text-slate-500">Tengo empleados o socios.</p>
                        </div>
                    </button>
                </div>
                <Button variant="ghost" className="mt-8 text-slate-400 hover:text-slate-600 text-sm" onClick={() => setViewState("welcome")}>← Volver</Button>
            </div>
        );
    }

    // 3. PERFIL: INDUSTRIA
    if (viewState === "profile-industry") {
        const industries = [
            { id: "gastro", label: "Gastronomía", icon: <Utensils className="h-5 w-5"/> },
            { id: "moda", label: "Indumentaria", icon: <Shirt className="h-5 w-5"/> },
            { id: "servicios", label: "Servicios", icon: <Zap className="h-5 w-5"/> },
            { id: "reventa", label: "Reventa", icon: <ShoppingBag className="h-5 w-5"/> },
            { id: "otro", label: "Otro", icon: <HelpCircle className="h-5 w-5"/> },
        ];
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                    ¿Cuál es tu rubro?
                </h2>
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                    {industries.map((ind) => (
                        <button key={ind.id} onClick={() => { setIndustry(ind.label); setViewState("calculator"); }} className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all bg-white group hover:-translate-y-0.5">
                            <div className="text-slate-400 mb-2 group-hover:text-blue-500">{ind.icon}</div>
                            <span className="font-semibold text-sm text-slate-700">{ind.label}</span>
                        </button>
                    ))}
                </div>
                <Button variant="ghost" className="mt-8 text-slate-400 text-sm" onClick={() => setViewState("profile-type")}>← Atrás</Button>
            </div>
        );
    }

    // 4. CALCULADORA (CONTENIDO INTERNO COMPACTO)
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header Wizard Compacto */}
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
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-800 text-sm" onClick={() => calcStep > 0 ? setCalcStep(calcStep - 1) : setViewState("profile-industry")}>
                    <ChevronLeft className="mr-1 h-3 w-3" /> Atrás
                </Button>
                
                {calcStep < calculatorSteps.length - 1 && (
                     <Button 
                     size="sm"
                     className="bg-black hover:bg-slate-800 text-white rounded-lg px-6 h-10 text-sm shadow-lg shadow-slate-200 hover:shadow-xl transition-all"
                     onClick={() => setCalcStep(calcStep + 1)}
                 >
                     Siguiente <ChevronRight className="ml-1 h-3 w-3" />
                 </Button>
                )}
            </div>
        </div>
    );
  };

  // --- LAYOUT PRINCIPAL ---

  // 1. HOME SCREEN (TU FAVORITO)
  if (viewState === "welcome") {
    return (
        <div className="min-h-screen w-full bg-zinc-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Lado Izquierdo: Texto */}
                <div className="space-y-8 p-4 md:pl-8">
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                      Dejá de adivinar precios. <br />
                      <span className="text-blue-600">Empezá a ganar plata.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-md leading-relaxed">
                      La herramienta definitiva para PyMEs y Emprendedores. Calculá costos reales, impuestos y comisiones en 5 pasos simples.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button 
                            size="lg" 
                            className="rounded-xl px-8 py-6 text-lg bg-black hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                            onClick={() => setViewState("profile-type")}
                        >
                            Empezar Ahora <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                    <p className="text-xs text-slate-400 font-bold tracking-widest uppercase pt-8">
                        POWERED BY EN RED CONSULTORA
                    </p>
                </div>

                {/* Lado Derecho: Visual Abstracto */}
                <div className="relative flex justify-center lg:justify-end pr-8">
                   <div className="grid grid-cols-2 gap-4 rotate-3 hover:rotate-0 transition-transform duration-700 ease-out p-8 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white/50 shadow-2xl">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg shadow-blue-200">
                        <X size={40} strokeWidth={3} />
                      </div>
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg shadow-indigo-200 mt-8">
                        <Minus size={40} strokeWidth={3} />
                      </div>
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg shadow-indigo-200 -mt-8">
                        <Equal size={40} strokeWidth={3} />
                      </div>
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-400 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg shadow-blue-200">
                        <Divide size={40} strokeWidth={3} />
                      </div>
                   </div>
                </div>
            </div>
        </div>
    );
  }

  // 2. WIZARD SCREEN (VUELVE A SER COMPACTO)
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Contenedor Compacto: max-w-5xl (Antes era 7xl) */}
      {/* Mantiene el estilo flotante pero más 'recogido' */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6 h-[80vh] md:h-[650px]">
          
          {/* TARJETA PRINCIPAL (WIZARD) */}
          <div className="flex-1 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative flex flex-col ring-1 ring-black/5">
               {renderCardContent()}
          </div>

          {/* TARJETA TICKET (LATERAL PERO COMPACTA) */}
          {/* Solo se muestra en el paso de calculadora */}
          {viewState === "calculator" && (
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
                
                {/* Footer del Ticket */}
                <div className="p-4 bg-slate-900 text-white mt-auto text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sugerido</span>
                    <div className="text-2xl font-black my-1">{formatMoney(finalPrice)}</div>
                    <LeadCaptureModal onSuccess={(u) => generatePDF({ ingredients, laborCost, fixedCost: fixedCostPerUnit, totalCost, profit: profitAmount, finalPrice, productName: u.name })} triggerButton={<Button className="w-full mt-2 bg-white text-black hover:bg-slate-200 font-bold rounded-lg h-9 text-xs">Descargar PDF</Button>} />
                </div>
            </div>
          )}
      </div>

       {/* Botón de Salir Flotante (Abajo) */}
       <button onClick={() => setViewState("welcome")} className="mt-6 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors">
            Salir de la calculadora
       </button>

    </div>
  );
}