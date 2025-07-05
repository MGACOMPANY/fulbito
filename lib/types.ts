export interface Jugador {
  id: number
  nombre: string
  posicion: string
  numero: number
  equipo?: "blanco" | "negro"
}

export interface Partido {
  id: number
  fecha: string
  resultado: {
    blanco: number
    negro: number
  }
  figura: string
  goleadores: string[]
  estado: "pendiente" | "finalizado"
}

export interface Estadisticas {
  tablaGeneral: {
    blanco: {
      partidos: number
      ganados: number
      perdidos: number
      golesFavor: number
      golesContra: number
    }
    negro: {
      partidos: number
      ganados: number
      perdidos: number
      golesFavor: number
      golesContra: number
    }
  }
  goleadores: Array<{
    nombre: string
    goles: number
    equipo: "blanco" | "negro"
  }>
  figuras: Array<{
    nombre: string
    veces: number
  }>
  promedios: Array<{
    nombre: string
    promedio: number
    partidos: number
  }>
}
