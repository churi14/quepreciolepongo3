import { createClient } from '@supabase/supabase-js'

// 1. Intentamos leer las claves
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 2. Validación silenciosa para el Build
// Si no hay claves (ej: durante el build), usamos valores falsos para que no explote.
// En producción (cuando la gente la use), Vercel pondrá las claves reales.
const url = supabaseUrl || "https://placeholder.supabase.co"
const key = supabaseAnonKey || "placeholder-key"

// 3. Crear el cliente
export const supabase = createClient(url, key)