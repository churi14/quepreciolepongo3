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
  productName?: string; 
}

export const generatePDF = (data: PDFData) => {
  const doc = new jsPDF();

  // --- ENCABEZADO ---
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Reporte de Costos", 14, 20);

  if (data.productName) {
    doc.setFontSize(12);
    doc.text(`Producto: ${data.productName}`, 14, 28);
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 196, 20, { align: "right" });
  
  // Línea divisoria
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 32, 196, 32);

  // --- SECCIÓN 1: RESUMEN EJECUTIVO ---
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Resumen Financiero", 14, 45);

  // Caja de Precio Final
  doc.setFillColor(240, 255, 240); // Verde clarito
  doc.roundedRect(14, 50, 182, 25, 3, 3, "F");
  
  doc.setFontSize(12);
  doc.setTextColor(0, 100, 0);
  doc.text("PRECIO DE VENTA SUGERIDO", 20, 60);
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`$ ${data.finalPrice.toLocaleString("es-AR")}`, 20, 70);

  // --- SECCIÓN 2: DETALLE DE COSTOS ---
  // Construimos el cuerpo de la tabla con tipos explícitos para evitar el error
  const tableBody: any[] = [
    ...data.ingredients.map(ing => [ing.name, `$ ${ing.cost.toLocaleString("es-AR")}`]),
    // Fila vacía
    ["", ""],
    ["Mano de Obra (Tiempo)", `$ ${Math.round(data.laborCost).toLocaleString("es-AR")}`],
    ["Costos Fijos Unitarios", `$ ${Math.round(data.fixedCost).toLocaleString("es-AR")}`],
    // Fila de total (Aquí estaba el error, usamos 'as any' o estructura simple para safar)
    [
      { content: "COSTO TOTAL REAL", styles: { fontStyle: "bold" as const } }, 
      { content: `$ ${Math.round(data.totalCost).toLocaleString("es-AR")}`, styles: { fontStyle: "bold" as const } }
    ],
  ];

  autoTable(doc, {
    startY: 85,
    head: [["Concepto", "Monto"]],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [40, 40, 40] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 40, halign: "right" },
    },
  });

  // --- SECCIÓN 3: BRANDING ---
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFillColor(245, 247, 250); 
  doc.rect(0, pageHeight - 40, 210, 40, "F"); 

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("¿Necesitás ayuda para optimizar estos números?", 14, pageHeight - 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("En Red Consultora - Soluciones IT & Comunicación", 14, pageHeight - 18);
  doc.text("www.enredconsultora.com.ar", 14, pageHeight - 12);

  doc.save("Analisis_de_Costos.pdf");
};