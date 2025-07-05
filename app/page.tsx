"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Trophy, TrendingUp, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/ThemeToggle"
import { usePartidosStore } from "@/lib/partidosStore"
import { useCalendarStore } from "@/lib/calendarService"
import NotificationCenter from "@/components/NotificationCenter"
import CalendarWidget from "@/components/CalendarWidget"

// Calcular el próximo jueves correctamente - SOLO JUEVES
const getNextThursday = () => {
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

const nextMatch = {
  date: getNextThursday(),
  time: "20:00",
  location: "SB5, Parque Sarmiento",
}

export default function HomePage() {
  const { obtenerEstadisticas } = usePartidosStore()
  const { obtenerProximosPartidos } = useCalendarStore()
  const stats = obtenerEstadisticas()
  const proximosPartidos = obtenerProximosPartidos()

  return (
    <div className="min-h-screen gradient-green transition-all duration-300">
      <NotificationCenter />
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          className="header-mobile mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex-1"></div>
            <div className="flex flex-col items-center">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-2 text-glow text-responsive">
                ⚽ <span className="gradient-text">FÚTBOL 8</span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-white/90">
                <span className="text-base sm:text-lg lg:text-xl font-semibold">BLANCO</span>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold">VS</span>
                <span className="text-base sm:text-lg lg:text-xl font-semibold">NEGRO</span>
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <ThemeToggle />
            </div>
          </div>
          <p className="text-white/80 text-sm sm:text-base">Gestión de partidos semanales entre amigos</p>
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="nav-mobile mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/alineaciones">
            <Button className="glass modern-button text-white hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2 touch-target">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Alineaciones
            </Button>
          </Link>
          <Link href="/partidos">
            <Button className="glass modern-button text-white hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2 touch-target">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Historial
            </Button>
          </Link>
          <Link href="/estadisticas">
            <Button className="glass modern-button text-white hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2 touch-target">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Estadísticas
            </Button>
          </Link>
          <Link href="/admin">
            <Button className="gradient-orange modern-button text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm px-3 sm:px-4 py-2 touch-target">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Admin
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Próximo Partido */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="glass card-hover card-mobile border-0 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white dark:text-gray-100">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  {proximosPartidos.length > 0 ? "Próximo Partido Programado" : "Próximo Partido - Jueves"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {proximosPartidos.length > 0 ? (
                  // Mostrar partido programado
                  <>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="font-semibold text-white/90 dark:text-gray-300 text-sm sm:text-base">
                        Fecha:
                      </span>
                      <span className="text-sm sm:text-base font-medium text-white dark:text-gray-100">
                        {new Date(proximosPartidos[0].fecha).toLocaleDateString("es-ES", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="font-semibold text-white/90 dark:text-gray-300 flex items-center gap-1 text-sm sm:text-base">
                        <Clock className="w-4 h-4" />
                        Hora:
                      </span>
                      <span className="text-sm sm:text-base font-medium text-white dark:text-gray-100">
                        {proximosPartidos[0].hora}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="font-semibold text-white/90 dark:text-gray-300 flex items-center gap-1 text-sm sm:text-base">
                        <MapPin className="w-4 h-4" />
                        Lugar:
                      </span>
                      <span className="text-sm sm:text-base font-medium text-white dark:text-gray-100">
                        {proximosPartidos[0].lugar}
                      </span>
                    </div>
                  </>
                ) : (
                  // Mostrar próximo jueves por defecto
                  <>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="font-semibold text-white/90 dark:text-gray-300 text-sm sm:text-base">
                        Fecha:
                      </span>
                      <span className="text-sm sm:text-base font-medium text-white dark:text-gray-100">
                        {new Date(nextMatch.date).toLocaleDateString("es-ES", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="font-semibold text-white/90 dark:text-gray-300 flex items-center gap-1 text-sm sm:text-base">
                        <Clock className="w-4 h-4" />
                        Hora:
                      </span>
                      <span className="text-sm sm:text-base font-medium text-white dark:text-gray-100">
                        {nextMatch.time}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="font-semibold text-white/90 dark:text-gray-300 flex items-center gap-1 text-sm sm:text-base">
                        <MapPin className="w-4 h-4" />
                        Lugar:
                      </span>
                      <span className="text-sm sm:text-base font-medium text-white dark:text-gray-100">
                        {nextMatch.location}
                      </span>
                    </div>
                  </>
                )}
                <Link href="/alineaciones" className="block">
                  <Button className="w-full mt-4 gradient-blue modern-button text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 touch-target">
                    Ver Alineaciones
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Estadísticas del Torneo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="glass card-hover card-mobile border-0 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white dark:text-gray-100">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Estadísticas del Torneo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 glass rounded-lg touch-target">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-400">{stats.totalPartidos}</div>
                    <div className="text-xs sm:text-sm text-white/80 dark:text-gray-300 font-medium">
                      Partidos Jugados
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 glass rounded-lg touch-target">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{stats.victoriasBlanco}</div>
                    <div className="text-xs sm:text-sm text-white/80 dark:text-gray-300 font-medium">
                      Victorias Blanco
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 glass rounded-lg touch-target">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-300">{stats.victoriasNegro}</div>
                    <div className="text-xs sm:text-sm text-white/80 dark:text-gray-300 font-medium">
                      Victorias Negro
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 glass rounded-lg touch-target">
                    <div className="text-sm sm:text-lg font-bold text-green-400">
                      {stats.goleadores.length > 0 ? stats.goleadores[0].nombre : "-"}
                    </div>
                    <div className="text-xs sm:text-sm text-white/80 dark:text-gray-300 font-medium">
                      {stats.goleadores.length > 0 ? `${stats.goleadores[0].goles} goles` : "0 goles"}
                    </div>
                  </div>
                </div>

                {stats.totalPartidos === 0 && (
                  <div className="text-center mt-4 p-4 glass rounded-lg">
                    <p className="text-white/80 text-sm">
                      ¡Aún no hay partidos jugados! Ve al panel de administración para cargar el primer resultado.
                    </p>
                    <Link href="/admin" className="inline-block mt-2">
                      <Button className="gradient-orange text-white text-sm touch-target">Cargar Primer Partido</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Calendario de Partidos */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6"
        >
          <CalendarWidget />
        </motion.div>

        {/* Resumen rápido si hay partidos */}
        {stats.totalPartidos > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6"
          >
            <Card className="glass card-hover card-mobile border-0 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white dark:text-gray-100">
                  <Trophy className="w-5 h-5 text-orange-400" />
                  Resumen del Torneo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center touch-target">
                    <div className="text-lg font-bold text-yellow-400">
                      {stats.figuras.length > 0 ? stats.figuras[0].nombre : "-"}
                    </div>
                    <div className="text-sm text-white/80">
                      Figura más destacada ({stats.figuras.length > 0 ? stats.figuras[0].veces : 0} veces)
                    </div>
                  </div>
                  <div className="text-center touch-target">
                    <div className="text-lg font-bold text-green-400">
                      {stats.promedios.length > 0 ? stats.promedios[0].promedio.toFixed(1) : "-"}
                    </div>
                    <div className="text-sm text-white/80">
                      Mejor promedio ({stats.promedios.length > 0 ? stats.promedios[0].nombre : "-"})
                    </div>
                  </div>
                  <div className="text-center touch-target">
                    <div className="text-lg font-bold text-blue-400">
                      {stats.golesFavorBlanco + stats.golesFavorNegro}
                    </div>
                    <div className="text-sm text-white/80">Total de goles</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
