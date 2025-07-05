"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Cloud, Download, Upload, Shield, CheckCircle, AlertCircle, FileText, BarChart3, Database } from "lucide-react"
import { backupService } from "@/lib/backupService"
import { exportService } from "@/lib/exportService"
import { usePartidosStore } from "@/lib/partidosStore"

export default function BackupManager() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)
  const { agregarNotificacion } = usePartidosStore()

  useEffect(() => {
    // Iniciar backup automático
    if (autoBackupEnabled) {
      backupService.startAutoBackup()
    } else {
      backupService.stopAutoBackup()
    }

    // Verificar último backup
    const backup = localStorage.getItem("futbol-backup")
    if (backup) {
      try {
        const data = JSON.parse(backup)
        setLastBackup(data.timestamp)
      } catch (error) {
        console.error("Error al leer último backup:", error)
      }
    }

    return () => {
      backupService.stopAutoBackup()
    }
  }, [autoBackupEnabled])

  const handleManualBackup = async () => {
    setIsBackingUp(true)
    try {
      backupService.saveLocalBackup()
      setLastBackup(new Date().toISOString())
      agregarNotificacion("Backup manual creado exitosamente", "success")
    } catch (error) {
      agregarNotificacion("Error al crear backup manual", "warning")
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleCloudSync = async () => {
    setIsBackingUp(true)
    try {
      const success = await backupService.syncToCloud()
      if (success) {
        agregarNotificacion("Datos sincronizados con la nube", "success")
      } else {
        agregarNotificacion("Error al sincronizar con la nube", "warning")
      }
    } catch (error) {
      agregarNotificacion("Error de conexión con la nube", "warning")
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleExportBackup = () => {
    try {
      backupService.exportBackup()
      agregarNotificacion("Backup exportado como archivo", "success")
    } catch (error) {
      agregarNotificacion("Error al exportar backup", "warning")
    }
  }

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsRestoring(true)
    backupService.importBackup(file).then((success) => {
      if (success) {
        agregarNotificacion("Backup importado exitosamente", "success")
        setLastBackup(new Date().toISOString())
      } else {
        agregarNotificacion("Error al importar backup", "warning")
      }
      setIsRestoring(false)
    })

    // Limpiar input
    event.target.value = ""
  }

  return (
    <div className="space-y-6">
      {/* Estado del Backup */}
      <Card className="glass border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-green-400" />
            Estado del Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${autoBackupEnabled ? "bg-green-400" : "bg-gray-400"} animate-pulse`}
              ></div>
              <div>
                <p className="text-white font-medium">Backup Automático</p>
                <p className="text-white/80 text-sm">{autoBackupEnabled ? "Activo (cada 5 minutos)" : "Desactivado"}</p>
              </div>
            </div>
            <Button
              onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
              variant="outline"
              size="sm"
              className="glass text-white border-white/30"
            >
              {autoBackupEnabled ? "Desactivar" : "Activar"}
            </Button>
          </div>

          {lastBackup && (
            <div className="flex items-center gap-2 p-3 glass rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-white text-sm font-medium">Último backup:</p>
                <p className="text-white/80 text-xs">{new Date(lastBackup).toLocaleString("es-ES")}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones de Backup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Database className="w-5 h-5 text-blue-400" />
              Backup Local
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleManualBackup}
              disabled={isBackingUp}
              className="w-full gradient-blue text-white font-semibold"
            >
              {isBackingUp ? "Creando..." : "Crear Backup Manual"}
            </Button>

            <Button
              onClick={handleExportBackup}
              variant="outline"
              className="w-full glass text-white border-white/30 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Backup
            </Button>

            <div className="relative">
              <Input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isRestoring}
              />
              <Button
                variant="outline"
                className="w-full glass text-white border-white/30 bg-transparent"
                disabled={isRestoring}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isRestoring ? "Importando..." : "Importar Backup"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Cloud className="w-5 h-5 text-purple-400" />
              Sincronización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleCloudSync}
              disabled={isBackingUp}
              className="w-full gradient-purple text-white font-semibold"
            >
              {isBackingUp ? "Sincronizando..." : "Sincronizar con la Nube"}
            </Button>

            <div className="p-3 glass rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-white text-sm font-medium">Próximamente</span>
              </div>
              <p className="text-white/80 text-xs">
                Integración con Google Drive, Dropbox y otros servicios en la nube.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exportar Datos */}
      <Card className="glass border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            Exportar Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => exportService.exportPartidosCSV()}
              variant="outline"
              className="glass text-white border-white/30 hover:bg-white/20"
            >
              <FileText className="w-4 h-4 mr-2" />
              Partidos CSV
            </Button>

            <Button
              onClick={() => exportService.exportEstadisticasCSV()}
              variant="outline"
              className="glass text-white border-white/30 hover:bg-white/20"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Estadísticas CSV
            </Button>

            <Button
              onClick={() => exportService.exportTodoJSON()}
              variant="outline"
              className="glass text-white border-white/30 hover:bg-white/20"
            >
              <Database className="w-4 h-4 mr-2" />
              Todo JSON
            </Button>

            <Button
              onClick={() => exportService.exportReporteHTML()}
              variant="outline"
              className="glass text-white border-white/30 hover:bg-white/20"
            >
              <FileText className="w-4 h-4 mr-2" />
              Reporte HTML
            </Button>
          </div>

          <div className="mt-4 p-3 glass rounded-lg">
            <p className="text-white/80 text-sm">
              💡 <strong>Tip:</strong> Los archivos CSV se pueden abrir en Excel. El reporte HTML se puede imprimir o
              compartir fácilmente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
