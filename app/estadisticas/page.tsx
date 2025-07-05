"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Target, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/ThemeToggle"
import { usePartidosStore } from "@/lib/partidosStore"

export default function EstadisticasPage() {
  const { obtenerEstadisticas } = usePartidosStore()
  const estadisticas = obtenerEstadisticas()

  return (
    <div className="min-h-screen gradient-green dark:gradient-green-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="dark:bg-gray-800/90 dark:hover:bg-gray-800 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white dark:text-white">Estadísticas del Torneo</h1>
          </div>
          <ThemeToggle />
        </div>

        {estadisticas.totalPartidos === 0 && (
          <motion.div
            className="col-span-full text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-white mb-4">¡Sin estadísticas aún!</h2>
            <p className="text-white/80 mb-6">Las estadísticas aparecerán cuando se jueguen los primeros partidos.</p>
            <Link href="/admin">
              <Button className="gradient-orange text-white font-semibold shadow-lg hover:shadow-xl">
                Configurar Primer Partido
              </Button>
            </Link>
          </motion.div>
        )}

        {estadisticas.totalPartidos > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tabla General */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Tabla General
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded"></div>
                        <span className="font-semibold">Equipo Blanco</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{estadisticas.victoriasBlanco}W</div>
                        <div className="text-xs text-gray-500">
                          {estadisticas.golesFavorBlanco}-{estadisticas.golesContraBlanco}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-900 rounded"></div>
                        <span className="font-semibold">Equipo Negro</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{estadisticas.victoriasNegro}W</div>
                        <div className="text-xs text-gray-500">
                          {estadisticas.golesFavorNegro}-{estadisticas.golesContraNegro}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Goleadores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Tabla de Goleadores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {estadisticas.goleadores.slice(0, 10).map((goleador, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded ${goleador.equipo === "blanco" ? "bg-gray-100 border border-gray-300" : "bg-gray-900"}`}
                            ></div>
                            <span className="font-medium">{goleador.nombre}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">{goleador.goles} goles</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Figuras del Partido */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Figuras del Partido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {estadisticas.figuras.slice(0, 10).map((figura, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{figura.nombre}</span>
                        </div>
                        <Badge variant="secondary">{figura.veces} veces</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Promedios */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Promedio de Puntajes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {estadisticas.promedios.slice(0, 10).map((jugador, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <span className="font-medium">{jugador.nombre}</span>
                            <div className="text-xs text-gray-500">{jugador.partidos} partidos</div>
                          </div>
                        </div>
                        <Badge variant="secondary">{jugador.promedio.toFixed(1)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
