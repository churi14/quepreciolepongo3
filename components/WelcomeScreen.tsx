// components/WelcomeScreen.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, X, Minus, Equal, Divide } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
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
                    onClick={onStart}
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
  );
}