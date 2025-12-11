"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Users, Briefcase, UserCheck, Info } from "lucide-react";

interface Props {
  onCostChange: (cost: number) => void;
}

// DATOS DE CONVENIOS (Estimados Base 2025 para simulación)
const CONVENIOS = {
  comercio: {
    label: "Comercio (Ventas/Admin)",
    cargasSociales: 1.35, // 35% extra de costo empresa aprox
    categorias: [
      { id: "vendedor", label: "Vendedor", base: 950000 },
      { id: "admin", label: "Administrativo", base: 980000 },
      { id: "maestranza", label: "Maestranza", base: 890000 },
    ]
  },
  gastro: {
    label: "Gastronomía (UTHGRA)",
    cargasSociales: 1.35,
    categorias: [
      { id: "mozo", label: "Mozo / Camarera", base: 850000 },
      { id: "cocinero", label: "Cocinero", base: 920000 },
      { id: "ayudante", label: "Ayudante de Cocina", base: 800000 },
    ]
  },
  otro: {
    label: "Otro Convenio / General",
    cargasSociales: 1.35,
    categorias: [
        { id: "general", label: "Sueldo Base", base: 900000 }
    ]
  }
};

type Employee = {
  id: number;
  type: "blanco" | "monotributo";
  role: string;
  modality: "full" | "part" | "hora" | "fijo"; // Full time, Part time, Por hora, Fijo mensual
  baseValue: number; // Sueldo Bruto o Valor Hora
  totalCost: number; // Costo final para la empresa
};

export default function TeamLaborCalculator({ onCostChange }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Estados para el formulario de agregar
  const [empType, setEmpType] = useState<"blanco" | "monotributo">("blanco");
  const [selectedConvenio, setSelectedConvenio] = useState("comercio");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [modality, setModality] = useState<"full" | "part">("full");
  
  // Para monotributistas
  const [monoDesc, setMonoDesc] = useState("");
  const [monoValue, setMonoValue] = useState("");
  const [monoFreq, setMonoFreq] = useState<"fijo" | "hora">("fijo");
  const [monthlyHours, setMonthlyHours] = useState("160"); // Horas al mes si es por hora

  // CÁLCULO DE COSTO TOTAL
  const totalMonthlyCost = employees.reduce((sum, emp) => sum + emp.totalCost, 0);

  // TIEMPO DE PRODUCCIÓN (Para prorratear)
  const [productionTime, setProductionTime] = useState(30); // Minutos por unidad
  
  // Costo por Minuto del Equipo = (Costo Mes Equipo / Horas Mes Equipo) / 60
  // Asumimos promedio 160hs mes operativas
  const costPerMinute = totalMonthlyCost > 0 ? (totalMonthlyCost / 160) / 60 : 0;
  const costPerUnit = costPerMinute * productionTime;

  useEffect(() => {
    onCostChange(costPerUnit);
  }, [costPerUnit, onCostChange]);

  // --- AGREGAR EMPLEADO ---
  const addEmployee = () => {
    let newEmp: Employee;

    if (empType === "blanco") {
        // Lógica Empleado en Blanco
        const conv = CONVENIOS[selectedConvenio as keyof typeof CONVENIOS];
        const cat = conv.categorias.find(c => c.id === selectedCategory);
        if (!cat) return;

        let bruto = cat.base;
        if (modality === "part") bruto = bruto / 2; // Media jornada

        // El costo empresa incluye cargas sociales
        const costoEmpresa = bruto * conv.cargasSociales;

        newEmp = {
            id: Date.now(),
            type: "blanco",
            role: `${cat.label} (${modality === "full" ? "Full-Time" : "Part-Time"})`,
            modality: modality,
            baseValue: bruto,
            totalCost: costoEmpresa
        };
    } else {
        // Lógica Monotributista
        const val = parseFloat(monoValue) || 0;
        let finalCost = val;
        
        if (monoFreq === "hora") {
            const horas = parseFloat(monthlyHours) || 0;
            finalCost = val * horas;
        }

        newEmp = {
            id: Date.now(),
            type: "monotributo",
            role: monoDesc || "Servicio Externo",
            modality: monoFreq,
            baseValue: val,
            totalCost: finalCost
        };
    }

    setEmployees([...employees, newEmp]);
    // Reset inputs visuales simples
    setMonoDesc("");
    setMonoValue("");
  };

  const removeEmployee = (id: number) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. AGREGAR INTEGRANTE */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" /> Agregar Personal
        </h3>

        {/* Selector Tipo */}
        <div className="flex gap-2 mb-4">
            <Button 
                variant={empType === "blanco" ? "default" : "outline"} 
                onClick={() => setEmpType("blanco")}
                className="flex-1 text-xs h-8"
            >
                En Blanco (Rel. Dep)
            </Button>
            <Button 
                variant={empType === "monotributo" ? "default" : "outline"} 
                onClick={() => setEmpType("monotributo")}
                className="flex-1 text-xs h-8"
            >
                Monotributista / Externo
            </Button>
        </div>

        {empType === "blanco" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in">
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Convenio</label>
                    <Select value={selectedConvenio} onValueChange={setSelectedConvenio}>
                        <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.entries(CONVENIOS).map(([key, val]) => (
                                <SelectItem key={key} value={key}>{val.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Categoría</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-9 bg-white"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                            {CONVENIOS[selectedConvenio as keyof typeof CONVENIOS].categorias.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Jornada</label>
                    <Select value={modality} onValueChange={(v: any) => setModality(v)}>
                        <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="full">Completa (48hs)</SelectItem>
                            <SelectItem value="part">Media Jornada (24hs)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button onClick={addEmployee} className="w-full bg-blue-600 hover:bg-blue-700 h-9">
                        <Plus className="h-4 w-4 mr-2" /> Agregar Empleado
                    </Button>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in">
                 <div className="space-y-1">
                    <label className="text-xs text-slate-500">Descripción Tarea</label>
                    <Input className="h-9 bg-white" placeholder="Ej: Community Manager" value={monoDesc} onChange={e => setMonoDesc(e.target.value)} />
                </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-500">Modalidad Pago</label>
                    <Select value={monoFreq} onValueChange={(v: any) => setMonoFreq(v)}>
                        <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fijo">Monto Fijo Mensual</SelectItem>
                            <SelectItem value="hora">Valor Hora</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">{monoFreq === "fijo" ? "Monto Mensual ($)" : "Valor Hora ($)"}</label>
                    <Input className="h-9 bg-white" type="number" placeholder="0" value={monoValue} onChange={e => setMonoValue(e.target.value)} />
                </div>
                {monoFreq === "hora" && (
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500">Horas Estimadas Mensuales</label>
                        <Input className="h-9 bg-white" type="number" value={monthlyHours} onChange={e => setMonthlyHours(e.target.value)} />
                    </div>
                )}
                 <div className="flex items-end">
                    <Button onClick={addEmployee} className="w-full bg-purple-600 hover:bg-purple-700 h-9">
                        <Plus className="h-4 w-4 mr-2" /> Agregar Externo
                    </Button>
                </div>
            </div>
        )}
      </div>

      {/* 2. LISTA DE EQUIPO */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
         {employees.map((emp) => (
             <div key={emp.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                 <div>
                    <div className="flex items-center gap-2">
                        {emp.type === "blanco" ? <Briefcase className="h-3 w-3 text-blue-500" /> : <UserCheck className="h-3 w-3 text-purple-500" />}
                        <span className="font-bold text-sm text-slate-700">{emp.role}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                        {emp.type === "blanco" 
                            ? `Bruto: $${emp.baseValue.toLocaleString()} + Cargas Sociales` 
                            : "Pago Directo (Sin cargas)"}
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                     <span className="font-bold text-slate-900" suppressHydrationWarning>
                        ${emp.totalCost.toLocaleString("es-AR")}
                     </span>
                     <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => removeEmployee(emp.id)}>
                        <Trash2 className="h-3 w-3" />
                     </Button>
                 </div>
             </div>
         ))}
         {employees.length === 0 && (
            <div className="text-center py-6 text-sm text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                No hay empleados cargados.
            </div>
         )}
      </div>

      {/* 3. RESUMEN DE COSTOS */}
      {employees.length > 0 && (
          <div className="bg-slate-100 p-4 rounded-xl space-y-4">
              <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Costo Mensual de Nómina (Equipo):</span>
                  <span className="font-bold text-slate-900" suppressHydrationWarning>${totalMonthlyCost.toLocaleString("es-AR")}</span>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Tiempo de producción (por unidad)</span>
                      <div className="flex items-center gap-2">
                          <Input 
                            className="w-16 h-8 text-center bg-white" 
                            value={productionTime} 
                            onChange={(e) => setProductionTime(parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-xs text-slate-500">minutos</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-100 p-2 rounded text-blue-800 text-xs">
                     <Info className="h-4 w-4" />
                     <span>El costo se calcula dividiendo la nómina mensual por las horas operativas (160hs) y multiplicando por el tiempo de producción.</span>
                  </div>
              </div>

              <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-lg">
                  <span className="text-sm">Impacto Mano de Obra (Unitario):</span>
                  <span className="font-bold text-lg" suppressHydrationWarning>
                    ${costPerUnit.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                  </span>
              </div>
          </div>
      )}
    </div>
  );
}