"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Download, Loader2 } from "lucide-react";

interface Props {
  onSuccess: (userData: { name: string; email: string }) => void; // Función que se ejecuta cuando completa el form
  triggerButton: React.ReactNode; // El botón que dispara el modal
}

export default function LeadCaptureModal({ onSuccess, triggerButton }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Datos del formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);

    // --- SIMULACIÓN DE ENVÍO A BASE DE DATOS ---
    // Acá en el futuro pondremos la conexión a Google Sheets o tu Email.
    console.log("Nuevo Lead Capturado:", { name, email });
    
    // Simulamos una pequeña espera de 1.5 seg para que parezca que procesa
    setTimeout(() => {
      setLoading(false);
      setOpen(false); // Cerramos el modal
      onSuccess({ name, email }); // ¡DISPARAMOS LA DESCARGA!
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl">Desbloquear Reporte</DialogTitle>
          <DialogDescription className="text-center">
            Ingresá tus datos para personalizar el PDF y habilitar la descarga inmediata.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de tu Emprendimiento / Tu Nombre</Label>
            <Input 
              id="name" 
              placeholder="Ej: Cocina de Juan" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (donde te enviaremos tips)</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="juan@ejemplo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando reporte...
              </>
            ) : (
              <>
                Descargar Reporte Ahora <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          <p className="text-[10px] text-center text-slate-400">
            Tus datos están seguros. Al descargar aceptás recibir nuestros consejos de optimización de costos.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}