// components/EmployeeCalculator.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { zones, laborData } from "@/app/data/salaryData"; // Importamos los datos

interface EmployeeCalculatorProps {
  onBack: () => void; // Prop para volver atrás
}

export default function EmployeeCalculator({ onBack }: EmployeeCalculatorProps) {
  // --- ESTADOS LOCALES ---
  const [empNeto, setEmpNeto] = useState(0);
  const [empBruto, setEmpBruto] = useState(0);
  const [empJobTitle, setEmpJobTitle] = useState("");
  
  // Selectores
  const [selectedZone, setSelectedZone] = useState(1.0); 
  const [selectedIndustryId, setSelectedIndustryId] = useState("");
  const [empCategory, setEmpCategory] = useState("");
  
  // ESTADOS DE JORNADA
  const [workModality, setWorkModality] = useState<"full" | "part">("full");
  const [workedHours, setWorkedHours] = useState(176); 

  const [empResult, setEmpResult] = useState<"bajo" | "acorde" | "alto" | null>(null);
  const [empDiff, setEmpDiff] = useState(0);

  // Helper para buscar categorías
  const activeCategories = useMemo(() => {
    const industry = laborData.find(i => i.id === selectedIndustryId);
    return industry ? industry.categories : [];
  }, [selectedIndustryId]);

  // Resetear estados al cambiar rubro
  useEffect(() => {
    const industry = laborData.find(i => i.id === selectedIndustryId);
    if (industry) {
        if (!industry.allowPartTime) setWorkModality("full");
        if ((industry.type === 'hourly')) setWorkedHours(176);
    }
  }, [selectedIndustryId]);

  const formatMoney = (val: number) => val.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  // --- LÓGICA DE CÁLCULO ---
  const calculateSalaryStatus = () => {
    const industry = laborData.find(i => i.id === selectedIndustryId);
    if (!industry) return;
    const category = industry.categories.find(c => c.id === empCategory);
    if (!category) return;

    // 1. Determinar Base Bruta (Full Time)
    let baseFullTime = category.base;
    const isHourlyCategory = (category.type || industry.type) === "hourly";
    let grossReal = 0;

    if (isHourlyCategory) {
        grossReal = baseFullTime * workedHours;
    } else {
        baseFullTime = baseFullTime * selectedZone;
        baseFullTime = baseFullTime * (1 + industry.presentismo);

        if (workModality === "part" && industry.allowPartTime) {
            grossReal = baseFullTime * 0.5;
        } else {
            grossReal = baseFullTime;
        }
    }

    // 2. Calcular Neto Teórico
    const dctoJubilacion = grossReal * 0.11;
    const dctoPAMI = grossReal * 0.03;
    
    // EXCEPCIÓN OBRA SOCIAL
    let baseCalculoOS = grossReal;
    if (workModality === "part" && industry.allowPartTime && !isHourlyCategory) {
        baseCalculoOS = baseFullTime; 
    }
    const dctoObraSocial = baseCalculoOS * 0.03;

    const theoreticalNet = grossReal - dctoJubilacion - dctoPAMI - dctoObraSocial;

    // 3. Comparar
    const lowerBound = theoreticalNet * 0.90; 
    const upperBound = theoreticalNet * 1.10;
    
    let diffPercentage = 0;
    if (theoreticalNet > 0) {
        diffPercentage = ((empNeto - theoreticalNet) / theoreticalNet) * 100;
    }
    
    setEmpDiff(diffPercentage);

    if (empNeto < lowerBound) {
        setEmpResult("bajo");
    } else if (empNeto > upperBound) {
        setEmpResult("alto");
    } else {
        setEmpResult("acorde");
    }

    // 4. GUARDAR EN SUPABASE
    const guardarDatos = async () => {
        try {
            const { error } = await supabase
            .from('consultas_sueldo')
            .insert([
                { 
                    puesto: empJobTitle,
                    rubro: industry.label,
                    categoria: category.label,
                    modalidad: workModality,
                    zona: selectedZone,
                    bruto_ingresado: empBruto,
                    neto_ingresado: empNeto,
                    diferencia_porcentaje: diffPercentage.toFixed(2)
                },
            ]);
            
            if (error) throw error;
            console.log('¡Dato guardado en Supabase!');
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    };
    
    guardarDatos();
  };

  const selectedIndustry = laborData.find(i => i.id === selectedIndustryId);
  const isHourly = selectedIndustry?.type === 'hourly';

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
        <div className="flex items-center px-6 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculadora de Sueldo</span>
        </div>
        
        <div className="flex-1 p-6 md:p-10">
            <div className="max-w-xl mx-auto w-full space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Chequeá tu Sueldo</h2>
                    <p className="text-sm text-slate-500 font-medium">Datos actualizados a Diciembre 2025.</p>
                </div>

                {/* FORMULARIO */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Tu Puesto <span className="text-red-500 normal-case ml-1">(Obligatorio) *</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="Ej. Vendedor, Administrativo..." 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={empJobTitle}
                            onChange={(e) => setEmpJobTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sueldo Bruto</label>
                            <input 
                                type="text"
                                inputMode="numeric"
                                placeholder="$ Recibo" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={empBruto > 0 ? empBruto.toLocaleString("es-AR") : ""}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\./g, "");
                                    if (/^\d*$/.test(rawValue)) setEmpBruto(Number(rawValue));
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Neto (En mano) <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text"
                                inputMode="numeric"
                                placeholder="$ Te depositan" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 text-sm"
                                value={empNeto > 0 ? empNeto.toLocaleString("es-AR") : ""}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\./g, "");
                                    if (/^\d*$/.test(rawValue)) setEmpNeto(Number(rawValue));
                                }}
                            />
                        </div>
                    </div>

                    {/* SELECTOR DE ZONA Y RUBRO */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Zona del País <span className="text-red-500">*</span>
                        </label>
                        <select 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm cursor-pointer"
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(Number(e.target.value))}
                        >
                            {zones.map((z) => (
                                <option key={z.id} value={z.id}>{z.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Rubro / Convenio <span className="text-red-500">*</span>
                        </label>
                        <select 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm cursor-pointer"
                            value={selectedIndustryId}
                            onChange={(e) => {
                                setSelectedIndustryId(e.target.value);
                                setEmpCategory(""); 
                            }}
                        >
                            <option value="">Seleccioná tu rubro...</option>
                            {laborData.map((ind) => (
                                <option key={ind.id} value={ind.id}>{ind.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* SELECTOR DE MODALIDAD (CONDICIONAL) */}
                    {selectedIndustry && !isHourly && selectedIndustry.allowPartTime && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Modalidad de Contratación
                            </label>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setWorkModality("full")}
                                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${workModality === "full" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                                >
                                    Jornada Completa
                                </button>
                                <button 
                                    onClick={() => setWorkModality("part")}
                                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${workModality === "part" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                                >
                                    Media Jornada
                                </button>
                            </div>
                            {workModality === "part" && (
                                <p className="text-[10px] text-blue-500 mt-1 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded">
                                    ℹ️ Obra Social se calcula sobre sueldo completo (Ley 26.474)
                                </p>
                            )}
                        </div>
                    )}

                    {/* INPUT DE HORAS (CONDICIONAL PARA UOCRA/UOM) */}
                    {isHourly && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Horas Trabajadas (Mes) <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="number"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={workedHours}
                                onChange={(e) => setWorkedHours(Number(e.target.value))}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Estándar mensual de convenio: 176 horas.</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Categoría <span className="text-red-500">*</span>
                        </label>
                        <select 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                            value={empCategory}
                            onChange={(e) => setEmpCategory(e.target.value)}
                            disabled={!selectedIndustryId}
                        >
                            <option value="">
                                {selectedIndustryId ? "Seleccioná tu categoría..." : "Primero elegí un rubro"}
                            </option>
                            {activeCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button 
                        className="w-full bg-slate-900 text-white rounded-xl py-6 text-base font-bold shadow-lg hover:bg-slate-800 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={calculateSalaryStatus}
                        disabled={!empNeto || !empCategory || !empJobTitle}
                    >
                        Verificar mi Sueldo
                    </Button>
                </div>

                {/* RESULTADO */}
                {empResult && (
                    <div className={`p-6 rounded-2xl mt-6 border animate-in zoom-in duration-300 ${
                        empResult === 'bajo' ? 'bg-red-50 border-red-100' : 
                        empResult === 'acorde' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'
                    }`}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${
                                empResult === 'bajo' ? 'bg-red-500' : 
                                empResult === 'acorde' ? 'bg-green-500' : 'bg-blue-500'
                            }`} />
                            <h3 className={`font-bold text-base md:text-lg ${
                                empResult === 'bajo' ? 'text-red-700' : 
                                empResult === 'acorde' ? 'text-green-700' : 'text-blue-700'
                            }`}>
                                {empResult === 'bajo' ? 'Estás cobrando menos de lo debido' : 
                                 empResult === 'acorde' ? 'Tu sueldo está en regla' : '¡Excelente! Ganás más del promedio'}
                            </h3>
                        </div>
                        
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {(() => {
                                const ind = laborData.find(i => i.id === selectedIndustryId);
                                const cat = ind?.categories.find(c => c.id === empCategory);
                                if(!cat || !ind) return "";
                                
                                let base = cat.base;
                                if((cat.type || ind.type) === "hourly") base *= workedHours;
                                else base = base * selectedZone * (1 + ind.presentismo);

                                let grossCalc = base;
                                let baseOS = base;
                                if(workModality === 'part' && ind.allowPartTime && ind.type !== 'hourly') {
                                    grossCalc = base * 0.5;
                                }

                                const netCalc = grossCalc - (grossCalc * 0.14) - (baseOS * 0.03);

                                return empResult === 'bajo' 
                                    ? `Deberías cobrar aprox ${formatMoney(netCalc)} en mano (Jornada ${workModality === 'full' ? 'Completa' : 'Media'}). Estás un ${Math.abs(empDiff).toFixed(1)}% abajo.` 
                                    : empResult === 'acorde'
                                    ? `Tu sueldo coincide con el convenio (${formatMoney(netCalc)} aprox).`
                                    : `Estás un ${empDiff.toFixed(1)}% por encima del convenio.`;
                            })()}
                        </p>
                    </div>
                )}
                
                <div className="pt-4 text-center">
                     <Button variant="ghost" className="text-slate-400 text-sm" onClick={onBack}>← Volver</Button>
                </div>
            </div>
        </div>
    </div>
  );
}