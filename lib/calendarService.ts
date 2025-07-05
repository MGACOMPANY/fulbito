"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface PartidoProgramado {
  id: string
  fecha: string
  hora: string
  lugar: string
  descripcion?: string
  recordatorio: boolean
  notificado: boolean
  createdAt: string
}

interface CalendarState {
  partidosProgramados: PartidoProgramado[]
  agregarPartidoProgramado: (partido: Omit<PartidoProgramado, "id" | "notificado" | "createdAt">) => void
  eliminarPartidoProgramado: (id: string) => void
  marcarComoNotificado: (id: string) => void
  obtenerProximosPartidos: () => PartidoProgramado[]
  obtenerPartidosHoy: () => PartidoProgramado[]
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      partidosProgramados: [],

      agregarPartidoProgramado: (partido) => {
        const nuevoPartido: PartidoProgramado = {
          ...partido,
          id: Date.now().toString(),
          notificado: false,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          partidosProgramados: [...state.partidosProgramados, nuevoPartido],
        }))

        // Programar recordatorio si está habilitado
        if (partido.recordatorio) {
          scheduleNotification(nuevoPartido)
        }
      },

      eliminarPartidoProgramado: (id) => {
        set((state) => ({
          partidosProgramados: state.partidosProgramados.filter((p) => p.id !== id),
        }))
      },

      marcarComoNotificado: (id) => {
        set((state) => ({
          partidosProgramados: state.partidosProgramados.map((p) => (p.id === id ? { ...p, notificado: true } : p)),
        }))
      },

      obtenerProximosPartidos: () => {
        const { partidosProgramados } = get()
        const ahora = new Date()

        return partidosProgramados
          .filter((partido) => new Date(`${partido.fecha}T${partido.hora}`) > ahora)
          .sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime())
          .slice(0, 5)
      },

      obtenerPartidosHoy: () => {
        const { partidosProgramados } = get()
        const hoy = new Date().toISOString().split("T")[0]

        return partidosProgramados.filter((partido) => partido.fecha === hoy)
      },
    }),
    {
      name: "futbol-calendar-storage",
    },
  ),
)

// Función para programar notificaciones
function scheduleNotification(partido: PartidoProgramado) {
  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones")
    return
  }

  // Solicitar permisos si no los tenemos
  if (Notification.permission === "default") {
    Notification.requestPermission()
  }

  const fechaPartido = new Date(`${partido.fecha}T${partido.hora}`)
  const ahora = new Date()
  const tiempoHastaPartido = fechaPartido.getTime() - ahora.getTime()

  // Notificar 1 hora antes
  const tiempoNotificacion = tiempoHastaPartido - 60 * 60 * 1000

  if (tiempoNotificacion > 0) {
    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("⚽ Partido de Fútbol 8", {
          body: `Partido en 1 hora - ${partido.lugar}`,
          icon: "/favicon.ico",
        })

        // Marcar como notificado
        useCalendarStore.getState().marcarComoNotificado(partido.id)
      }
    }, tiempoNotificacion)
  }
}

// Servicio para gestionar el calendario
class CalendarService {
  // Obtener el próximo jueves - SOLO JUEVES
  getNextThursday(): string {
    const today = new Date()
    const currentDay = today.getDay() // 0 = domingo, 1 = lunes, ..., 4 = jueves

    let daysUntilThursday

    if (currentDay === 4) {
      // Si es jueves, verificar la hora
      const currentHour = today.getHours()
      if (currentHour < 20) {
        // Si es antes de las 8 PM, es hoy
        daysUntilThursday = 0
      } else {
        // Si es después de las 8 PM, el próximo jueves
        daysUntilThursday = 7
      }
    } else if (currentDay < 4) {
      // Si estamos antes del jueves (lunes, martes, miércoles)
      daysUntilThursday = 4 - currentDay
    } else {
      // Si estamos después del jueves (viernes, sábado, domingo)
      daysUntilThursday = 7 - currentDay + 4
    }

    const nextThursday = new Date(today)
    nextThursday.setDate(today.getDate() + daysUntilThursday)
    return nextThursday.toISOString().split("T")[0]
  }

  // Programar partido automático para el próximo jueves
  programarProximoJueves(): void {
    const { agregarPartidoProgramado } = useCalendarStore.getState()

    agregarPartidoProgramado({
      fecha: this.getNextThursday(),
      hora: "20:00",
      lugar: "SB5, Parque Sarmiento",
      descripcion: "Partido semanal de fútbol 8",
      recordatorio: true,
    })
  }

  // Verificar recordatorios pendientes
  checkPendingReminders(): void {
    const { partidosProgramados } = useCalendarStore.getState()
    const ahora = new Date()

    partidosProgramados.forEach((partido) => {
      if (!partido.notificado && partido.recordatorio) {
        const fechaPartido = new Date(`${partido.fecha}T${partido.hora}`)
        const tiempoHastaPartido = fechaPartido.getTime() - ahora.getTime()

        // Si falta menos de 1 hora y no se ha notificado
        if (tiempoHastaPartido <= 60 * 60 * 1000 && tiempoHastaPartido > 0) {
          scheduleNotification(partido)
        }
      }
    })
  }

  // Inicializar servicio de calendario
  init(): void {
    // Solicitar permisos de notificación
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    // Verificar recordatorios cada minuto
    setInterval(() => {
      this.checkPendingReminders()
    }, 60000)

    console.log("📅 Servicio de calendario inicializado")
  }
}

export const calendarService = new CalendarService()
