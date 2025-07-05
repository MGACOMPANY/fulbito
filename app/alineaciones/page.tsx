"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import CanchaFormation from "@/components/CanchaFormation"
import PastePlayerList from "@/components/PastePlayerList"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, ArrowLeft, Users, Save, Send, UserPlus } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"
import { usePartidosStore } from "@/lib/partidosStore"

const POSICIONES = ["arquero", "defensa", "defensa", "defensa", "mediocampo", "mediocampo", "mediocampo", "delantero"]

export default function AlineacionesPage() {
  /* ======================  State  ====================================== */
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<"blanco" | "negro" | "ambos">("ambos")

  const [equipoBlanco, setEquipoBlanco] = useState<string[]>(Array(8).fill("Sin asignar"))
  const [equipoNegro, setEquipoNegro] = useState<string[]>(Array(8).fill("Sin asignar"))

  const [jugadoresDisponibles, setJugadoresDisponibles] = useState<string[]>([])
  const [mostrarCargador, setMostrarCargador] = useState(false)
  const [formacionGuardada, setFormacionGuardada] = useState(false)

  /* ======================  Global store  =============================== */
  const { guardarAlineacionActual } = usePartidosStore()

  /* ======================  Helpers  ==================================== */
  const jugadoresSeleccionados = useMemo(
    () => [...equipoBlanco, ...equipoNegro].filter((j) => j !== "Sin asignar"),
    [equipoBlanco, equipoNegro],
  )

  const jugadoresLibres = useMemo(
    () => jugadoresDisponibles.filter((j) => !jugadoresSeleccionados.includes(j)),
    [jugadoresDisponibles, jugadoresSeleccionados],
  )

  const formacionCompleta =
    equipoBlanco.every((j) => j !== "Sin asignar") && equipoNegro.every((j) => j !== "Sin asignar")

  /* ======================  Callbacks  ================================== */
  const handleJugadoresProcesados = (jugadores: string[]) => {
    setJugadoresDisponibles(jugadores)
    setEquipoBlanco(Array(8).fill("Sin asignar"))
    setEquipoNegro(Array(8).fill("Sin asignar"))
    setFormacionGuardada(false)
  }

  const handleEquipoChange = (indice: number, jugador: string, equipo: "blanco" | "negro") => {
    const setter = equipo === "blanco" ? setEquipoBlanco : setEquipoNegro
    const current = equipo === "blanco" ? equipoBlanco : equipoNegro
    const nuevo = [...current]
    nuevo[indice] = jugador
    setter(nuevo)

    // Auto-completar el otro equipo si este queda completo
    const thisComplete = nuevo.every((j) => j !== "Sin asignar")
    if (thisComplete) {
      const jugadoresRestantes = jugadoresDisponibles.filter((j) => !nuevo.includes(j))
      if (jugadoresRestantes.length === 8) {
        equipo === "blanco" ? setEquipoNegro([...jugadoresRestantes]) : setEquipoBlanco([...jugadoresRestantes])
      }
    }
  }

  const removerJugador = (indice: number, equipo: "blanco" | "negro") => {
    const setter = equipo === "blanco" ? setEquipoBlanco : setEquipoNegro
    const current = equipo === "blanco" ? equipoBlanco : equipoNegro
    const nuevo = [...current]
    nuevo[indice] = "Sin asignar"
    setter(nuevo)
    setFormacionGuardada(false)
  }

  const guardarFormacion = () => {
    const plantillaBlanco = equipoBlanco
      .filter((j) => j !== "Sin asignar")
      .map((nombre, i) => ({
        id: i + 1,
        nombre,
        posicion: POSICIONES[i],
        numero: i + 1,
      }))

    const plantillaNegro = equipoNegro
      .filter((j) => j !== "Sin asignar")
      .map((nombre, i) => ({
        id: i + 9,
        nombre,
        posicion: POSICIONES[i],
        numero: i + 1,
      }))

    guardarAlineacionActual(
      plantillaBlanco.map((p) => p.nombre),
      plantillaNegro.map((p) => p.nombre),
    )

    setFormacionGuardada(true)
    alert("¡Formación guardada y disponible en Admin! 🏆")
  }

  const compartirAlineacion = async () => {
    if (!formacionGuardada) return

    const texto = `⚽ Alineaciones próximas

🤍 Equipo Blanco:
${equipoBlanco.map((n, i) => `${i + 1}. ${n}`).join("\n")}

⚫ Equipo Negro:
${equipoNegro.map((n, i) => `${i + 1}. ${n}`).join("\n")}
`

    if (navigator.share) {
      await navigator.share({ title: "Alineaciones Fútbol-8", text: texto })
    } else {
      await navigator.clipboard.writeText(texto)
      alert("Alineaciones copiadas al portapapeles")
    }
  }

  /* ======================  Render  ===================================== */
  return (
    <div className="min-h-screen gradient-green transition-all duration-300">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        {/* ================= Header ================ */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button className="glass modern-button text-white hover:text-gray-900 dark:text-gray-300" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white text-glow">Alineaciones</h1>
          </div>

          <div className="flex items-center gap-2">
            {formacionGuardada && (
              <Badge variant="outline" className="glass text-green-300 border-green-400/50">
                <Save className="w-3 h-3 mr-1" />
                Guardada
              </Badge>
            )}
            <ThemeToggle />
            <Button
              className="glass modern-button text-white font-semibold"
              onClick={() => setMostrarCargador((s) => !s)}
              size="sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cargar Jugadores</span>
            </Button>
            <Button
              onClick={compartirAlineacion}
              disabled={!formacionGuardada}
              className="glass modern-button text-white font-semibold"
              size="sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Compartir</span>
            </Button>
          </div>
        </motion.div>

        {/* =============== Cargador WhatsApp =============== */}
        <AnimatePresence>
          {mostrarCargador && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Card className="glass card-hover border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5" /> Cargar Jugadores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PastePlayerList onJugadoresProcesados={handleJugadoresProcesados} />

                  {jugadoresDisponibles.length > 0 && (
                    <div className="grid formation-grid">
                      {/* ================== Equipo Blanco ================= */}
                      <div className="glass p-4 rounded-lg">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <div className="w-4 h-4 bg-white/80 rounded border" />
                          Blanco ({equipoBlanco.filter((j) => j !== "Sin asignar").length}
                          /8)
                        </h3>
                        <div className="space-y-2">
                          {POSICIONES.map((pos, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Label className="w-24 text-xs text-white">
                                {pos.charAt(0).toUpperCase() + pos.slice(1)} {i + 1}
                              </Label>
                              <Select value={equipoBlanco[i]} onValueChange={(v) => handleEquipoChange(i, v, "blanco")}>
                                <SelectTrigger className="flex-1 modern-select text-white text-sm">
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                  <SelectItem value="Sin asignar">Sin asignar</SelectItem>
                                  {jugadoresLibres.map((j) => (
                                    <SelectItem key={j} value={j}>
                                      {j}
                                    </SelectItem>
                                  ))}
                                  {equipoBlanco[i] !== "Sin asignar" && (
                                    <SelectItem value={equipoBlanco[i]}>{equipoBlanco[i]} (actual)</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ================== Equipo Negro =================== */}
                      <div className="glass p-4 rounded-lg">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-800 rounded" />
                          Negro ({equipoNegro.filter((j) => j !== "Sin asignar").length}
                          /8)
                        </h3>
                        <div className="space-y-2">
                          {POSICIONES.map((pos, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Label className="w-24 text-xs text-white">
                                {pos.charAt(0).toUpperCase() + pos.slice(1)} {i + 1}
                              </Label>
                              <Select value={equipoNegro[i]} onValueChange={(v) => handleEquipoChange(i, v, "negro")}>
                                <SelectTrigger className="flex-1 modern-select text-white text-sm">
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                  <SelectItem value="Sin asignar">Sin asignar</SelectItem>
                                  {jugadoresLibres.map((j) => (
                                    <SelectItem key={j} value={j}>
                                      {j}
                                    </SelectItem>
                                  ))}
                                  {equipoNegro[i] !== "Sin asignar" && (
                                    <SelectItem value={equipoNegro[i]}>{equipoNegro[i]} (actual)</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {formacionCompleta && (
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={guardarFormacion}
                        className="gradient-blue modern-button text-white font-semibold px-8"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Formación
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================ Tabs view selector ================= */}
        <motion.div
          className="flex justify-center gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            variant={equipoSeleccionado === "blanco" ? "default" : "outline"}
            onClick={() => setEquipoSeleccionado("blanco")}
            className={equipoSeleccionado === "blanco" ? "bg-white text-gray-900" : "glass text-white border-white/30"}
          >
            Blanco
          </Button>
          <Button
            variant={equipoSeleccionado === "ambos" ? "default" : "outline"}
            onClick={() => setEquipoSeleccionado("ambos")}
            className={equipoSeleccionado === "ambos" ? "gradient-blue text-white" : "glass text-white border-white/30"}
          >
            Ambos
          </Button>
          <Button
            variant={equipoSeleccionado === "negro" ? "default" : "outline"}
            onClick={() => setEquipoSeleccionado("negro")}
            className={equipoSeleccionado === "negro" ? "bg-gray-800 text-white" : "glass text-white border-white/30"}
          >
            Negro
          </Button>
        </motion.div>

        {/* ================ Cancha =========================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CanchaFormation
            equipoBlanco={equipoBlanco
              .filter((j) => j !== "Sin asignar")
              .map((nombre, i) => ({
                id: i + 1,
                nombre,
                posicion: POSICIONES[i],
                numero: i + 1,
              }))}
            equipoNegro={equipoNegro
              .filter((j) => j !== "Sin asignar")
              .map((nombre, i) => ({
                id: i + 9,
                nombre,
                posicion: POSICIONES[i],
                numero: i + 1,
              }))}
            mostrarEquipo={equipoSeleccionado}
          />
        </motion.div>

        {/* Estado vacío */}
        {jugadoresDisponibles.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-6xl mb-4">⚽</div>
            <h2 className="text-2xl font-bold text-white mb-4">¡Equipos por configurar!</h2>
            <p className="text-white/80 mb-6">Haz clic en "Cargar Jugadores" para crear la formación.</p>
            <Button
              onClick={() => setMostrarCargador(true)}
              className="gradient-orange modern-button text-white font-semibold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Cargar Jugadores
            </Button>
          </motion.div>
        )}

        {/* Aviso formación guardada */}
        {formacionGuardada && (
          <motion.div
            className="mt-6 p-4 glass rounded-lg text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-green-300 font-medium flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Formación guardada exitosamente.
            </p>
            <Link href="/admin" className="inline-block mt-3">
              <Button className="gradient-orange modern-button text-white font-semibold">
                <Send className="w-4 h-4 mr-2" />
                Ir a Cargar Resultados
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
