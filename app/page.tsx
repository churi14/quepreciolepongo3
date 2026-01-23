"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Users, Utensils, Shirt, Zap, ShoppingBag, HelpCircle, Briefcase } from "lucide-react";

// COMPONENTES REFACTORIZADOS
import WelcomeScreen from "@/components/WelcomeScreen";
import EmployeeCalculator from "@/components/EmployeeCalculator";
import CostCalculator from "@/components/CostCalculator";

export default function Home() {
  // --- ESTADO DEL FLUJO (Solo nos quedamos con esto en el archivo principal) ---
  const [viewState, setViewState] = useState<"welcome" | "profile-type" | "profile-industry" | "calculator" | "employee-calculator">("welcome");
  const [businessType, setBusinessType] = useState(""); 
  const [industry, setIndustry] = useState(""); 

  // --- RENDERIZADO ---

  // 1. HOME SCREEN
  if (viewState === "welcome") {
    return (
        <div className="min-h-screen w-full bg-zinc-100 flex items-center justify-center p-4">
            <WelcomeScreen onStart={() => setViewState("profile-type")} />
        </div>
    );
  }

  // 2. VISTAS INTERNAS (HEADER + CONTENIDO + FOOTER)
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
      
      {/* Header Global */}
      <header className="w-full p-6 md:px-10 flex justify-between items-center">
           <img src="/logo.png" alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
           <button onClick={() => setViewState("welcome")} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider">
                Salir
           </button>
      </header>

      {/* Contenedor Principal */}
      <main className="flex-1 flex items-center justify-center p-4">
          <div className={`w-full max-w-5xl flex flex-col md:flex-row gap-6 ${viewState === 'employee-calculator' ? 'h-auto' : 'h-[80vh] md:h-[650px]'}`}>
              
              {/* VISTA A: Perfil (Solo/PyME/Empleado) */}
              {viewState === "profile-type" && (
                <div className="flex-1 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative flex flex-col ring-1 ring-black/5">
                    <div className="flex flex-col h-full items-center justify-center p-8 animate-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">¿Cuál es tu situación actual?</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                            <button onClick={() => { setBusinessType("solo"); setViewState("profile-industry"); }} className="group p-6 border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 transition-all flex items-center gap-4 bg-white shadow-sm hover:shadow-md">
                                <div className="bg-blue-100 p-4 rounded-xl shrink-0"><User className="h-8 w-8 text-blue-600" /></div>
                                <div className="text-left"><h3 className="font-bold text-lg text-slate-900">Solo / Freelance</h3><p className="text-sm text-slate-500">Hago todo por mi cuenta.</p></div>
                            </button>

                            <button onClick={() => { setBusinessType("team"); setViewState("profile-industry"); }} className="group p-6 border border-slate-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50/30 transition-all flex items-center gap-4 bg-white shadow-sm hover:shadow-md">
                                <div className="bg-purple-100 p-4 rounded-xl shrink-0"><Users className="h-8 w-8 text-purple-600" /></div>
                                <div className="text-left"><h3 className="font-bold text-lg text-slate-900">PyME / Equipo</h3><p className="text-sm text-slate-500">Tengo empleados o socios.</p></div>
                            </button>

                            <button onClick={() => setViewState("employee-calculator")} className="group p-6 border-2 border-slate-100 rounded-2xl hover:border-green-500 hover:bg-green-50/30 transition-all flex items-center gap-4 bg-white md:col-span-2 shadow-sm hover:shadow-md">
                                <div className="bg-green-100 p-4 rounded-xl shrink-0 group-hover:scale-110 transition-transform"><Briefcase className="h-8 w-8 text-green-600" /></div>
                                <div className="text-left"><h3 className="font-bold text-lg text-slate-900">Soy Empleado</h3><p className="text-sm text-slate-500">Quiero saber si gano bien.</p></div>
                            </button>
                        </div>
                        <Button variant="ghost" className="mt-12 text-slate-400 hover:text-slate-600 text-sm" onClick={() => setViewState("welcome")}>← Volver</Button>
                    </div>
                </div>
              )}

              {/* VISTA B: Selección de Rubro */}
              {viewState === "profile-industry" && (
                 <div className="flex-1 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative flex flex-col ring-1 ring-black/5">
                    <div className="flex flex-col h-full items-center justify-center p-8 animate-in slide-in-from-right-8 duration-500">
                        <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">¿Cuál es tu rubro?</h2>
                        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                            {[
                                { id: "gastro", label: "Gastronomía", icon: <Utensils className="h-5 w-5"/> },
                                { id: "moda", label: "Indumentaria", icon: <Shirt className="h-5 w-5"/> },
                                { id: "servicios", label: "Servicios", icon: <Zap className="h-5 w-5"/> },
                                { id: "reventa", label: "Reventa", icon: <ShoppingBag className="h-5 w-5"/> },
                                { id: "otro", label: "Otro", icon: <HelpCircle className="h-5 w-5"/> },
                            ].map((ind) => (
                                <button key={ind.id} onClick={() => { setIndustry(ind.label); setViewState("calculator"); }} className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all bg-white group hover:-translate-y-0.5">
                                    <div className="text-slate-400 mb-2 group-hover:text-blue-500">{ind.icon}</div>
                                    <span className="font-semibold text-sm text-slate-700">{ind.label}</span>
                                </button>
                            ))}
                        </div>
                        <Button variant="ghost" className="mt-8 text-slate-400 text-sm" onClick={() => setViewState("profile-type")}>← Atrás</Button>
                    </div>
                 </div>
              )}

              {/* VISTA C: Calculadora de Sueldo (Empleado) */}
              {viewState === "employee-calculator" && (
                 <div className="flex-1 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative flex flex-col ring-1 ring-black/5">
                    <EmployeeCalculator onBack={() => setViewState("profile-type")} />
                 </div>
              )}

              {/* VISTA D: Calculadora de Costos (Emprendedor) */}
              {viewState === "calculator" && (
                 <CostCalculator 
                    businessType={businessType} 
                    industry={industry} 
                    onBack={() => setViewState("profile-industry")} 
                 />
              )}

          </div>
      </main>

      {/* Footer Global */}
      <footer className="w-full py-8 px-6 text-center border-t border-slate-200 bg-white mt-auto">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">
                Powered by <a href="https://www.enredconsultora.com.ar" target="_blank" className="hover:text-blue-600 transition-colors">En Red Consultora</a>
            </p>
            <div className="max-w-2xl mx-auto space-y-2">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                    <strong>Aviso Legal:</strong> Los cálculos de sueldo son estimativos y se basan en los valores básicos de Convenios Colectivos de Trabajo (CCT) vigentes a Diciembre 2025. Los resultados no constituyen una liquidación oficial de haberes ni sustituyen el asesoramiento de un contador o abogado laboral.
                </p>
                <p className="text-[10px] text-slate-400">Versión Beta 1.0 • Hecho en Argentina 🇦🇷</p>
            </div>
            <div className="mt-6 pt-6 border-t border-dashed border-slate-100">
                <a href="https://mis-finanzas-demo.vercel.app/" target="_blank" className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
                    ✨ ¿Querés ordenar tus gastos personales? Probá nuestra App de Finanzas
                </a>
            </div>
       </footer>

    </div>
  );
}