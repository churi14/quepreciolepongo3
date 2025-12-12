export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      {/* 1. BODY: Le damos un color de fondo suave (zinc-100) para generar contraste */}
      <body className="bg-zinc-100 min-h-screen flex items-center justify-center p-4 sm:p-8 font-sans">
        
        {/* 2. RECTÁNGULO FLOTANTE: Este es el contenedor "Floating UI" */}
        <main className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 ring-1 ring-black/5 min-h-[85vh] flex flex-col">
          
          {/* Aquí va tu Navbar actual (la de la foto) */}
          {/* Asegúrate de que tu componente Navbar NO tenga 'fixed' ni 'w-full' que rompa el contenedor */}
          <div className="border-b border-gray-100">
             {/* <Navbar />  <-- Tu componente de Navbar va aquí */}
             <header className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                   {/* Tu logo */}
                   <span className="font-bold text-lg">Que precio le pongo</span>
                </div>
                <button className="text-sm text-gray-500 hover:text-gray-900">Salir</button>
             </header>
          </div>

          {/* 3. CONTENIDO ("Lo de abajo") */}
          <div className="flex-1 p-6 sm:p-8 bg-white">
            {children}
          </div>

        </main>
        
      </body>
    </html>
  );
}