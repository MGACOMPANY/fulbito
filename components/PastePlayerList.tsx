"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { parsePlayerList } from "@/lib/parsePlayerList"

interface PastePlayerListProps {
  onJugadoresProcesados: (jugadores: string[]) => void
}

export default function PastePlayerList({ onJugadoresProcesados }: PastePlayerListProps) {
  const [textoLista, setTextoLista] = useState("")
  const [jugadoresProcesados, setJugadoresProcesados] = useState<string[]>([])

  const procesarLista = () => {
    const jugadores = parsePlayerList(textoLista)
    setJugadoresProcesados(jugadores)
    onJugadoresProcesados(jugadores)
  }

  const limpiarLista = () => {
    setTextoLista("")
    setJugadoresProcesados([])
    onJugadoresProcesados([])
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="lista-jugadores" className="text-base font-semibold text-white dark:text-gray-100">
          Pegar lista de WhatsApp
        </Label>
        <p className="text-sm text-white/80 dark:text-gray-300 mb-2">
          Copia y pega la lista de jugadores desde WhatsApp. El sistema extraerá automáticamente los nombres.
        </p>
        <Textarea
          id="lista-jugadores"
          placeholder="Fut jueves 20 horas&#10;1 luiggi regreso de lesion&#10;2 kriko&#10;3 ciro&#10;4 muru&#10;..."
          value={textoLista}
          onChange={(e) => setTextoLista(e.target.value)}
          rows={8}
          className="font-mono text-sm modern-input text-white dark:text-gray-300"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={procesarLista}
          disabled={!textoLista.trim()}
          className="modern-button gradient-blue text-white font-semibold"
        >
          Procesar Lista
        </Button>
        <Button
          variant="outline"
          onClick={limpiarLista}
          className="glass text-white dark:text-gray-300 border-white/30 dark:border-gray-600/50 hover:bg-white/20 dark:hover:bg-gray-700/50 bg-transparent"
        >
          Limpiar
        </Button>
      </div>

      {jugadoresProcesados.length > 0 && (
        <div className="p-4 glass rounded-lg border border-green-400/30">
          <p className="text-sm font-semibold text-green-300 dark:text-green-400 mb-2">
            ✅ Se encontraron {jugadoresProcesados.length} jugadores:
          </p>
          <div className="text-sm text-green-200 dark:text-green-300">{jugadoresProcesados.join(", ")}</div>
        </div>
      )}
    </div>
  )
}
