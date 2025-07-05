"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePartidosStore } from "@/lib/partidosStore"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, Info, AlertTriangle } from "lucide-react"

export default function NotificationCenter() {
  const { notificaciones, eliminarNotificacion } = usePartidosStore()

  // Auto-eliminar notificaciones después de 5 segundos
  useEffect(() => {
    notificaciones.forEach((notificacion) => {
      const timer = setTimeout(() => {
        eliminarNotificacion(notificacion.id)
      }, 5000)

      return () => clearTimeout(timer)
    })
  }, [notificaciones, eliminarNotificacion])

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getColors = (tipo: string) => {
    switch (tipo) {
      case "success":
        return "bg-green-500/20 border-green-400/50 text-green-300"
      case "warning":
        return "bg-yellow-500/20 border-yellow-400/50 text-yellow-300"
      default:
        return "bg-blue-500/20 border-blue-400/50 text-blue-300"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notificaciones.map((notificacion) => (
          <motion.div
            key={notificacion.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            className={`glass p-4 rounded-lg border ${getColors(notificacion.tipo)} backdrop-blur-sm shadow-lg`}
          >
            <div className="flex items-start gap-3">
              {getIcon(notificacion.tipo)}
              <div className="flex-1">
                <p className="text-sm font-medium">{notificacion.mensaje}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(notificacion.timestamp).toLocaleTimeString("es-ES")}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => eliminarNotificacion(notificacion.id)}
                className="h-6 w-6 p-0 hover:bg-white/20"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
