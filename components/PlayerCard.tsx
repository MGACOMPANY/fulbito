"use client"

import { motion } from "framer-motion"

interface Jugador {
  id: number
  nombre: string
  posicion: string
  numero: number
}

interface PlayerCardProps {
  jugador: Jugador
  equipo: "blanco" | "negro"
  isDragging?: boolean
}

export default function PlayerCard({ jugador, equipo, isDragging = false }: PlayerCardProps) {
  const esBlanco = equipo === "blanco"

  return (
    <motion.div
      className={`relative player-card ${isDragging ? "opacity-75 scale-110" : ""}`}
      whileHover={{ scale: isDragging ? 1.1 : 1.15, y: -3 }}
      whileTap={{ scale: 0.95 }}
      title={`${jugador.nombre} - ${jugador.posicion}`}
    >
      {/* Círculo del jugador - Centrado y mejorado */}
      <div
        className={`
        player-circle
        ${esBlanco ? "player-circle-white" : "player-circle-black"}
        ${isDragging ? "ring-2 ring-yellow-400 ring-opacity-75" : ""}
      `}
      >
        {/* Nombre del jugador centrado */}
        <div className="player-name px-1 text-center">{jugador.nombre}</div>

        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-full pointer-events-none"></div>

        {/* Indicador de drag */}
        {isDragging && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        )}
      </div>

      {/* Sombra del jugador - Más sutil */}
      <div
        className={`
        absolute -bottom-1 left-1/2 transform -translate-x-1/2
        w-8 h-2 sm:w-10 sm:h-2 rounded-full opacity-20 transition-all duration-300
        ${esBlanco ? "bg-gray-400" : "bg-gray-700"}
        ${isDragging ? "opacity-40 scale-110" : ""}
      `}
      ></div>

      {/* Tooltip mejorado para desktop */}
      <motion.div
        className={`
          absolute -top-8 left-1/2 transform -translate-x-1/2 
          px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap
          opacity-0 pointer-events-none z-20 hidden sm:block
          ${esBlanco ? "bg-gray-800 text-white" : "bg-white text-gray-800"}
        `}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {jugador.posicion}
        <div
          className={`
          absolute top-full left-1/2 transform -translate-x-1/2 
          w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent
          ${esBlanco ? "border-t-gray-800" : "border-t-white"}
        `}
        ></div>
      </motion.div>
    </motion.div>
  )
}
