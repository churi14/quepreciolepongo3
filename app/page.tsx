"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, User, Users, Utensils, Shirt, Zap, ShoppingBag, HelpCircle, X, Minus, Equal, Divide } from "lucide-react";

// TUS IMPORTACIONES (Asegúrate de que las rutas sean correctas)
import IngredientList, { Ingredient } from "@/components/IngredientList";
import LaborCalculator from "@/components/LaborCalculator";
import TeamLaborCalculator from "@/components/TeamLaborCalculator";
import PriceCalculator from "@/components/PriceCalculator";
import FixedCosts from "@/components/FixedCosts";
import Commercialization from "@/components/Commercialization";
import { generatePDF } from "@/lib/pdfGenerator";
import LeadCaptureModal from "@/components/LeadCaptureModal";

export default function Home() {
  // --- TUS ESTADOS DE DATOS (INTACTOS) ---
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: "Ej: Harina 000", cost: 1200 },
  ]);
  const [laborCost, setLaborCost] = useState(0);
  const [fixedCostPerUnit, setFixedCostPerUnit] = useState(0);
  const [sellingExpenses, setSellingExpenses] = useState(0); 
  const [finalPrice, setFinalPrice] = useState(0);
  const [profitAmount, setProfitAmount] = useState(0);

  // --- TU ESTADO DEL FLUJO (INTACTO) ---
  const [viewState, setViewState] = useState<"welcome" | "profile-type" | "profile-industry" | "calculator">("welcome");
  const [businessType, setBusinessType] = useState(""); 
  const [industry, setIndustry] = useState(""); 
  const [calcStep, setCalcStep] = useState(0);

  // --- TUS FUNCIONES (INTACTAS) ---
  const addIngredient = (name: string, cost: number) => setIngredients([...ingredients, { id: Date.now(), name, cost }]);
  const removeIngredient = (id: number) => setIngredients(ingredients.filter((item) => item.id !== id));
  
  const totalMaterials = ingredients.reduce((sum, item) => sum + item.cost, 0);
  const productionCost = totalMaterials + laborCost;
  const totalCost = productionCost + fixedCostPerUnit + sellingExpenses;
  
  const formatMoney = (val: number) => val.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  // --- PASOS CALCULADORA ---
  const calculatorSteps = [
    { title: "Materia Prima", subtitle: `Ingredientes, Cajas, Bolsas y todo lo que conforma el producto.`, component: <IngredientList ingredients={ingredients} onAdd={addIngredient} onRemove={removeIngredient} /> },
    { title: "Mano de Obra", subtitle: businessType === "team" ? "Gestión de nómina y equipo." : "¿Cuánto vale tu tiempo?", component: businessType === "team" ? <TeamLaborCalculator onCostChange={setLaborCost} /> : <LaborCalculator onCostChange={setLaborCost} /> },
    { title: "Costos Fijos", subtitle: "Alquiler, luz, internet y otros gastos mensuales.", component: <FixedCosts onCostChange={setFixedCostPerUnit} /> },
    { title: "Canal de Venta", subtitle: "Comisiones de MercadoLibre, Pasarelas e Impuestos.", component: <Commercialization productPrice={finalPrice || productionCost * 2} onCostsChange={(selling) => setSellingExpenses(selling)} /> },
    { title: "Precio Final", subtitle: "El momento de la verdad. Definí tu ganancia.", component: <PriceCalculator totalCost={totalCost} onPriceChange={(price, profit) => { setFinalPrice(price); setProfitAmount(profit); }} /> },
  ];

  // --- RENDER CONTENT (Mejorado visualmente) ---
  const renderCardContent = () => {
    
    // 2. PERFIL: TIPO DE NEGOCIO
    if (viewState === "profile-type") {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-slate-800 mb-10 text-center">
                    ¿Trabajás solo o en equipo?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                    <button onClick={() => { setBusinessType("solo"); setViewState("profile-industry"); }} className="group p-8 border border-slate-200 rounded-3xl hover:border-blue-500 hover:ring-4 hover:ring-blue-50 transition-all text-left bg-white shadow-sm hover:shadow-xl">
                        <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <User className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Solo / Freelance</h3>
                        <p className="text-slate-500 mt-2">Hago todo por mi cuenta.</p>
                    </button>
                    <button onClick={() => { setBusinessType("team"); setViewState("profile-industry"); }} className="group p-8 border border-slate-200 rounded-3xl hover:border-purple-500 hover:ring-4 hover:ring-purple-50 transition-all text-left bg-white shadow-sm hover:shadow-xl">
                        <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">PyME / Equipo</h3>
                        <p className="text-slate-500 mt-2">Tengo empleados o socios.</p>
                    </button>
                </div>
                <Button variant="ghost" className="mt-12 text-slate-400 hover:text-slate-600" onClick={() => setViewState("welcome")}>← Volver al inicio</Button>
            </div>
        );
    }

    // 3. PERFIL: INDUSTRIA
    if (viewState === "profile-industry") {
        const industries = [
            { id: "gastro", label: "Gastronomía", icon: <Utensils className="h-6 w-6"/> },
            { id: "moda", label: "Indumentaria", icon: <Shirt className="h-6 w-6"/> },
            { id: "servicios", label: "Servicios", icon: <Zap className="h-6 w-6"/> },
            { id: "reventa", label: "Reventa", icon: <ShoppingBag className="h-6 w-6"/> },
            { id: "otro", label: "Otro", icon: <HelpCircle className="h-6 w-6"/> },
        ];
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-slate-800 mb-10 text-center">
                    ¿Cuál es tu rubro?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                    {industries.map((ind) => (
                        <button key={ind.id} onClick={() => { setIndustry(ind.label); setViewState("calculator"); }} className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all bg-white group hover:-translate-y-1">
                            <div className="text-slate-400 mb-3 group-hover:text-blue-500">{ind.icon}</div>
                            <span className="font-semibold text-slate-700">{ind.label}</span>
                        </button>
                    ))}
                </div>
                <Button variant="ghost" className="mt-12 text-slate-400" onClick={() => setViewState("profile-type")}>← Atrás</Button>
            </div>
        );
    }

    // 4. CALCULADORA (CONTENIDO INTERNO)
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header Interno del Wizard */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-white bg-black px-2 py-1 rounded-md uppercase tracking-wider">PASO {calcStep + 1}</span>
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-widest hidden sm:block">{calculatorSteps[calcStep].title}</span>
                </div>
                <div className="flex gap-1.5">
                    {calculatorSteps.map((_, i) => (
                        <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i <= calcStep ? 'bg-black w-8' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="text-center md:text-left mb-8">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">{calculatorSteps[calcStep].title}</h2>
                        <p className="text-lg text-slate-500 font-medium">{calculatorSteps[calcStep].subtitle}</p>
                    </div>
                    <div className="py-2">
                        {calculatorSteps[calcStep].component}
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-between bg-white items-center">
                <Button variant="ghost" className="text-slate-400 hover:text-slate-800" onClick={() => calcStep > 0 ? setCalcStep(calcStep - 1) : setViewState("profile-industry")}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> Atrás
                </Button>
                
                {/* Botón Siguiente con diseño Premium */}
                {calcStep < calculatorSteps.length - 1 && (
                     <Button 
                     className="bg-black hover:bg-slate-800 text-white rounded-xl px-8 h-12 text-base shadow-xl shadow-slate-200 hover:shadow-2xl transition-all transform hover:-translate-y-1"
                     onClick={() => setCalcStep(calcStep + 1)}
                 >
                     Siguiente <ChevronRight className="ml-1 h-4 w-4" />
                 </Button>
                )}
            </div>
        </div>
    );
  };

  // --- LAYOUT PRINCIPAL (AQUÍ ESTÁ LA MAGIA) ---

  // 1. HOME SCREEN (Diseño Limpio, Pantalla completa pero con el estilo de fondo)
  if (viewState === "welcome") {
    return (
        <div className="min-h-screen w-full bg-zinc-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Lado Izquierdo: Texto */}
                <div className="space-y-8 p-4 md:pl-8">
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                      Dejá de adivinar precios. <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Empezá a ganar plata.</span>
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

                {/* Lado Derecho: Visual Abstracto (Tus íconos reconstruidos) */}
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

  // 2. WIZARD SCREEN (LA FLOATING UI QUE QUERÍAS)
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* HEADER FLOTANTE PEQUEÑO */}
      <header className="flex justify-between items-center mb-6 max-w-7xl mx-auto w-full px-2">
         <div className="flex items-center gap-2">
             {/* Aquí podrías poner un logo pequeño SVG */}
             <span className="font-bold text-lg tracking-tight">Que precio le pongo</span>
         </div>
         <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-500 hover:bg-red-50" onClick={() => setViewState("welcome")}>Salir</Button>
      </header>

      {/* CONTENEDOR PRINCIPAL: FLOTA EN EL MEDIO */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex gap-6 h-[85vh]">
          
          {/* TARJETA IZQUIERDA: EL CONTENIDO PRINCIPAL (Ocupa más espacio) */}
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative flex flex-col">
               {renderCardContent()}
          </div>

          {/* TARJETA DERECHA: EL TICKET (Solo visible en calculadora y pantallas grandes) */}
          {viewState === "calculator" && (
            <div className="hidden lg:flex w-80 xl:w-96 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex-col overflow-hidden border border-slate-100 animate-in slide-in-from-right-4 duration-700">
                <div className="bg-slate-50 p-6 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        En tiempo real
                    </h3>
                </div>
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-500 text-sm">Materiales</span>
                            <span className="font-semibold text-slate-900">{formatMoney(totalMaterials)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-500 text-sm">Mano de Obra</span>
                            <span className="font-semibold text-slate-900">{formatMoney(laborCost)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-500 text-sm">Fijos</span>
                            <span className="font-semibold text-slate-900">{formatMoney(fixedCostPerUnit)}</span>
                        </div>
                        {sellingExpenses > 0 && (
                            <div className="flex justify-between items-center p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700">
                                <span className="font-medium text-sm">Comisiones</span>
                                <span className="font-bold">{formatMoney(sellingExpenses)}</span>
                            </div>
                        )}
                        
                        <div className="border-t border-dashed border-slate-200 my-4"></div>
                        
                        <div className="flex justify-between items-end">
                            <span className="font-bold text-slate-400 text-sm uppercase">Costo Total</span>
                            <span className="font-extrabold text-2xl text-slate-900">{formatMoney(totalCost)}</span>
                        </div>
                    </div>
                </div>
                
                {/* Sugerido Footer del Ticket */}
                <div className="p-6 bg-slate-900 text-white mt-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio Sugerido</span>
                    <div className="text-3xl font-black my-1">{formatMoney(finalPrice)}</div>
                    <LeadCaptureModal onSuccess={(u) => generatePDF({ ingredients, laborCost, fixedCost: fixedCostPerUnit, totalCost, profit: profitAmount, finalPrice, productName: u.name })} triggerButton={<Button className="w-full mt-4 bg-white text-black hover:bg-slate-200 font-bold rounded-xl h-12">Descargar PDF</Button>} />
                </div>
            </div>
          )}
      </main>

    </div>
  );
}