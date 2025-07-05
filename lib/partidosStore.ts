"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface PartidoCompleto {
  id: string
  fecha: string
  equipos: {
    blanco: string[]
    negro: string[]
  }
  resultado: {
    blanco: number
    negro: number
  }
  goleadores: {
    blanco: Array<{ jugador: string; goles: number }>
    negro: Array<{ jugador: string; goles: number }>
  }
  figura: string
  puntajes: { [key: string]: number }
  timestamp: string
}

export interface PlantillaFormacion {
  id: string
  nombre: string
  equipoBlanco: string[]
  equipoNegro: string[]
  fechaCreacion: string
}

export interface Estadisticas {
  totalPartidos: number
  victoriasBlanco: number
  victoriasNegro: number
  empates: number
  golesFavorBlanco: number
  golesContraBlanco: number
  golesFavorNegro: number
  golesContraNegro: number
  goleadores: Array<{ nombre: string; goles: number; equipo: string }>
  figuras: Array<{ nombre: string; veces: number }>
  promedios: Array<{ nombre: string; promedio: number; partidos: number }>
}

interface PartidosState {
  partidos: PartidoCompleto[]
  plantillas: PlantillaFormacion[]
  notificaciones: Array<{ id: string; mensaje: string; tipo: "info" | "success" | "warning"; timestamp: string }>
  alineacionActual: {
    equipoBlanco: string[]
    equipoNegro: string[]
    fechaCreacion: string
  } | null
  agregarPartido: (partido: PartidoCompleto) => void
  obtenerEstadisticas: () => Estadisticas
  guardarPlantilla: (plantilla: Omit<PlantillaFormacion, "id" | "fechaCreacion">) => void
  eliminarPlantilla: (id: string) => void
  agregarNotificacion: (mensaje: string, tipo: "info" | "success" | "warning") => void
  eliminarNotificacion: (id: string) => void
  guardarAlineacionActual: (equipoBlanco: string[], equipoNegro: string[]) => void
  obtenerAlineacionActual: () => { equipoBlanco: string[]; equipoNegro: string[] } | null
}

export const usePartidosStore = create<PartidosState>()(
  persist(
    (set, get) => ({
      partidos: [],
      plantillas: [],
      notificaciones: [],
      alineacionActual: null,

      agregarPartido: (partido) => {
        set((state) => ({
          partidos: [...state.partidos, partido],
          notificaciones: [
            ...state.notificaciones,
            {
              id: Date.now().toString(),
              mensaje: `Partido del ${new Date(partido.fecha).toLocaleDateString("es-ES")} guardado exitosamente`,
              tipo: "success",
              timestamp: new Date().toISOString(),
            },
          ],
        }))
      },

      obtenerEstadisticas: () => {
        const { partidos } = get()

        if (partidos.length === 0) {
          return {
            totalPartidos: 0,
            victoriasBlanco: 0,
            victoriasNegro: 0,
            empates: 0,
            golesFavorBlanco: 0,
            golesContraBlanco: 0,
            golesFavorNegro: 0,
            golesContraNegro: 0,
            goleadores: [],
            figuras: [],
            promedios: [],
          }
        }

        const stats: Estadisticas = {
          totalPartidos: partidos.length,
          victoriasBlanco: 0,
          victoriasNegro: 0,
          empates: 0,
          golesFavorBlanco: 0,
          golesContraBlanco: 0,
          golesFavorNegro: 0,
          golesContraNegro: 0,
          goleadores: [],
          figuras: [],
          promedios: [],
        }

        const goleadoresMap = new Map<string, { goles: number; equipo: string }>()
        const figurasMap = new Map<string, number>()
        const puntajesMap = new Map<string, { total: number; partidos: number }>()

        partidos.forEach((partido) => {
          // Resultados
          stats.golesFavorBlanco += partido.resultado.blanco
          stats.golesContraBlanco += partido.resultado.negro
          stats.golesFavorNegro += partido.resultado.negro
          stats.golesContraNegro += partido.resultado.blanco

          if (partido.resultado.blanco > partido.resultado.negro) {
            stats.victoriasBlanco++
          } else if (partido.resultado.negro > partido.resultado.blanco) {
            stats.victoriasNegro++
          } else {
            stats.empates++
          }

          // Goleadores
          partido.goleadores.blanco.forEach((goleador) => {
            const current = goleadoresMap.get(goleador.jugador) || { goles: 0, equipo: "blanco" }
            goleadoresMap.set(goleador.jugador, {
              goles: current.goles + goleador.goles,
              equipo: "blanco",
            })
          })

          partido.goleadores.negro.forEach((goleador) => {
            const current = goleadoresMap.get(goleador.jugador) || { goles: 0, equipo: "negro" }
            goleadoresMap.set(goleador.jugador, {
              goles: current.goles + goleador.goles,
              equipo: "negro",
            })
          })

          // Figuras
          if (partido.figura) {
            figurasMap.set(partido.figura, (figurasMap.get(partido.figura) || 0) + 1)
          }

          // Puntajes
          Object.entries(partido.puntajes).forEach(([jugador, puntaje]) => {
            const current = puntajesMap.get(jugador) || { total: 0, partidos: 0 }
            puntajesMap.set(jugador, {
              total: current.total + puntaje,
              partidos: current.partidos + 1,
            })
          })
        })

        // Convertir mapas a arrays ordenados
        stats.goleadores = Array.from(goleadoresMap.entries())
          .map(([nombre, data]) => ({ nombre, goles: data.goles, equipo: data.equipo }))
          .sort((a, b) => b.goles - a.goles)

        stats.figuras = Array.from(figurasMap.entries())
          .map(([nombre, veces]) => ({ nombre, veces }))
          .sort((a, b) => b.veces - a.veces)

        stats.promedios = Array.from(puntajesMap.entries())
          .map(([nombre, data]) => ({
            nombre,
            promedio: data.total / data.partidos,
            partidos: data.partidos,
          }))
          .sort((a, b) => b.promedio - a.promedio)

        return stats
      },

      guardarPlantilla: (plantilla) => {
        const nuevaPlantilla: PlantillaFormacion = {
          ...plantilla,
          id: Date.now().toString(),
          fechaCreacion: new Date().toISOString(),
        }

        set((state) => ({
          plantillas: [...state.plantillas, nuevaPlantilla],
          notificaciones: [
            ...state.notificaciones,
            {
              id: Date.now().toString(),
              mensaje: `Plantilla "${plantilla.nombre}" guardada exitosamente`,
              tipo: "success",
              timestamp: new Date().toISOString(),
            },
          ],
        }))
      },

      eliminarPlantilla: (id) => {
        set((state) => ({
          plantillas: state.plantillas.filter((p) => p.id !== id),
        }))
      },

      agregarNotificacion: (mensaje, tipo) => {
        set((state) => ({
          notificaciones: [
            ...state.notificaciones,
            {
              id: Date.now().toString(),
              mensaje,
              tipo,
              timestamp: new Date().toISOString(),
            },
          ],
        }))
      },

      eliminarNotificacion: (id) => {
        set((state) => ({
          notificaciones: state.notificaciones.filter((n) => n.id !== id),
        }))
      },

      guardarAlineacionActual: (equipoBlanco, equipoNegro) => {
        set((state) => ({
          alineacionActual: {
            equipoBlanco: equipoBlanco.filter(Boolean),
            equipoNegro: equipoNegro.filter(Boolean),
            fechaCreacion: new Date().toISOString(),
          },
          notificaciones: [
            ...state.notificaciones,
            {
              id: Date.now().toString(),
              mensaje: "Alineación guardada y lista para usar en Admin",
              tipo: "success",
              timestamp: new Date().toISOString(),
            },
          ],
        }))
      },

      obtenerAlineacionActual: () => {
        const { alineacionActual } = get()
        return alineacionActual
      },
    }),
    {
      name: "futbol-partidos-storage",
    },
  ),
)
