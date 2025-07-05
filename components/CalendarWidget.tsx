"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, MapPin, Plus, Bell, Trash2, CalendarDays, AlertCircle } from "lucide-react"
import { useCalendarStore, calendarService } from "@/lib/calendarService"
import { usePartidosStore } from "@/lib/partidosStore"

export default function CalendarWidget() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPartido, setNewPartido] = useState({
    fecha: "",
    hora: "20:00",
    lugar: "SB5, Parque Sarmiento",
    descripcion: "",
    recordatorio: true,
  })

  const {
    partidosProgramados,
    agregarPartidoProgramado,
    eliminarPartidoProgramado,
    obtenerProximosPartidos,
    obtenerPartidosHoy,
  } = useCalendarStore()

  const { agregarNotificacion } = usePartidosStore()

  const proximosPartidos = obtenerProximosPartidos()
  const partidosHoy = obtenerPartidosHoy()

  const handleAddPartido = () => {
    if (!newPartido.fecha || !newPartido.hora) {
      agregarNotificacion("Por favor completa fecha y hora", "warning")
      return
    }

    agregarPartidoProgramado(newPartido)
    agregarNotificacion("Partido programado exitosamente", "success")

    setNewPartido({
      fecha: "",
      hora: "20:00",
      lugar: "SB5, Parque Sarmiento",
      descripcion: "",
      recordatorio: true,
    })
    setShowAddForm(false)
  }

  const handleProgramarProximoJueves = () => {
    calendarService.programarProximoJueves()
    agregarNotificacion("Próximo jueves programado automáticamente", "success")
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  const formatearHora = (hora: string) => {
    return new Date(`2000-01-01T${hora}`).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Partidos de Hoy */}
      {partidosHoy.length > 0 && (
        <Card className="glass border-0 shadow-lg border-l-4 border-l-orange-400">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              ¡Partidos Hoy!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {partidosHoy.map((partido) => (
                <div key={partido.id} className="flex items-center justify-between p-3 bg-orange-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <div>
                      <p className="text-white font-medium">{formatearHora(partido.hora)}</p>
                      <p className="text-white/80 text-sm">{partido.lugar}</p>
                    </div>
                  </div>
                  {partido.recordatorio && (
                    <Badge variant="outline" className="text-orange-300 border-orange-400/50">
                      <Bell className="w-3 h-3 mr-1" />
                      Recordatorio
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Partidos */}
      <Card className="glass border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-400" />
              Próximos Partidos ({proximosPartidos.length})
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleProgramarProximoJueves}
                size="sm"
                className="gradient-blue text-white font-semibold"
              >
                Próximo Jueves
              </Button>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
                variant="outline"
                className="glass text-white border-white/30"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulario para agregar partido */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="glass p-4 rounded-lg space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white text-sm font-medium">Fecha</Label>
                    <Input
                      type="date"
                      value={newPartido.fecha}
                      onChange={(e) => setNewPartido({ ...newPartido, fecha: e.target.value })}
                      className="modern-input text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm font-medium">Hora</Label>
                    <Input
                      type="time"
                      value={newPartido.hora}
                      onChange={(e) => setNewPartido({ ...newPartido, hora: e.target.value })}
                      className="modern-input text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white text-sm font-medium">Lugar</Label>
                  <Input
                    value={newPartido.lugar}
                    onChange={(e) => setNewPartido({ ...newPartido, lugar: e.target.value })}
                    className="modern-input text-white"
                    placeholder="SB5, Parque Sarmiento"
                  />
                </div>

                <div>
                  <Label className="text-white text-sm font-medium">Descripción (opcional)</Label>
                  <Textarea
                    value={newPartido.descripcion}
                    onChange={(e) => setNewPartido({ ...newPartido, descripcion: e.target.value })}
                    className="modern-input text-white"
                    placeholder="Partido semanal de fútbol 8"
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newPartido.recordatorio}
                      onCheckedChange={(checked) => setNewPartido({ ...newPartido, recordatorio: checked })}
                    />
                    <Label className="text-white text-sm">Recordatorio (1 hora antes)</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAddForm(false)}
                      variant="outline"
                      size="sm"
                      className="glass text-white border-white/30"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleAddPartido} size="sm" className="gradient-green text-white font-semibold">
                      Programar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista de próximos partidos */}
          {proximosPartidos.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/80">No hay partidos programados</p>
              <p className="text-white/60 text-sm">Programa tu próximo partido usando el botón de arriba</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proximosPartidos.map((partido) => (
                <motion.div
                  key={partido.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 glass rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-white font-bold text-lg">{new Date(partido.fecha).getDate()}</div>
                      <div className="text-white/80 text-xs uppercase">
                        {new Date(partido.fecha).toLocaleDateString("es-ES", { month: "short" })}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">{formatearHora(partido.hora)}</span>
                        {partido.recordatorio && (
                          <Badge variant="outline" className="text-green-300 border-green-400/50 text-xs">
                            <Bell className="w-3 h-3 mr-1" />
                            Recordatorio
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <span className="text-white/80 text-sm">{partido.lugar}</span>
                      </div>

                      <div className="text-white/80 text-sm">{formatearFecha(partido.fecha)}</div>

                      {partido.descripcion && <div className="text-white/60 text-xs mt-1">{partido.descripcion}</div>}
                    </div>
                  </div>

                  <Button
                    onClick={() => eliminarPartidoProgramado(partido.id)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información sobre notificaciones */}
      <Card className="glass border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-white text-sm font-medium">Recordatorios Automáticos</p>
              <p className="text-white/80 text-xs">
                Recibirás una notificación 1 hora antes de cada partido programado con recordatorio activado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
