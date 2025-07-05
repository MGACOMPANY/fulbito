"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PastePlayerList from "@/components/PastePlayerList"
import { ThemeToggle } from "@/components/ThemeToggle"
import BackupManager from "@/components/BackupManager"
import { usePartidosStore, type PartidoCompleto } from "@/lib/partidosStore"
import { backupService } from "@/lib/backupService"
import { calendarService } from "@/lib/calendarService"
import {
  ArrowLeft,
  Users,
  Trophy,
  Target,
  Star,
  UserCheck,
  X,
  Plus,
  Minus,
  Save,
  Smartphone,
  CheckCircle,
  BookOpen,
  Trash2,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const POSICIONES = [
  "Arquero",
  "Defensa 1",
  "Defensa 2",
  "Defensa 3",
  "Mediocampo 1",
  "Mediocampo 2",
  "Mediocampo 3",
  "Delantero",
]

interface Goleador {
  jugador: string
  goles: number
}

export default function AdminPage() {
  const [jugadoresDisponibles, setJugadoresDisponibles] = useState<string[]>([])
  const [equipoBlanco, setEquipoBlanco] = useState<string[]>(new Array(8).fill(""))
  const [equipoNegro, setEquipoNegro] = useState<string[]>(new Array(8).fill(""))
  const [resultado, setResultado] = useState({ blanco: 0, negro: 0 })
  const [goleadoresBlanco, setGoleadoresBlanco] = useState<Goleador[]>([])
  const [goleadoresNegro, setGoleadoresNegro] = useState<Goleador[]>([])
  const [figura, setFigura] = useState("")
  const [fechaPartido, setFechaPartido] = useState("")
  const [puntajes, setPuntajes] = useState<{ [key: string]: number }>({})
  const [isMobile, setIsMobile] = useState(false)
  const [partidoGuardado, setPartidoGuardado] = useState(false)
  const [nombrePlantilla, setNombrePlantilla] = useState("")

  const {
    agregarPartido,
    guardarPlantilla,
    plantillas,
    eliminarPlantilla,
    agregarNotificacion,
    obtenerAlineacionActual,
  } = usePartidosStore()

  // Inicializar servicios
  useEffect(() => {
    backupService.startAutoBackup()
    calendarService.init()

    return () => {
      backupService.stopAutoBackup()
    }
  }, [])

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleJugadoresProcesados = (jugadores: string[]) => {
    setJugadoresDisponibles(jugadores)
    setEquipoBlanco(new Array(8).fill(""))
    setEquipoNegro(new Array(8).fill(""))
  }

  const jugadoresSeleccionados = [...equipoBlanco, ...equipoNegro].filter(Boolean)
  const jugadoresLibres = jugadoresDisponibles.filter((jugador) => !jugadoresSeleccionados.includes(jugador))

  const handleEquipoChange = (posicionIndex: number, jugador: string, equipo: "blanco" | "negro") => {
    if (equipo === "blanco") {
      const nuevoEquipo = [...equipoBlanco]
      nuevoEquipo[posicionIndex] = jugador
      setEquipoBlanco(nuevoEquipo)
    } else {
      const nuevoEquipo = [...equipoNegro]
      nuevoEquipo[posicionIndex] = jugador
      setEquipoNegro(nuevoEquipo)
    }
  }

  const removerJugador = (posicionIndex: number, equipo: "blanco" | "negro") => {
    if (equipo === "blanco") {
      const nuevoEquipo = [...equipoBlanco]
      nuevoEquipo[posicionIndex] = ""
      setEquipoBlanco(nuevoEquipo)
    } else {
      const nuevoEquipo = [...equipoNegro]
      nuevoEquipo[posicionIndex] = ""
      setEquipoNegro(nuevoEquipo)
    }
  }

  useEffect(() => {
    const equipoBlancoCompleto = equipoBlanco.every((jugador) => jugador !== "")
    const equipoNegroCompleto = equipoNegro.every((jugador) => jugador !== "")

    if (equipoBlancoCompleto && !equipoNegroCompleto && jugadoresLibres.length === 8) {
      setEquipoNegro([...jugadoresLibres])
    } else if (equipoNegroCompleto && !equipoBlancoCompleto && jugadoresLibres.length === 8) {
      setEquipoBlanco([...jugadoresLibres])
    }
  }, [equipoBlanco, equipoNegro, jugadoresLibres])

  const handlePuntajeChange = (jugador: string, puntaje: number) => {
    setPuntajes((prev) => ({
      ...prev,
      [jugador]: puntaje,
    }))
  }

  // Funciones para manejo de goles y goleadores
  const incrementarGol = (equipo: "blanco" | "negro") => {
    setResultado((prev) => ({
      ...prev,
      [equipo]: prev[equipo] + 1,
    }))
  }

  const decrementarGol = (equipo: "blanco" | "negro") => {
    setResultado((prev) => ({
      ...prev,
      [equipo]: Math.max(0, prev[equipo] - 1),
    }))
  }

  // Actualizar goleadores cuando cambian los goles
  useEffect(() => {
    // Ajustar goleadores del equipo blanco
    const golesBlanco = resultado.blanco
    if (goleadoresBlanco.length > golesBlanco) {
      setGoleadoresBlanco(goleadoresBlanco.slice(0, golesBlanco))
    } else if (goleadoresBlanco.length < golesBlanco) {
      const nuevosGoleadores = [...goleadoresBlanco]
      for (let i = goleadoresBlanco.length; i < golesBlanco; i++) {
        nuevosGoleadores.push({ jugador: "", goles: 1 })
      }
      setGoleadoresBlanco(nuevosGoleadores)
    }

    // Ajustar goleadores del equipo negro
    const golesNegro = resultado.negro
    if (goleadoresNegro.length > golesNegro) {
      setGoleadoresNegro(goleadoresNegro.slice(0, golesNegro))
    } else if (goleadoresNegro.length < golesNegro) {
      const nuevosGoleadores = [...goleadoresNegro]
      for (let i = goleadoresNegro.length; i < golesNegro; i++) {
        nuevosGoleadores.push({ jugador: "", goles: 1 })
      }
      setGoleadoresNegro(nuevosGoleadores)
    }
  }, [resultado.blanco, resultado.negro])

  const handleGoleadorChange = (index: number, jugador: string, equipo: "blanco" | "negro") => {
    if (equipo === "blanco") {
      const nuevosGoleadores = [...goleadoresBlanco]
      nuevosGoleadores[index] = { ...nuevosGoleadores[index], jugador }
      setGoleadoresBlanco(nuevosGoleadores)
    } else {
      const nuevosGoleadores = [...goleadoresNegro]
      nuevosGoleadores[index] = { ...nuevosGoleadores[index], jugador }
      setGoleadoresNegro(nuevosGoleadores)
    }
  }

  const guardarTodoElPartido = () => {
    // Validaciones
    if (!fechaPartido) {
      agregarNotificacion("Por favor selecciona la fecha del partido", "warning")
      return
    }

    if (equipoBlanco.filter(Boolean).length !== 8 || equipoNegro.filter(Boolean).length !== 8) {
      agregarNotificacion("Por favor completa ambos equipos con 8 jugadores cada uno", "warning")
      return
    }

    if (!figura.trim()) {
      agregarNotificacion("Por favor selecciona la figura del partido", "warning")
      return
    }

    // Verificar que todos los goles tengan goleador asignado
    const goleadoresBlancoIncompletos = goleadoresBlanco.some((g) => !g.jugador)
    const goleadoresNegroIncompletos = goleadoresNegro.some((g) => !g.jugador)

    if (goleadoresBlancoIncompletos || goleadoresNegroIncompletos) {
      agregarNotificacion("Por favor asigna todos los goleadores", "warning")
      return
    }

    const partidoCompleto: PartidoCompleto = {
      id: Date.now().toString(),
      fecha: fechaPartido,
      equipos: {
        blanco: equipoBlanco.filter(Boolean),
        negro: equipoNegro.filter(Boolean),
      },
      resultado,
      goleadores: {
        blanco: goleadoresBlanco,
        negro: goleadoresNegro,
      },
      figura,
      puntajes,
      timestamp: new Date().toISOString(),
    }

    agregarPartido(partidoCompleto)
    setPartidoGuardado(true)

    // Limpiar formulario
    setTimeout(() => {
      setFechaPartido("")
      setResultado({ blanco: 0, negro: 0 })
      setGoleadoresBlanco([])
      setGoleadoresNegro([])
      setFigura("")
      setPuntajes({})
      setPartidoGuardado(false)
    }, 2000)
  }

  const handleGuardarPlantilla = () => {
    if (!nombrePlantilla.trim()) {
      agregarNotificacion("Por favor ingresa un nombre para la plantilla", "warning")
      return
    }

    if (equipoBlanco.filter(Boolean).length !== 8 || equipoNegro.filter(Boolean).length !== 8) {
      agregarNotificacion("Por favor completa ambos equipos antes de guardar la plantilla", "warning")
      return
    }

    guardarPlantilla({
      nombre: nombrePlantilla,
      equipoBlanco: equipoBlanco.filter(Boolean),
      equipoNegro: equipoNegro.filter(Boolean),
    })

    setNombrePlantilla("")
  }

  const cargarPlantilla = (plantilla: any) => {
    setEquipoBlanco([...plantilla.equipoBlanco])
    setEquipoNegro([...plantilla.equipoNegro])
    agregarNotificacion(`Plantilla "${plantilla.nombre}" cargada exitosamente`, "success")
  }

  const jugadoresEnPartido = [...new Set([...equipoBlanco, ...equipoNegro])].filter(Boolean)

  // Verificar si el partido está completo
  const partidoCompleto =
    fechaPartido &&
    equipoBlanco.filter(Boolean).length === 8 &&
    equipoNegro.filter(Boolean).length === 8 &&
    figura.trim() &&
    !goleadoresBlanco.some((g) => !g.jugador) &&
    !goleadoresNegro.some((g) => !g.jugador)

  // Agregar useEffect para cargar alineación actual:
  useEffect(() => {
    // Cargar alineación actual si existe
    const alineacionActual = obtenerAlineacionActual()
    if (alineacionActual && jugadoresDisponibles.length === 0) {
      const todosLosJugadores = [...alineacionActual.equipoBlanco, ...alineacionActual.equipoNegro]
      setJugadoresDisponibles(todosLosJugadores)
      setEquipoBlanco([...alineacionActual.equipoBlanco])
      setEquipoNegro([...alineacionActual.equipoNegro])
    }
  }, [])

  return (
    <div className="min-h-screen gradient-green transition-all duration-300">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="glass modern-button text-white hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-glow">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-2">
            {partidoGuardado && (
              <Badge variant="outline" className="glass text-green-300 border-green-400/50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Guardado
              </Badge>
            )}
            {isMobile && (
              <Badge variant="outline" className="glass text-white border-white/30">
                <Smartphone className="w-3 h-3 mr-1" />
                Móvil
              </Badge>
            )}
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Botón de Guardar Todo - Fijo en la parte superior */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${partidoCompleto ? "bg-green-400" : "bg-yellow-400"} animate-pulse`}
                  ></div>
                  <div>
                    <h3 className="font-semibold text-white">Estado del Partido</h3>
                    <p className="text-sm text-white/80">
                      {partidoCompleto ? "Listo para guardar" : "Completa todos los datos"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={guardarTodoElPartido}
                  disabled={!partidoCompleto}
                  className={`modern-button font-semibold shadow-lg h-12 px-6 ${
                    partidoCompleto
                      ? "gradient-blue text-white hover:shadow-xl"
                      : "bg-gray-600 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Partido Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="jugadores" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-6 glass p-1 h-auto">
              <TabsTrigger
                value="jugadores"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
              >
                <Users className="w-4 h-4" />
                <span className="hidden xs:inline">Jugadores</span>
              </TabsTrigger>
              <TabsTrigger
                value="equipos"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
              >
                <Target className="w-4 h-4" />
                <span className="hidden xs:inline">Equipos</span>
              </TabsTrigger>
              <TabsTrigger
                value="plantillas"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden xs:inline">Plantillas</span>
              </TabsTrigger>
              <TabsTrigger
                value="resultados"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden xs:inline">Resultados</span>
              </TabsTrigger>
              <TabsTrigger
                value="puntajes"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
              >
                <Star className="w-4 h-4" />
                <span className="hidden xs:inline">Puntajes</span>
              </TabsTrigger>
              <TabsTrigger
                value="backup"
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 text-xs sm:text-sm"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden xs:inline">Backup</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Jugadores */}
            <TabsContent value="jugadores">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="glass card-hover border-0 shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white dark:text-gray-100 flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Cargar Jugadores desde WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PastePlayerList onJugadoresProcesados={handleJugadoresProcesados} />
                    {obtenerAlineacionActual() && (
                      <motion.div
                        className="mt-4 p-4 glass rounded-lg border border-blue-400/30"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-blue-300">Alineación Guardada Disponible</h3>
                            <p className="text-blue-200 text-sm">
                              Tienes una alineación guardada desde la página de Alineaciones
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              const alineacion = obtenerAlineacionActual()
                              if (alineacion) {
                                const todosLosJugadores = [...alineacion.equipoBlanco, ...alineacion.equipoNegro]
                                setJugadoresDisponibles(todosLosJugadores)
                                setEquipoBlanco([...alineacion.equipoBlanco])
                                setEquipoNegro([...alineacion.equipoNegro])
                                agregarNotificacion("Alineación cargada desde la formación guardada", "success")
                              }
                            }}
                            className="gradient-blue text-white font-semibold"
                          >
                            Cargar Alineación
                          </Button>
                        </div>
                        <div className="text-xs text-blue-200">
                          Equipos: {obtenerAlineacionActual()?.equipoBlanco.length || 0} vs{" "}
                          {obtenerAlineacionActual()?.equipoNegro.length || 0} jugadores
                        </div>
                      </motion.div>
                    )}

                    {jugadoresDisponibles.length > 0 && (
                      <motion.div
                        className="mt-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-white dark:text-gray-100">
                            Jugadores Disponibles ({jugadoresDisponibles.length})
                          </h3>
                          <div className="text-sm text-white/80 dark:text-gray-300">
                            Seleccionados: {jugadoresSeleccionados.length} | Libres: {jugadoresLibres.length}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {jugadoresDisponibles.map((jugador, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={`text-sm glass border-white/30 dark:border-gray-600/50 transition-all duration-300 ${
                                jugadoresSeleccionados.includes(jugador)
                                  ? "bg-green-500/20 text-green-300 border-green-400/50"
                                  : "text-white dark:text-gray-300"
                              }`}
                            >
                              {jugador}
                              {jugadoresSeleccionados.includes(jugador) && <span className="ml-1">✓</span>}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Tab Equipos */}
            <TabsContent value="equipos">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
              >
                {/* Equipo Blanco */}
                <Card className="glass card-hover border-0 shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between text-white dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white/80 border border-gray-300 rounded"></div>
                        Equipo Blanco
                      </div>
                      <Badge variant="outline" className="glass text-white border-white/30">
                        {equipoBlanco.filter(Boolean).length}/8
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/80 dark:text-gray-300 mb-4">
                      Selecciona 8 jugadores para el equipo blanco
                    </p>
                    <div className="space-y-3">
                      {POSICIONES.map((posicion, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3"
                        >
                          <Label className="w-full sm:w-24 text-xs text-white dark:text-gray-300 font-medium">
                            {posicion}
                          </Label>
                          <div className="flex-1 flex items-center gap-2">
                            {equipoBlanco[index] ? (
                              <div className="flex items-center gap-2 glass p-2 rounded flex-1">
                                <span className="text-white dark:text-gray-300 flex-1">{equipoBlanco[index]}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removerJugador(index, "blanco")}
                                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Select onValueChange={(value) => handleEquipoChange(index, value, "blanco")}>
                                <SelectTrigger className="flex-1 modern-select text-white dark:text-gray-300">
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                  {jugadoresLibres.map((jugador, idx) => (
                                    <SelectItem key={idx} value={jugador}>
                                      {jugador}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Equipo Negro */}
                <Card className="glass card-hover border-0 shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between text-white dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-800 rounded"></div>
                        Equipo Negro
                      </div>
                      <Badge variant="outline" className="glass text-white border-white/30">
                        {equipoNegro.filter(Boolean).length}/8
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/80 dark:text-gray-300 mb-4">
                      Selecciona 8 jugadores para el equipo negro
                    </p>
                    <div className="space-y-3">
                      {POSICIONES.map((posicion, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3"
                        >
                          <Label className="w-full sm:w-24 text-xs text-white dark:text-gray-300 font-medium">
                            {posicion}
                          </Label>
                          <div className="flex-1 flex items-center gap-2">
                            {equipoNegro[index] ? (
                              <div className="flex items-center gap-2 glass p-2 rounded flex-1">
                                <span className="text-white dark:text-gray-300 flex-1">{equipoNegro[index]}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removerJugador(index, "negro")}
                                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Select onValueChange={(value) => handleEquipoChange(index, value, "negro")}>
                                <SelectTrigger className="flex-1 modern-select text-white dark:text-gray-300">
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                  {jugadoresLibres.map((jugador, idx) => (
                                    <SelectItem key={idx} value={jugador}>
                                      {jugador}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Indicador de progreso */}
              {jugadoresDisponibles.length === 16 && (
                <motion.div
                  className="mt-6 p-4 glass rounded-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Progreso de selección</span>
                    <span className="text-white/80">{jugadoresSeleccionados.length}/16 jugadores</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(jugadoresSeleccionados.length / 16) * 100}%` }}
                    ></div>
                  </div>
                  {jugadoresSeleccionados.length === 16 && (
                    <p className="text-green-300 text-sm mt-2 flex items-center gap-2">
                      <span>✅</span>
                      ¡Todos los jugadores han sido asignados!
                    </p>
                  )}
                </motion.div>
              )}
            </TabsContent>

            {/* Tab Plantillas */}
            <TabsContent value="plantillas">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="space-y-6">
                  {/* Guardar nueva plantilla */}
                  <Card className="glass card-hover border-0 shadow-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-white dark:text-gray-100 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Guardar Plantilla de Formación
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nombre de la plantilla (ej: Formación Clásica)"
                          value={nombrePlantilla}
                          onChange={(e) => setNombrePlantilla(e.target.value)}
                          className="modern-input text-white dark:text-gray-300"
                        />
                        <Button
                          onClick={handleGuardarPlantilla}
                          disabled={!nombrePlantilla.trim() || jugadoresSeleccionados.length !== 16}
                          className="gradient-blue modern-button text-white font-semibold"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>
                      </div>
                      {jugadoresSeleccionados.length !== 16 && (
                        <p className="text-yellow-300 text-sm">
                          ⚠️ Completa ambos equipos (16 jugadores) antes de guardar la plantilla
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Lista de plantillas */}
                  <Card className="glass card-hover border-0 shadow-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-white dark:text-gray-100 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Plantillas Guardadas ({plantillas.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {plantillas.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4">📋</div>
                          <p className="text-white/80 dark:text-gray-300">
                            Aún no tienes plantillas guardadas. Crea tu primera plantilla configurando los equipos.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {plantillas.map((plantilla) => (
                            <div key={plantilla.id} className="glass p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white">{plantilla.nombre}</h3>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => eliminarPlantilla(plantilla.id)}
                                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="text-sm text-white/80 mb-3">
                                Creada: {new Date(plantilla.fechaCreacion).toLocaleDateString("es-ES")}
                              </div>
                              <div className="space-y-2 mb-4">
                                <div className="text-xs">
                                  <span className="text-white/60">Blanco:</span>{" "}
                                  <span className="text-white">{plantilla.equipoBlanco.slice(0, 3).join(", ")}...</span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-white/60">Negro:</span>{" "}
                                  <span className="text-white">{plantilla.equipoNegro.slice(0, 3).join(", ")}...</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => cargarPlantilla(plantilla)}
                                className="w-full gradient-orange text-white font-semibold"
                              >
                                Cargar Plantilla
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            {/* Tab Resultados - Completamente rediseñado */}
            <TabsContent value="resultados">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="space-y-6">
                  {/* Fecha del partido */}
                  <Card className="glass card-hover border-0 shadow-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-white dark:text-gray-100 flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Información del Partido
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label className="text-base font-semibold text-white dark:text-gray-100">
                          Fecha del Partido
                        </Label>
                        <Input
                          type="date"
                          value={fechaPartido}
                          onChange={(e) => setFechaPartido(e.target.value)}
                          className="mt-2 modern-input text-white dark:text-gray-300"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resultado y Goleadores */}
                  <Card className="glass card-hover border-0 shadow-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-white dark:text-gray-100 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Resultado y Goleadores
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Equipo Blanco */}
                      <div className="glass p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white/80 border border-gray-300 rounded"></div>
                            <span className="text-white font-medium text-lg">Equipo Blanco</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => decrementarGol("blanco")}
                              className="glass h-10 w-10 p-0 text-white border-white/30"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-3xl font-bold text-white min-w-[3rem] text-center">
                              {resultado.blanco}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => incrementarGol("blanco")}
                              className="glass h-10 w-10 p-0 text-white border-white/30"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Goleadores Blanco */}
                        {goleadoresBlanco.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-white/90">Goleadores:</Label>
                            {goleadoresBlanco.map((goleador, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="text-white text-sm">Gol {index + 1}:</span>
                                <Select
                                  value={goleador.jugador}
                                  onValueChange={(value) => handleGoleadorChange(index, value, "blanco")}
                                >
                                  <SelectTrigger className="flex-1 modern-select text-white dark:text-gray-300">
                                    <SelectValue placeholder="Seleccionar goleador..." />
                                  </SelectTrigger>
                                  <SelectContent className="glass">
                                    {equipoBlanco.filter(Boolean).map((jugador, idx) => (
                                      <SelectItem key={idx} value={jugador}>
                                        {jugador}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Equipo Negro */}
                      <div className="glass p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-800 rounded"></div>
                            <span className="text-white font-medium text-lg">Equipo Negro</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => decrementarGol("negro")}
                              className="glass h-10 w-10 p-0 text-white border-white/30"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-3xl font-bold text-white min-w-[3rem] text-center">
                              {resultado.negro}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => incrementarGol("negro")}
                              className="glass h-10 w-10 p-0 text-white border-white/30"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Goleadores Negro */}
                        {goleadoresNegro.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-white/90">Goleadores:</Label>
                            {goleadoresNegro.map((goleador, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="text-white text-sm">Gol {index + 1}:</span>
                                <Select
                                  value={goleador.jugador}
                                  onValueChange={(value) => handleGoleadorChange(index, value, "negro")}
                                >
                                  <SelectTrigger className="flex-1 modern-select text-white dark:text-gray-300">
                                    <SelectValue placeholder="Seleccionar goleador..." />
                                  </SelectTrigger>
                                  <SelectContent className="glass">
                                    {equipoNegro.filter(Boolean).map((jugador, idx) => (
                                      <SelectItem key={idx} value={jugador}>
                                        {jugador}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Figura del partido */}
                  <Card className="glass card-hover border-0 shadow-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-white dark:text-gray-100 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        Figura del Partido
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={figura} onValueChange={setFigura}>
                        <SelectTrigger className="modern-select text-white dark:text-gray-300">
                          <SelectValue placeholder="Seleccionar figura del partido..." />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          {jugadoresEnPartido.map((jugador, idx) => (
                            <SelectItem key={idx} value={jugador}>
                              {jugador}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            {/* Tab Puntajes */}
            <TabsContent value="puntajes">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="glass card-hover border-0 shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-white dark:text-gray-100">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Puntajes de Jugadores (1-10)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {jugadoresEnPartido.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">⚽</div>
                        <p className="text-white/80 dark:text-gray-300">
                          Primero configura los equipos para poder asignar puntajes
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Equipo Blanco */}
                        {equipoBlanco.filter(Boolean).length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
                              <div className="w-4 h-4 bg-white/80 border border-gray-300 rounded"></div>
                              Equipo Blanco ({equipoBlanco.filter(Boolean).length} jugadores)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                              {equipoBlanco.filter(Boolean).map((jugador) => (
                                <div key={jugador} className="glass p-3 sm:p-4 rounded-lg">
                                  <Label className="block font-medium text-white dark:text-gray-300 mb-2 text-sm">
                                    {jugador}
                                  </Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={puntajes[jugador] || ""}
                                    onChange={(e) =>
                                      handlePuntajeChange(jugador, Number.parseFloat(e.target.value) || 0)
                                    }
                                    className="modern-input text-center text-white dark:text-gray-300"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Equipo Negro */}
                        {equipoNegro.filter(Boolean).length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-white dark:text-gray-100 mb-4 flex items-center gap-2">
                              <div className="w-4 h-4 bg-gray-800 rounded"></div>
                              Equipo Negro ({equipoNegro.filter(Boolean).length} jugadores)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                              {equipoNegro.filter(Boolean).map((jugador) => (
                                <div key={jugador} className="glass p-3 sm:p-4 rounded-lg">
                                  <Label className="block font-medium text-white dark:text-gray-300 mb-2 text-sm">
                                    {jugador}
                                  </Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    step="0.1"
                                    placeholder="0.0"
                                    value={puntajes[jugador] || ""}
                                    onChange={(e) =>
                                      handlePuntajeChange(jugador, Number.parseFloat(e.target.value) || 0)
                                    }
                                    className="modern-input text-center text-white dark:text-gray-300"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-6 p-4 glass rounded-lg">
                          <p className="text-sm text-blue-200 dark:text-blue-300">
                            💡 <strong>Tip:</strong> Los puntajes van del 1 al 10. Puedes usar decimales (ej: 8.5)
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Tab Backup */}
            <TabsContent value="backup">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <BackupManager />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
