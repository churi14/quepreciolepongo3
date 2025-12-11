"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Package } from "lucide-react"; // Importamos Package

export interface Ingredient {
  id: number;
  name: string;
  cost: number;
}

interface Props {
  ingredients: Ingredient[];
  onAdd: (name: string, cost: number) => void;
  onRemove: (id: number) => void;
}

export default function IngredientList({ ingredients, onAdd, onRemove }: Props) {
  const [newName, setNewName] = useState("");
  const [newCost, setNewCost] = useState("");

  const handleAdd = () => {
    if (!newName || !newCost) return;
    onAdd(newName, parseFloat(newCost));
    setNewName("");
    setNewCost("");
  };

  const totalLocal = ingredients.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-6">
      
      {/* Mensaje de ayuda */}
      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3 items-start">
        <Package className="h-5 w-5 text-blue-500 mt-0.5" />
        <p className="text-sm text-blue-700">
           Acá cargá todo lo que conforma tu producto: <strong>Ingredientes, Etiquetas, Cajas, Bolsas, etc.</strong> 
           <br/>Todo lo que se va con el cliente es costo directo.
        </p>
      </div>

      {/* Lista de Items */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {ingredients.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-8 italic border-2 border-dashed border-slate-100 rounded-lg">
                Agregá ingredientes o envases abajo...
            </div>
        )}
        {ingredients.map((ing) => (
          <div key={ing.id} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-100 shadow-sm animate-in fade-in">
            <span className="flex-1 text-sm font-medium text-slate-700">{ing.name}</span>
            <span suppressHydrationWarning className="text-sm font-bold text-slate-900">
                ${ing.cost.toLocaleString("es-AR")}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => onRemove(ing.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Inputs para agregar */}
      <div className="flex gap-3 items-end border-t border-slate-100 pt-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Item (Ingrediente / Caja)</label>
          <Input 
            className="bg-white"
            placeholder="Ej: Caja de cartón" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <div className="w-28 space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Costo Unit ($)</label>
          <Input 
            type="number" 
            className="bg-white"
            placeholder="0.00" 
            value={newCost}
            onChange={(e) => setNewCost(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <Button onClick={handleAdd} size="icon" className="bg-slate-900 hover:bg-slate-800 shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-slate-100 p-4 rounded-xl flex justify-between items-center text-sm">
        <span className="text-slate-600 font-medium">Costo Directo Total:</span>
        <span suppressHydrationWarning className="font-bold text-xl text-slate-900">
            ${totalLocal.toLocaleString("es-AR")}
        </span>
      </div>
    </div>
  );
}