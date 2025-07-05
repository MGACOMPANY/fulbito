"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/ThemeToggle"
import { usePartidosStore } from "@/lib/partidosStore"

export default function PartidosPage() {
  const { partidos, obtenerEstadisticas } = usePartidosStore()
  const stats = obtenerEstadisticas()

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
            <h1 className="text-3xl font-bold text-white">Historial de Partidos</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPartidos}</div>
              <div className="text-sm text-gray-500">Partidos Jugados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.victoriasBlanco}</div>
              <div className="text-sm text-gray-500">Victorias Blanco</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.victoriasNegro}</div>
              <div className="text-sm text-gray-500">Victorias Negro</div>
            </CardContent>
          </Card>
        </div>

        {partidos.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-white mb-4">¡Historial vacío!</h2>
            <p className="text-white/80 mb-6">Aquí aparecerán todos los partidos jugados con sus resultados.</p>
            <Link href="/admin">
              <Button className="gradient-orange text-white font-semibold shadow-lg hover:shadow-xl">
                Cargar Primer Resultado
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Lista de partidos */}
        <div className="space-y-4">
          {partidos.map((partido, index) => (
            <motion.div
              key={partido.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    {/* Fecha */}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {new Date(partido.fecha).toLocaleDateString("es-ES", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    {/* Resultado */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                          <span className="font-bold text-lg">{partido.resultado.blanco}</span>
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{partido.resultado.negro}</span>
                          <div className="w-4 h-4 bg-gray-900 rounded"></div>
                        </div>
                      </div>
                      <Badge
                        variant={partido.resultado.blanco > partido.resultado.negro ? "secondary" : "outline"}
                        className="mt-1 text-xs"
                      >
                        {partido.resultado.blanco > partido.resultado.negro
                          ? "Victoria Blanco"
                          : partido.resultado.negro > partido.resultado.blanco
                            ? "Victoria Negro"
                            : "Empate"}
                      </Badge>
                    </div>

                    {/* Figura */}
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <div>
                        <div className="text-sm font-medium">{partido.figura}</div>
                        <div className="text-xs text-gray-500">Figura del partido</div>
                      </div>
                    </div>

                    {/* Goleadores */}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <div className="text-sm">
                        <div className="font-medium">Goleadores:</div>
                        <div className="text-xs text-gray-600">
                          {[...partido.goleadores.blanco, ...partido.goleadores.negro].map((g) => g.jugador).join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
