"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, User, Users, Utensils, Shirt, Zap, ShoppingBag, HelpCircle } from "lucide-react";

// Componentes Lógicos (Asegurate que existan en tu carpeta components)
import IngredientList, { Ingredient } from "@/components/IngredientList";
import LaborCalculator from "@/components/LaborCalculator";
import TeamLaborCalculator from "@/components/TeamLaborCalculator";
import PriceCalculator from "@/components/PriceCalculator";
import FixedCosts from "@/components/FixedCosts";
import Commercialization from "@/components/Commercialization";
import { generatePDF } from "@/lib/pdfGenerator";
import LeadCaptureModal from "@/components/LeadCaptureModal";

export default function Home() {
  // --- ESTADOS DE DATOS ---
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: "Ej: Harina 000", cost: 1200 },
  ]);
  const [laborCost, setLaborCost] = useState(0);
  const [fixedCostPerUnit, setFixedCostPerUnit] = useState(0);
  const [sellingExpenses, setSellingExpenses] = useState(0); 
  const [finalPrice, setFinalPrice] = useState(0);
  const [profitAmount, setProfitAmount] = useState(0);

  // --- ESTADO DEL FLUJO (WIZARD) ---
  const [viewState, setViewState] = useState<"welcome" | "profile-type" | "profile-industry" | "calculator">("welcome");
  const [businessType, setBusinessType] = useState(""); 
  const [industry, setIndustry] = useState(""); 
  const [calcStep, setCalcStep] = useState(0);

  // --- FUNCIONES ---
  const addIngredient = (name: string, cost: number) => setIngredients([...ingredients, { id: Date.now(), name, cost }]);
  const removeIngredient = (id: number) => setIngredients(ingredients.filter((item) => item.id !== id));
  
  const totalMaterials = ingredients.reduce((sum, item) => sum + item.cost, 0);
  const productionCost = totalMaterials + laborCost;
  const totalCost = productionCost + fixedCostPerUnit + sellingExpenses;
  
  const formatMoney = (val: number) => val.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  // --- DEFINICIÓN DE PASOS ---
  const calculatorSteps = [
    { 
        title: "Materia Prima y Envases", 
        subtitle: `Ingredientes, Cajas, Bolsas y todo lo que conforma el producto.`, 
        component: <IngredientList ingredients={ingredients} onAdd={addIngredient} onRemove={removeIngredient} /> 
    },
    { 
        title: "Mano de Obra", 
        subtitle: businessType === "team" ? "Gestión de nómina y equipo." : "¿Cuánto vale tu tiempo?", 
        component: businessType === "team" 
            ? <TeamLaborCalculator onCostChange={setLaborCost} />
            : <LaborCalculator onCostChange={setLaborCost} /> 
    },
    { 
        title: "Costos Fijos", 
        subtitle: "Alquiler, luz, internet y otros gastos mensuales.", 
        component: <FixedCosts onCostChange={setFixedCostPerUnit} /> 
    },
    { 
        title: "Canal de Venta", 
        subtitle: "Comisiones de MercadoLibre, Pasarelas e Impuestos.", 
        component: <Commercialization productPrice={finalPrice || productionCost * 2} onCostsChange={(selling) => setSellingExpenses(selling)} /> 
    },
    { 
        title: "Precio Final", 
        subtitle: "El momento de la verdad. Definí tu ganancia.", 
        component: <PriceCalculator totalCost={totalCost} onPriceChange={(price, profit) => { setFinalPrice(price); setProfitAmount(profit); }} /> 
    },
  ];

  // --- RENDER CONTENT ---
  const renderContent = () => {
    
    // 1. BIENVENIDA (CON LOGO GRANDE)
    if (viewState === "welcome") {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in-95 duration-500">
                {/* LOGO DE LA EMPRESA */}
                <div className="mb-8">
                    <img src="/logo.png" alt="Logo En Red" className="h-24 w-auto object-contain mx-auto" />
                </div>

                <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Calculadora de Costos
                </h1>
                <p className="text-lg text-slate-500 max-w-md mx-auto mb-8 font-medium">
                    Descubrí tus costos reales, optimizá tus márgenes y poné precios inteligentes en 5 pasos.
                </p>
                <Button 
                    size="lg" 
                    className="rounded-full px-10 py-6 text-lg bg-slate-900 hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                    onClick={() => setViewState("profile-type")}
                >
                    Comenzar Ahora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="mt-6 text-xs text-slate-400">Powered by En Red Consultora</p>
            </div>
        );
    }

    // 2. PERFIL: TIPO
    if (viewState === "profile-type") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center">
                    ¿Trabajás solo o en equipo?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                    <button onClick={() => { setBusinessType("solo"); setViewState("profile-industry"); }} className="group p-6 border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left">
                        <User className="h-8 w-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-slate-900">Solo / Freelance</h3>
                    </button>
                    <button onClick={() => { setBusinessType("team"); setViewState("profile-industry"); }} className="group p-6 border-2 border-slate-100 rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left">
                        <Users className="h-8 w-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-slate-900">PyME / Equipo</h3>
                    </button>
                </div>
                <Button variant="ghost" className="mt-8 text-slate-400" onClick={() => setViewState("welcome")}>Atrás</Button>
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
            <div className="flex flex-col items-center justify-center h-full p-8 animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center">
                    ¿Cuál es tu rubro?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg">
                    {industries.map((ind) => (
                        <button key={ind.id} onClick={() => { setIndustry(ind.label); setViewState("calculator"); }} className="flex flex-col items-center justify-center p-4 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:shadow-md transition-all bg-white">
                            <div className="text-slate-400 mb-2">{ind.icon}</div>
                            <span className="font-medium text-sm text-slate-700">{ind.label}</span>
                        </button>
                    ))}
                </div>
                <Button variant="ghost" className="mt-8 text-slate-400" onClick={() => setViewState("profile-type")}>Atrás</Button>
            </div>
        );
    }

    // 4. CALCULADORA (WIZARD CON HEADER LOGO)
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header del Wizard */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <div className="flex flex-col items-start">
                    {/* LOGO PEQUEÑO EN HEADER */}
                    <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain mb-1 opacity-80" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">PASO {calcStep + 1}</span>
                        <span className="text-xs text-slate-400">de {calculatorSteps.length}</span>
                    </div>
                </div>
                
                <div className="flex gap-1">
                    {calculatorSteps.map((_, i) => (
                        <div key={i} className={`h-1.5 w-6 rounded-full ${i <= calcStep ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-slate-900">{calculatorSteps[calcStep].title}</h2>
                        <p className="text-slate-500">{calculatorSteps[calcStep].subtitle}</p>
                    </div>
                    <div className="bg-white p-1">
                        {calculatorSteps[calcStep].component}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-between bg-white rounded-b-3xl">
                <Button variant="ghost" onClick={() => calcStep > 0 ? setCalcStep(calcStep - 1) : setViewState("profile-industry")}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> Atrás
                </Button>
                <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
                    onClick={() => calcStep < calculatorSteps.length - 1 && setCalcStep(calcStep + 1)}
                    style={{ display: calcStep === calculatorSteps.length - 1 ? 'none' : 'flex' }}
                >
                    Siguiente <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 h-[85vh] md:h-[800px]">
        
        {/* IZQUIERDA: CALCULADORA */}
        <div className="flex-1 bg-white rounded-[2rem] shadow-xl overflow-hidden relative flex flex-col ring-1 ring-slate-900/5">
             {renderContent()}
        </div>

        {/* DERECHA: TICKET */}
        {viewState === "calculator" && (
            <div className="hidden md:flex w-80 bg-white rounded-[2rem] shadow-xl flex-col h-full animate-in slide-in-from-right duration-700 ring-1 ring-slate-900/5 overflow-hidden">
                
                <div className="bg-slate-50 p-6 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Tu Ticket en vivo
                    </h3>
                </div>

                <div className="p-6 flex-1 overflow-y-auto bg-white">
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center group">
                            <span className="text-slate-500 group-hover:text-slate-800 transition-colors">Materiales y Envases</span>
                            <span className="font-medium text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-100" suppressHydrationWarning>
                                {formatMoney(totalMaterials)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-slate-500 group-hover:text-slate-800 transition-colors">Mano de Obra</span>
                            <span className="font-medium text-slate-900" suppressHydrationWarning>{formatMoney(laborCost)}</span>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-slate-500 group-hover:text-slate-800 transition-colors">Costos Fijos</span>
                            <span className="font-medium text-slate-900" suppressHydrationWarning>{formatMoney(fixedCostPerUnit)}</span>
                        </div>

                        {sellingExpenses > 0 && (
                            <div className="flex justify-between items-center bg-indigo-50 p-2 rounded border border-indigo-100">
                                <span className="text-indigo-600 font-medium">Costo de Venta</span>
                                <span className="font-bold text-indigo-700" suppressHydrationWarning>{formatMoney(sellingExpenses)}</span>
                            </div>
                        )}
                        
                        <div className="border-t-2 border-dashed border-slate-100 my-6"></div>
                        
                        <div className="flex justify-between items-end">
                            <span className="font-bold text-slate-700 text-xs uppercase">Costo Total</span>
                            <span className="font-extrabold text-xl text-slate-900" suppressHydrationWarning>{formatMoney(totalCost)}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <div className="text-center mb-5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Precio Sugerido</span>
                        <div className="text-4xl font-black text-slate-900 my-2 tracking-tighter" suppressHydrationWarning>
                            {formatMoney(finalPrice)}
                        </div>
                        {profitAmount > 0 && (
                            <div className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full" suppressHydrationWarning>
                                +{formatMoney(profitAmount)} ganancia
                            </div>
                        )}
                    </div>
                    
                    <LeadCaptureModal 
                        onSuccess={(userData) => {
                            generatePDF({
                                ingredients,
                                laborCost,
                                fixedCost: fixedCostPerUnit,
                                totalCost,
                                profit: profitAmount,
                                finalPrice,
                                productName: userData.name 
                            });
                        }}
                        triggerButton={
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95">
                            Descargar Reporte
                        </Button>
                        }
                    />
                </div>
            </div>
        )}

      </div>
    </div>
  );
}