// app/data/salaryData.ts

export const zones = [
    { id: 1.0, label: "Zona A - Resto del País (Estándar)" },
    { id: 1.2, label: "Zona B - Patagonia Norte (Río Negro, Neuquén)" },
    { id: 1.5, label: "Zona C - Patagonia Sur (Chubut, Santa Cruz)" },
    { id: 2.0, label: "Zona Austral - Tierra del Fuego" },
];
  
export const laborData = [
    {
      id: "comercio",
      label: "Comercio (CCT 130/75)",
      type: "monthly",
      allowPartTime: true,
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
      allowPartTime: true,
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
      allowPartTime: true,
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
      type: "hourly", 
      allowPartTime: false, 
      presentismo: 0.20,
      categories: [
        { id: "ayudante", label: "Ayudante (Hora)", base: 3833 },
        { id: "medio_oficial", label: "Medio Oficial (Hora)", base: 4200 },
        { id: "oficial", label: "Oficial (Hora)", base: 4600 },
        { id: "oficial_esp", label: "Oficial Especializado (Hora)", base: 5268 },
        { id: "sereno", label: "Sereno (Mensual)", base: 750000, type: "monthly" }, 
      ]
    },
    {
      id: "uom",
      label: "Metalúrgicos (UOM - CCT 260/75)",
      type: "hourly",
      allowPartTime: false,
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
      allowPartTime: false, 
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
      allowPartTime: true,
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
      allowPartTime: true, 
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
      allowPartTime: true,
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
      allowPartTime: false, 
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