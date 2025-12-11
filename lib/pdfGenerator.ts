import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Ingredient } from "@/components/IngredientList";

interface PDFData {
  ingredients: Ingredient[];
  laborCost: number;
  fixedCost: number;
  totalCost: number;
  profit: number;
  finalPrice: number;
  productName?: string; // Opcional: Nombre del producto
}

export const generatePDF = (data: PDFData) => {
  const doc = new jsPDF();

  // --- ENCABEZADO ---
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Reporte de Costos", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 28);
  
  // Línea divisoria
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 32, 196, 32);

  // --- SECCIÓN 1: RESUMEN EJECUTIVO (Grandes Números) ---
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Resumen Financiero", 14, 45);

  // Caja de Precio Final (Destacado)
  doc.setFillColor(240, 255, 240); // Verde clarito
  doc.roundedRect(14, 50, 182, 25, 3, 3, "F");
  
  doc.setFontSize(12);
  doc.setTextColor(0, 100, 0);
  doc.text("PRECIO DE VENTA SUGERIDO", 20, 60);
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`$ ${data.finalPrice.toLocaleString()}`, 20, 70);

  // --- SECCIÓN 2: DETALLE DE COSTOS (Tabla) ---
  const tableBody = [
    ...data.ingredients.map(ing => [ing.name, `$ ${ing.cost.toLocaleString()}`]),
    // Fila vacía separadora
    ["", ""],
    ["Mano de Obra (Tiempo)", `$ ${Math.round(data.laborCost).toLocaleString()}`],
    ["Costos Fijos Unitarios", `$ ${Math.round(data.fixedCost).toLocaleString()}`],
    // Fila de total
    [{ content: "COSTO TOTAL REAL", styles: { fontStyle: "bold" } }, { content: `$ ${Math.round(data.totalCost).toLocaleString()}`, styles: { fontStyle: "bold" } }],
  ];

  autoTable(doc, {
    startY: 85,
    head: [["Concepto", "Monto"]],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [40, 40, 40] }, // Negro/Gris oscuro profesional
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 40, halign: "right" },
    },
  });

  // --- SECCIÓN 3: BRANDING (Tu Publicidad) ---
  // Esto va al pie de página para que te contacten
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFillColor(245, 247, 250); // Gris muy suave
  doc.rect(0, pageHeight - 40, 210, 40, "F"); // Fondo pie de página

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("¿Necesitás ayuda para optimizar estos números?", 14, pageHeight - 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("En Red Consultora - Soluciones IT & Comunicación", 14, pageHeight - 18);
  doc.text("www.enredconsultora.com.ar", 14, pageHeight - 12);

  // Guardar archivo
  doc.save("Analisis_de_Costos.pdf");
};