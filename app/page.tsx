"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, User, Users, Utensils, Shirt, Zap, ShoppingBag, HelpCircle } from "lucide-react";

// Componentes Lógicos
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

  // --- ESTADO DEL FLUJO ---
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

  // --- PASOS CALCULADORA ---
  const calculatorSteps = [
    { title: "Materia Prima", subtitle: `Ingredientes, Cajas, Bolsas y todo lo que conforma el producto.`, component: <IngredientList ingredients={ingredients} onAdd={addIngredient} onRemove={removeIngredient} /> },
    { title: "Mano de Obra", subtitle: businessType === "team" ? "Gestión de nómina y equipo." : "¿Cuánto vale tu tiempo?", component: businessType === "team" ? <TeamLaborCalculator onCostChange={setLaborCost} /> : <LaborCalculator onCostChange={setLaborCost} /> },
    { title: "Costos Fijos", subtitle: "Alquiler, luz, internet y otros gastos mensuales.", component: <FixedCosts onCostChange={setFixedCostPerUnit} /> },
    { title: "Canal de Venta", subtitle: "Comisiones de MercadoLibre, Pasarelas e Impuestos.", component: <Commercialization productPrice={finalPrice || productionCost * 2} onCostsChange={(selling) => setSellingExpenses(selling)} /> },
    { title: "Precio Final", subtitle: "El momento de la verdad. Definí tu ganancia.", component: <PriceCalculator totalCost={totalCost} onPriceChange={(price, profit) => { setFinalPrice(price); setProfitAmount(profit); }} /> },
  ];

  // --- RENDER CONTENT (CONTENIDO DE LA TARJETA) ---
  const renderCardContent = () => {
    
    // 2. PERFIL: TIPO DE NEGOCIO
    if (viewState === "profile-type") {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-slate-800 mb-10 text-center">
                    ¿Trabajás solo o en equipo?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                    <button onClick={() => { setBusinessType("solo"); setViewState("profile-industry"); }} className="group p-8 border-2 border-slate-100 rounded-3xl hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left bg-white shadow-sm hover:shadow-md">
                        <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <User className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Solo / Freelance</h3>
                        <p className="text-slate-500 mt-2">Hago todo por mi cuenta.</p>
                    </button>
                    <button onClick={() => { setBusinessType("team"); setViewState("profile-industry"); }} className="group p-8 border-2 border-slate-100 rounded-3xl hover:border-purple-500 hover:bg-purple-50/30 transition-all text-left bg-white shadow-sm hover:shadow-md">
                        <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">PyME / Equipo</h3>
                        <p className="text-slate-500 mt-2">Tengo empleados o socios.</p>
                    </button>
                </div>
                <Button variant="ghost" className="mt-12 text-slate-400" onClick={() => setViewState("welcome")}>Atrás</Button>
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
                        <button key={ind.id} onClick={() => { setIndustry(ind.label); setViewState("calculator"); }} className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all bg-white group">
                            <div className="text-slate-400 mb-3 group-hover:text-blue-500">{ind.icon}</div>
                            <span className="font-semibold text-slate-700">{ind.label}</span>
                        </button>
                    ))}
                </div>
                <Button variant="ghost" className="mt-12 text-slate-400" onClick={() => setViewState("profile-type")}>Atrás</Button>
            </div>
        );
    }

    // 4. CALCULADORA
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header Interno del Wizard (Pasos) */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">PASO {calcStep + 1}</span>
                    <span className="text-xs text-slate-400">de {calculatorSteps.length}</span>
                </div>
                <div className="flex gap-1">
                    {calculatorSteps.map((_, i) => (
                        <div key={i} className={`h-1.5 w-8 rounded-full ${i <= calcStep ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{calculatorSteps[calcStep].title}</h2>
                        <p className="text-lg text-slate-500">{calculatorSteps[calcStep].subtitle}</p>
                    </div>
                    <div className="py-2">
                        {calculatorSteps[calcStep].component}
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-between bg-white rounded-b-[2rem]">
                <Button variant="ghost" onClick={() => calcStep > 0 ? setCalcStep(calcStep - 1) : setViewState("profile-industry")}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> Atrás
                </Button>
                <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all"
                    onClick={() => calcStep < calculatorSteps.length - 1 && setCalcStep(calcStep + 1)}
                    style={{ display: calcStep === calculatorSteps.length - 1 ? 'none' : 'flex' }}
                >
                    Siguiente <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
  };

  // --- LAYOUT PRINCIPAL ---

  // 1. HOME SCREEN (Diseño Único Centrado)
  if (viewState === "welcome") {
    return (
        // Contenedor Flex Columna que ocupa toda la pantalla (100vh)
        <div className="h-screen w-full bg-white flex flex-col justify-between">
            
            {/* Espacio vacío arriba para equilibrar */}
            <div className="h-20"></div>

            {/* CONTENIDO CENTRAL (Perfectamente centrado) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
                {/* LOGO PRINCIPAL */}
                <div className="mb-10 animate-in zoom-in duration-700">
                    <img 
                        src="/logo.png" 
                        alt="Que Precio Le Pongo" 
                        className="h-24 md:h-32 w-auto object-contain mx-auto" 
                    />
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                    Dejá de adivinar precios.<br/>
                    <span className="text-blue-600">Empezá a ganar plata.</span>
                </h1>
                
                <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                    La herramienta definitiva para PyMEs y Emprendedores. Calculá costos reales, impuestos y comisiones en 5 pasos simples.
                </p>
                
                <Button 
                    size="lg" 
                    className="rounded-full px-12 py-8 text-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl hover:shadow-blue-200 transition-all hover:-translate-y-1 font-bold"
                    onClick={() => setViewState("profile-type")}
                >
                    Empezar Ahora <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
            </div>

            {/* FOOTER PEGADO AL PISO */}
            <div className="p-8 text-center bg-white">
                <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">
                    POWERED BY <span className="text-slate-600">EN RED CONSULTORA</span>
                </p>
            </div>
        </div>
    );
  }

  // 2. WIZARD SCREEN (Pasos Siguientes)
  return (
    // Estructura: Header Fijo Arriba - Contenido Centrado - Footer Fijo Abajo
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* HEADER GLOBAL (Logo chico a la izquierda) */}
      <header className="w-full bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
          {/* Botón de salida opcional */}
          <Button variant="ghost" className="text-slate-400 text-xs" onClick={() => setViewState("welcome")}>Salir</Button>
      </header>

      {/* AREA PRINCIPAL (Donde flota la tarjeta) */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          
          <div className={`w-full max-w-6xl flex flex-col md:flex-row gap-8 ${viewState === 'calculator' ? 'h-[85vh] md:h-[800px]' : 'h-auto'}`}>
            
            {/* TARJETA BLANCA (FLOTANTE) */}
            <div className="flex-1 bg-white rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col ring-1 ring-slate-900/5">
                {renderCardContent()}
            </div>

            {/* TICKET LATERAL (Solo visible en calculadora) */}
            {viewState === "calculator" && (
                <div className="hidden md:flex w-80 bg-white rounded-[2rem] shadow-2xl flex-col h-full animate-in slide-in-from-right duration-700 ring-1 ring-slate-900/5 overflow-hidden">
                    <div className="bg-slate-50 p-6 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Tu Ticket en vivo
                        </h3>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto bg-white">
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Materiales</span>
                                <span className="font-medium text-slate-900" suppressHydrationWarning>{formatMoney(totalMaterials)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Mano de Obra</span>
                                <span className="font-medium text-slate-900" suppressHydrationWarning>{formatMoney(laborCost)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Fijos</span>
                                <span className="font-medium text-slate-900" suppressHydrationWarning>{formatMoney(fixedCostPerUnit)}</span>
                            </div>
                            {sellingExpenses > 0 && (
                                <div className="flex justify-between items-center bg-indigo-50 p-2 rounded text-indigo-700">
                                    <span className="font-medium">Costo Venta</span>
                                    <span className="font-bold" suppressHydrationWarning>{formatMoney(sellingExpenses)}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-200 my-4"></div>
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-slate-700">TOTAL</span>
                                <span className="font-extrabold text-xl text-slate-900" suppressHydrationWarning>{formatMoney(totalCost)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Sugerido</span>
                        <div className="text-3xl font-black text-slate-900 my-1" suppressHydrationWarning>{formatMoney(finalPrice)}</div>
                        <LeadCaptureModal onSuccess={(u) => generatePDF({ ingredients, laborCost, fixedCost: fixedCostPerUnit, totalCost, profit: profitAmount, finalPrice, productName: u.name })} triggerButton={<Button className="w-full mt-2 bg-slate-900 text-white font-bold rounded-xl shadow-lg">Descargar</Button>} />
                    </div>
                </div>
            )}

          </div>
      </main>

      {/* FOOTER GLOBAL */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 text-center">
          <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">
              POWERED BY <span className="text-slate-600">EN RED CONSULTORA</span>
          </p>
      </footer>

    </div>
  );
}