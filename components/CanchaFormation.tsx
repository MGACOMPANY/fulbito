"use client"

import type React from "react"
import { motion } from "framer-motion"
import PlayerCard from "./PlayerCard"
import { useState } from "react"

interface Jugador {
  id: number
  nombre: string
  posicion: string
  numero: number
}

interface CanchaFormationProps {
  equipoBlanco: Jugador[]
  equipoNegro: Jugador[]
  mostrarEquipo: "blanco" | "negro" | "ambos"
}

export default function CanchaFormation({ equipoBlanco, equipoNegro, mostrarEquipo }: CanchaFormationProps) {
  const [draggedPlayer, setDraggedPlayer] = useState<Jugador | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null)

  // Posiciones optimizadas para móvil y centradas
  const posiciones = {
    // Equipo Blanco (parte inferior) - Formación 4-3-1
    blanco: {
      arquero: { top: "88%", left: "50%" },
      defensas: [
        { top: "75%", left: "20%" }, // Defensa izquierdo
        { top: "75%", left: "40%" }, // Defensa central izq
        { top: "75%", left: "60%" }, // Defensa central der
        { top: "75%", left: "80%" }, // Defensa derecho
      ],
      mediocampos: [
        { top: "60%", left: "25%" }, // Mediocampo izquierdo
        { top: "60%", left: "50%" }, // Mediocampo central
        { top: "60%", left: "75%" }, // Mediocampo derecho
      ],
      delantero: { top: "45%", left: "50%" }, // Delantero centro
    },
    // Equipo Negro (parte superior) - Formación 4-3-1
    negro: {
      arquero: { top: "12%", left: "50%" },
      defensas: [
        { top: "25%", left: "20%" }, // Defensa izquierdo
        { top: "25%", left: "40%" }, // Defensa central izq
        { top: "25%", left: "60%" }, // Defensa central der
        { top: "25%", left: "80%" }, // Defensa derecho
      ],
      mediocampos: [
        { top: "40%", left: "25%" }, // Mediocampo izquierdo
        { top: "40%", left: "50%" }, // Mediocampo central
        { top: "40%", left: "75%" }, // Mediocampo derecho
      ],
      delantero: { top: "55%", left: "50%" }, // Delantero centro
    },
  }

  const obtenerPosicionJugador = (jugador: Jugador, equipo: "blanco" | "negro", index: number) => {
    const posEquipo = posiciones[equipo]

    switch (jugador.posicion) {
      case "arquero":
        return posEquipo.arquero
      case "defensa":
        const defenseIndex =
          equipoBlanco
            .concat(equipoNegro)
            .filter((j) => j.posicion === "defensa")
            .indexOf(jugador) % 4
        return posEquipo.defensas[defenseIndex] || posEquipo.defensas[0]
      case "mediocampo":
        const midIndex =
          equipoBlanco
            .concat(equipoNegro)
            .filter((j) => j.posicion === "mediocampo")
            .indexOf(jugador) % 3
        return posEquipo.mediocampos[midIndex] || posEquipo.mediocampos[0]
      case "delantero":
        return posEquipo.delantero
      default:
        return { top: "50%", left: "50%" }
    }
  }

  const handleDragStart = (jugador: Jugador) => {
    setDraggedPlayer(jugador)
  }

  const handleDragEnd = () => {
    setDraggedPlayer(null)
    setDragOverPosition(null)
  }

  const handleDragOver = (e: React.DragEvent, position: string) => {
    e.preventDefault()
    setDragOverPosition(position)
  }

  const handleDragLeave = () => {
    setDragOverPosition(null)
  }

  const handleDrop = (e: React.DragEvent, targetPosition: string) => {
    e.preventDefault()
    if (draggedPlayer) {
      console.log(`Moviendo ${draggedPlayer.nombre} a ${targetPosition}`)
    }
    setDragOverPosition(null)
  }

  const renderJugadores = (equipo: Jugador[], color: "blanco" | "negro") => {
    if (mostrarEquipo !== "ambos" && mostrarEquipo !== color) return null

    const jugadoresPorPosicion = {
      arquero: equipo.filter((j) => j.posicion === "arquero"),
      defensa: equipo.filter((j) => j.posicion === "defensa"),
      mediocampo: equipo.filter((j) => j.posicion === "mediocampo"),
      delantero: equipo.filter((j) => j.posicion === "delantero"),
    }

    const renderPosicion = (jugadores: Jugador[], baseDelay: number) => {
      return jugadores.map((jugador, index) => {
        const pos = obtenerPosicionJugador(jugador, color, index)
        const positionKey = `${color}-${jugador.posicion}-${index}`

        return (
          <motion.div
            key={jugador.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-move ${
              dragOverPosition === positionKey ? "ring-2 ring-yellow-400 ring-opacity-75" : ""
            }`}
            style={{ top: pos.top, left: pos.left }}
            initial={{ scale: 0, opacity: 0, y: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: (baseDelay + index) * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            draggable
            onDragStart={() => handleDragStart(jugador)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, positionKey)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, positionKey)}
            whileDrag={{ scale: 1.1, zIndex: 50 }}
          >
            <PlayerCard jugador={jugador} equipo={color} isDragging={draggedPlayer?.id === jugador.id} />
          </motion.div>
        )
      })
    }

    return (
      <>
        {renderPosicion(jugadoresPorPosicion.arquero, 0)}
        {renderPosicion(jugadoresPorPosicion.defensa, 1)}
        {renderPosicion(jugadoresPorPosicion.mediocampo, 5)}
        {renderPosicion(jugadoresPorPosicion.delantero, 8)}
      </>
    )
  }

  return (
    <div className="cancha-container">
      {/* Cancha de fútbol optimizada para móvil */}
      <motion.div
        className="relative cancha-gradient rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border-4 border-white/20"
        style={{ aspectRatio: "3/4", minHeight: "400px" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Líneas de la cancha optimizadas */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet">
          {/* Borde exterior */}
          <rect x="10" y="10" width="280" height="380" fill="none" stroke="white" strokeWidth="2" opacity="0.9" />

          {/* Línea central */}
          <line x1="10" y1="200" x2="290" y2="200" stroke="white" strokeWidth="2" opacity="0.9" />

          {/* Círculo central */}
          <circle cx="150" cy="200" r="30" fill="none" stroke="white" strokeWidth="2" opacity="0.9" />
          <circle cx="150" cy="200" r="1.5" fill="white" opacity="0.9" />

          {/* Área superior */}
          <rect x="60" y="10" width="180" height="60" fill="none" stroke="white" strokeWidth="2" opacity="0.9" />
          <rect x="110" y="10" width="80" height="25" fill="none" stroke="white" strokeWidth="2" opacity="0.9" />

          {/* Área inferior */}
          <rect x="60" y="330" width="180" height="60" fill="none" stroke="white" strokeWidth="2" opacity="0.9" />
          <rect x="110" y="365" width="80" height="25" fill="none" stroke="white" strokeWidth="2" opacity="0.9" />

          {/* Arcos */}
          <rect x="130" y="10" width="40" height="6" fill="white" opacity="0.9" />
          <rect x="130" y="384" width="40" height="6" fill="white" opacity="0.9" />

          {/* Semicírculos de área */}
          <path d="M 110 70 A 20 20 0 0 0 190 70" stroke="white" strokeWidth="2" fill="none" opacity="0.9" />
          <path d="M 110 330 A 20 20 0 0 1 190 330" stroke="white" strokeWidth="2" fill="none" opacity="0.9" />

          {/* Puntos de penal */}
          <circle cx="150" cy="45" r="1.5" fill="white" opacity="0.9" />
          <circle cx="150" cy="355" r="1.5" fill="white" opacity="0.9" />

          {/* Esquinas */}
          <path d="M 10 10 A 5 5 0 0 0 15 15" stroke="white" strokeWidth="1" fill="none" opacity="0.7" />
          <path d="M 290 10 A 5 5 0 0 1 285 15" stroke="white" strokeWidth="1" fill="none" opacity="0.7" />
          <path d="M 10 390 A 5 5 0 0 1 15 385" stroke="white" strokeWidth="1" fill="none" opacity="0.7" />
          <path d="M 290 390 A 5 5 0 0 0 285 385" stroke="white" strokeWidth="1" fill="none" opacity="0.7" />
        </svg>

        {/* Efectos de césped */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
        </div>

        {/* Jugadores */}
        {renderJugadores(equipoBlanco, "blanco")}
        {renderJugadores(equipoNegro, "negro")}

        {/* Indicador de drag & drop */}
        {draggedPlayer && (
          <div className="absolute top-2 left-2 glass p-2 rounded-lg text-white text-xs sm:text-sm">
            <span>Arrastrando: {draggedPlayer.nombre}</span>
          </div>
        )}
      </motion.div>

      {/* Instrucciones mejoradas */}
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-white/80 text-xs sm:text-sm">
          💡 <span className="hidden sm:inline">Arrastra los jugadores para cambiar sus posiciones en la cancha</span>
          <span className="sm:hidden">Toca para ver detalles del jugador</span>
        </p>
      </motion.div>
    </div>
  )
}
