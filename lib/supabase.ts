import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript
export interface Jugador {
  id: number
  nombre: string
  created_at: string
}

export interface Partido {
  id: number
  fecha: string
  goles_blanco: number
  goles_negro: number
  figura_partido: string | null
  estado: string
  created_at: string
}

export interface Alineacion {
  id: number
  partido_id: number
  jugador_id: number
  equipo: "blanco" | "negro"
  posicion: string
  numero: number
  created_at: string
  jugadores?: Jugador
}

export interface Gol {
  id: number
  partido_id: number
  jugador_id: number
  cantidad: number
  created_at: string
  jugadores?: Jugador
}

export interface Puntaje {
  id: number
  partido_id: number
  jugador_id: number
  puntaje: number
  created_at: string
  jugadores?: Jugador
}
