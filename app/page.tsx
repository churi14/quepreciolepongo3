"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, ChevronLeft, ChevronRight, User, Users, Utensils, 
  Shirt, Zap, ShoppingBag, HelpCircle, X, Minus, Equal, Divide, 
  Briefcase, MapPin
} from "lucide-react";

// TUS IMPORTACIONES (Mantenlas igual)
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
  const [viewState, setViewState] = useState<"welcome" | "profile-type" | "profile-industry" | "calculator" | "employee-calculator">("welcome");
  const [businessType, setBusinessType] = useState(""); 
  const [industry, setIndustry] = useState(""); 
  const [calcStep, setCalcStep] = useState(0);

  // --- ESTADOS DE EMPLEADO ---
  const [empNeto, setEmpNeto] = useState(0);
  const [empBruto, setEmpBruto] = useState(0);
  const [empJobTitle, setEmpJobTitle] = useState("");
  
  // Selectores nuevos
  const [selectedZone, setSelectedZone] = useState(1.0); // 1.0 es Zona A
  const [selectedIndustryId, setSelectedIndustryId] = useState("");
  const [empCategory, setEmpCategory] = useState(""); // ID de la categoría (string)

  const [empResult, setEmpResult] = useState<"bajo" | "acorde" | "alto" | null>(null);
  const [empDiff, setEmpDiff] = useState(0);

  // --- DATOS MAESTROS (RUBROS, ZONAS, CATEGORÍAS) ---
  
  const zones = [
    { id: 1.0, label: "Zona A - Resto del País (Estándar)" },
    { id: 1.2, label: "Zona B - Patagonia Norte (Río Negro, Neuquén)" },
    { id: 1.5, label: "Zona C - Patagonia Sur (Chubut, Santa Cruz)" },
    { id: 2.0, label: "Zona Austral - Tierra del Fuego" },
  ];

  // Base de datos completa Diciembre 2025
  const laborData = [
    {
      id: "comercio",
      label: "Comercio (CCT 130/75)",
      type: "monthly",
      presentismo: 0.0833,
      categories: [
        { id: "maestranza_a", label: "Maestranza A", base: 1080000 },
        { id: "admin_a", label: "Administrativo A", base: 1105000 },
        { id: "cajero_b", label: "Cajero B", base: 1115000 },
        { id: "vendedor_b", label: "Vendedor B", base: 1135000 },
        { id: "aux_esp_a", label: "Auxiliar Especializado A", base: 1120000 },
      ]
    },
    {
      id: "gastro",
      label: "Gastronómicos (CCT 389/04)",
      type: "monthly",
      presentismo: 0, 
      categories: [
        { id: "peon", label: "Peón / Limpieza", base: 950000 },
        { id: "mozo", label: "Mozo / Camarero", base: 1050000 },
        { id: "ayudante_cocina", label: "Ayudante de Cocina", base: 1020000 },
        { id: "cocinero", label: "Cocinero (Jefe Partida)", base: 1150000 },
        { id: "recepcionista", label: "Recepcionista", base: 1080000 },
      ]
    },
    {
      id: "pizza_helar",
      label: "Pizzerías y Heladerías (CCT 24/88)",
      type: "monthly",
      presentismo: 0,
      categories: [
        { id: "ayudante", label: "Ayudante", base: 980000 },
        { id: "dependiente", label: "Dependiente Mostrador", base: 1050000 },
        { id: "maestro", label: "Maestro Pizzero / Heladero", base: 1250000 },
        { id: "cajero", label: "Cajero", base: 1020000 },
        { id: "encargado", label: "Encargado", base: 1300000 },
      ]
    },
    {
      id: "uocra",
      label: "Construcción (UOCRA - CCT 76/75)",
      type: "hourly", // Se multiplicará por 176hs para estimar mensual
      presentismo: 0.20,
      categories: [
        { id: "ayudante", label: "Ayudante (Hora)", base: 3833 },
        { id: "medio_oficial", label: "Medio Oficial (Hora)", base: 4200 },
        { id: "oficial", label: "Oficial (Hora)", base: 4600 },
        { id: "oficial_esp", label: "Oficial Especializado (Hora)", base: 5268 },
        { id: "sereno", label: "Sereno (Mensual)", base: 750000, type: "monthly" }, // Excepción mensual
      ]
    },
    {
      id: "uom",
      label: "Metalúrgicos (UOM - CCT 260/75)",
      type: "hourly",
      presentismo: 0,
      categories: [
        { id: "ingresante", label: "Ingresante (Hora)", base: 3900 },
        { id: "op_calificado", label: "Operario Calificado (Hora)", base: 4400 },
        { id: "medio_oficial", label: "Medio Oficial (Hora)", base: 4900 },
        { id: "oficial", label: "Oficial (Hora)", base: 5300 },
        { id: "oficial_multiple", label: "Oficial Múltiple (Hora)", base: 5800 },
      ]
    },
    {
      id: "camioneros",
      label: "Transporte (Camioneros - CCT 40/89)",
      type: "monthly",
      presentismo: 0,
      categories: [
        { id: "peon", label: "Peón Carga/Descarga", base: 850000 },
        { id: "reparto", label: "Chofer Reparto", base: 920000 },
        { id: "primera", label: "Chofer Primera", base: 1050000 },
        { id: "larga", label: "Larga Distancia", base: 1100000 },
        { id: "admin", label: "Administrativo Primera", base: 980000 },
      ]
    },
    {
      id: "sanidad",
      label: "Sanidad (CCT 122/75)",
      type: "monthly",
      presentismo: 0,
      categories: [
        { id: "mucama", label: "Mucama / Maestranza", base: 980000 },
        { id: "admin", label: "Administrativo", base: 1050000 },
        { id: "enf_piso", label: "Enfermero/a Piso", base: 1180000 },
        { id: "enf_esp", label: "Enfermero/a Especializado", base: 1350000 },
        { id: "camillero", label: "Camillero", base: 1020000 },
      ]
    },
    {
      id: "uatre",
      label: "Trabajo Rural (UATRE)",
      type: "monthly",
      presentismo: 0,
      categories: [
        { id: "peon_gral", label: "Peón General", base: 850000 },
        { id: "peon_esp", label: "Peón Especializado", base: 890000 },
        { id: "tractorista", label: "Tractorista", base: 980000 },
        { id: "capataz", label: "Capataz", base: 1100000 },
        { id: "encargado", label: "Encargado", base: 1200000 },
      ]
    },
    {
      id: "maestranza",
      label: "Limpieza (CCT 281/96)",
      type: "monthly",
      presentismo: 0,
      categories: [
        { id: "operario", label: "Operario", base: 920000 },
        { id: "op_esp", label: "Operario Especializado", base: 980000 },
        { id: "oficial", label: "Oficial", base: 1050000 },
        { id: "of_esp", label: "Oficial Especializado", base: 1100000 },
        { id: "coordinador", label: "Coordinador", base: 1250000 },
      ]
    },
    {
      id: "seguridad",
      label: "Seguridad Privada (CCT 507/07)",
      type: "monthly",
      presentismo: 0,
      categories: [
        { id: "gral", label: "Vigilador General", base: 1100000 },
        { id: "bombero", label: "Vigilador Bombero", base: 1150000 },
        { id: "monitoreo", label: "Operador Monitoreo", base: 1150000 },
        { id: "jefe", label: "Jefe de Servicio", base: 1300000 },
        { id: "vip", label: "Custodio VIP", base: 1450000 },
      ]
    },
  ];

  // Helper para buscar categorías según el rubro seleccionado
  const activeCategories = useMemo(() => {
    const industry = laborData.find(i => i.id === selectedIndustryId);
    return industry ? industry.categories : [];
  }, [selectedIndustryId]);
  
  // TUS FUNCIONES (Mantenlas igual)
  const addIngredient = (name: string, cost: number) => setIngredients([...ingredients, { id: Date.now(), name, cost }]);
  const removeIngredient = (id: number) => setIngredients(ingredients.filter((item) => item.id !== id));
  
  const totalMaterials = ingredients.reduce((sum, item) => sum + item.cost, 0);
  const productionCost = totalMaterials + laborCost;
  const totalCost = productionCost + fixedCostPerUnit + sellingExpenses;
  
  const formatMoney = (val: number) => val.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  // --- LÓGICA DE CÁLCULO DE SUELDO ---
  const calculateSalaryStatus = () => {
    // 1. Encontrar Rubro y Categoría
    const industry = laborData.find(i => i.id === selectedIndustryId);
    if (!industry) return;
    const category = industry.categories.find(c => c.id === empCategory);
    if (!category) return;

    // 2. Definir Base de Cálculo (Si es por hora, estimamos 176hs mensuales)
    let baseAmount = category.base;
    
    // Check si la categoría tiene override de tipo (ej: Sereno en UOCRA es mensual aunque el rubro sea hora)
    const isHourly = (category.type || industry.type) === "hourly";
    
    if (isHourly) {
        baseAmount = baseAmount * 176; // Estándar mensual de horas normales
    }

    // 3. Aplicar Coeficientes
    const zoneMultiplier = selectedZone;
    const presentismoMultiplier = 1 + industry.presentismo;

    // Gross (Bruto) Teórico = Base * Zona * Presentismo
    const theoreticalGross = baseAmount * zoneMultiplier * presentismoMultiplier;

    // 4. Calcular Neto Teórico (Bolsillo)
    // Descuentos de Ley Empleado: 11% Jub + 3% PAMI + 3% OS = 17% Total
    const theoreticalNet = theoreticalGross * 0.83;

    // 5. Comparar
    const lowerBound = theoreticalNet * 0.90; // Tolerancia 10%
    const upperBound = theoreticalNet * 1.10;
    const diffPercentage = ((empNeto - theoreticalNet) / theoreticalNet) * 100;
    
    setEmpDiff(diffPercentage);

    if (empNeto < lowerBound) {
        setEmpResult("bajo");
    } else if (empNeto > upperBound) {
        setEmpResult("alto");
    } else {
        setEmpResult("acorde");
    }

    // Guardar en DB (Simulado)
    const dataToSave = {
        puesto: empJobTitle,
        rubro: industry.label,
        categoria: category.label,
        zona: selectedZone,
        bruto_ingresado: empBruto,
        neto_ingresado: empNeto,
        neto_teorico: theoreticalNet.toFixed(2),
        diferencia: diffPercentage.toFixed(2),
        fecha: new Date().toISOString()
    };
    console.log("GUARDANDO DATOS:", dataToSave);
  };

  // --- PASOS CALCULADORA DE COSTOS (Mismo código) ---
  const calculatorSteps = [
    { title: "Materia Prima", subtitle: `Ingredientes y packaging.`, component: <IngredientList ingredients={ingredients} onAdd={addIngredient} onRemove={removeIngredient} /> },
    { title: "Mano de Obra", subtitle: businessType === "team" ? "Nómina y equipo." : "¿Cuánto vale tu tiempo?", component: businessType === "team" ? <TeamLaborCalculator onCostChange={setLaborCost} /> : <LaborCalculator onCostChange={setLaborCost} /> },
    { title: "Costos Fijos", subtitle: "Gastos mensuales.", component: <FixedCosts onCostChange={setFixedCostPerUnit} /> },
    { title: "Canal de Venta", subtitle: "Impuestos y comisiones.", component: <Commercialization productPrice={finalPrice || productionCost * 2} onCostsChange={(selling) => setSellingExpenses(selling)} /> },
    { title: "Precio Final", subtitle: "Definí tu ganancia.", component: <PriceCalculator totalCost={totalCost} onPriceChange={(price, profit) => { setFinalPrice(price); setProfitAmount(profit); }} /> },
  ];

  // --- RENDER CONTENT ---
  const renderCardContent = () => {
    
    // A. PERFIL
    if (viewState === "profile-type") {
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                    ¿Cuál es tu situación actual?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                    <button onClick={() => { setBusinessType("solo"); setViewState("profile-industry"); }} className="group p-6 border border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 transition-all flex items-center gap-4 bg-white shadow-sm hover:shadow-md">
                        <div className="bg-blue-100 p-4 rounded-xl shrink-0">
                            <User className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-slate-900">Solo / Freelance</h3>
                            <p className="text-sm text-slate-500">Hago todo por mi cuenta.</p>
                        </div>
                    </button>

                    <button onClick={() => { setBusinessType("team"); setViewState("profile-industry"); }} className="group p-6 border border-slate-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50/30 transition-all flex items-center gap-4 bg-white shadow-sm hover:shadow-md">
                        <div className="bg-purple-100 p-4 rounded-xl shrink-0">
                            <Users className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-slate-900">PyME / Equipo</h3>
                            <p className="text-sm text-slate-500">Tengo empleados o socios.</p>
                        </div>
                    </button>

                    <button onClick={() => setViewState("employee-calculator")} className="group p-6 border-2 border-slate-100 rounded-2xl hover:border-green-500 hover:bg-green-50/30 transition-all flex items-center gap-4 bg-white md:col-span-2 shadow-sm hover:shadow-md">
                        <div className="bg-green-100 p-4 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                            <Briefcase className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-slate-900">Soy Empleado</h3>
                            <p className="text-sm text-slate-500">Quiero saber si gano bien.</p>
                        </div>
                    </button>
                </div>
                <Button variant="ghost" className="mt-12 text-slate-400 hover:text-slate-600 text-sm" onClick={() => setViewState("welcome")}>← Volver</Button>
            </div>
        );
    }

    // B. INDUSTRIA (Mantenlo igual)
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

    // C. VISTA: CALCULADORA DE SUELDO (CON NUEVOS DATOS)
    if (viewState === "employee-calculator") {
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

                            {/* SELECTOR DE ZONA GEOGRÁFICA */}
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

                            {/* SELECTOR DE RUBRO (INDUSTRIA) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Rubro / Convenio <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm cursor-pointer"
                                    value={selectedIndustryId}
                                    onChange={(e) => {
                                        setSelectedIndustryId(e.target.value);
                                        setEmpCategory(""); // Resetear categoría al cambiar rubro
                                    }}
                                >
                                    <option value="">Seleccioná tu rubro...</option>
                                    {laborData.map((ind) => (
                                        <option key={ind.id} value={ind.id}>{ind.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* SELECTOR DE CATEGORÍA (DINÁMICO) */}
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
                                            {cat.label} ({formatMoney(cat.base)} { (cat.type || laborData.find(i=>i.id===selectedIndustryId)?.type) === 'hourly' ? '/ hora' : '/ mes' })
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
                                        // Recalcular para el texto (esto es solo visualización)
                                        const ind = laborData.find(i => i.id === selectedIndustryId);
                                        const cat = ind?.categories.find(c => c.id === empCategory);
                                        if(!cat || !ind) return "";

                                        let base = cat.base;
                                        if((cat.type || ind.type) === "hourly") base *= 176;
                                        const theoretical = base * selectedZone * (1 + ind.presentismo) * 0.83;

                                        return empResult === 'bajo' 
                                            ? `Según tu categoría y zona, deberías cobrar aprox ${formatMoney(theoretical)} en mano. Estás un ${Math.abs(empDiff).toFixed(1)}% abajo.` 
                                            : empResult === 'acorde'
                                            ? `Tu sueldo coincide con el convenio (${formatMoney(theoretical)} aprox).`
                                            : `Estás cobrando un ${empDiff.toFixed(1)}% por encima del convenio.`;
                                    })()}
                                </p>
                            </div>
                        )}
                        
                        <div className="pt-4 text-center">
                             <Button variant="ghost" className="text-slate-400 text-sm" onClick={() => setViewState("profile-type")}>← Volver</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // D. CALCULADORA DE PRECIOS (Wizard default)
    return (
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

  // 1. HOME SCREEN
  if (viewState === "welcome") {
    return (
        <div className="min-h-screen w-full bg-zinc-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
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

  // 2. VISTA GENERAL
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
      
      <header className="w-full p-6 md:px-10 flex justify-between items-center">
           <img src="/logo.png" alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
           
           <button onClick={() => setViewState("welcome")} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider">
                Salir
           </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
          <div className={`w-full max-w-5xl flex flex-col md:flex-row gap-6 ${viewState === 'employee-calculator' ? 'h-auto' : 'h-[80vh] md:h-[650px]'}`}>
              
              <div className="flex-1 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative flex flex-col ring-1 ring-black/5">
                   {renderCardContent()}
              </div>

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
                    
                    <div className="p-4 bg-slate-900 text-white mt-auto text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sugerido</span>
                        <div className="text-2xl font-black my-1">{formatMoney(finalPrice)}</div>
                        <LeadCaptureModal onSuccess={(u) => generatePDF({ ingredients, laborCost, fixedCost: fixedCostPerUnit, totalCost, profit: profitAmount, finalPrice, productName: u.name })} triggerButton={<Button className="w-full mt-2 bg-white text-black hover:bg-slate-200 font-bold rounded-lg h-9 text-xs">Descargar PDF</Button>} />
                    </div>
                </div>
              )}
          </div>
      </main>

      <footer className="w-full p-6 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Powered by En Red Consultora
            </p>
       </footer>

    </div>
  );
}