"use client"

import { usePartidosStore } from "./partidosStore"

export interface BackupData {
  partidos: any[]
  plantillas: any[]
  version: string
  timestamp: string
  checksum: string
}

class BackupService {
  private readonly BACKUP_KEY = "futbol-backup"
  private readonly BACKUP_INTERVAL = 5 * 60 * 1000 // 5 minutos
  private backupTimer: NodeJS.Timeout | null = null

  // Generar checksum simple para verificar integridad
  private generateChecksum(data: string): string {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convertir a 32bit integer
    }
    return Math.abs(hash).toString(16)
  }

  // Crear backup de los datos
  createBackup(): BackupData {
    const store = usePartidosStore.getState()
    const data = {
      partidos: store.partidos,
      plantillas: store.plantillas,
    }

    const dataString = JSON.stringify(data)
    const backup: BackupData = {
      ...data,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      checksum: this.generateChecksum(dataString),
    }

    return backup
  }

  // Guardar backup localmente
  saveLocalBackup(): void {
    try {
      const backup = this.createBackup()
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup))
      console.log("✅ Backup local guardado:", new Date().toLocaleString())
    } catch (error) {
      console.error("❌ Error al guardar backup local:", error)
    }
  }

  // Restaurar desde backup local
  restoreFromLocalBackup(): boolean {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY)
      if (!backupData) return false

      const backup: BackupData = JSON.parse(backupData)

      // Verificar integridad
      const dataString = JSON.stringify({
        partidos: backup.partidos,
        plantillas: backup.plantillas,
      })

      if (this.generateChecksum(dataString) !== backup.checksum) {
        console.error("❌ Backup corrupto - checksum no coincide")
        return false
      }

      // Restaurar datos
      const store = usePartidosStore.getState()
      backup.partidos.forEach((partido) => store.agregarPartido(partido))
      backup.plantillas.forEach((plantilla) => store.guardarPlantilla(plantilla))

      console.log("✅ Datos restaurados desde backup local")
      return true
    } catch (error) {
      console.error("❌ Error al restaurar backup:", error)
      return false
    }
  }

  // Exportar backup como archivo
  exportBackup(): void {
    try {
      const backup = this.createBackup()
      const dataStr = JSON.stringify(backup, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `futbol-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("✅ Backup exportado como archivo")
    } catch (error) {
      console.error("❌ Error al exportar backup:", error)
    }
  }

  // Importar backup desde archivo
  importBackup(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const backup: BackupData = JSON.parse(e.target?.result as string)

          // Verificar estructura básica
          if (!backup.partidos || !backup.plantillas || !backup.checksum) {
            console.error("❌ Archivo de backup inválido")
            resolve(false)
            return
          }

          // Verificar integridad
          const dataString = JSON.stringify({
            partidos: backup.partidos,
            plantillas: backup.plantillas,
          })

          if (this.generateChecksum(dataString) !== backup.checksum) {
            console.error("❌ Backup corrupto - checksum no coincide")
            resolve(false)
            return
          }

          // Restaurar datos
          const store = usePartidosStore.getState()
          backup.partidos.forEach((partido) => store.agregarPartido(partido))
          backup.plantillas.forEach((plantilla) => store.guardarPlantilla(plantilla))

          // Guardar como backup local también
          this.saveLocalBackup()

          console.log("✅ Backup importado exitosamente")
          resolve(true)
        } catch (error) {
          console.error("❌ Error al importar backup:", error)
          resolve(false)
        }
      }
      reader.readAsText(file)
    })
  }

  // Iniciar backup automático
  startAutoBackup(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer)
    }

    this.backupTimer = setInterval(() => {
      this.saveLocalBackup()
    }, this.BACKUP_INTERVAL)

    console.log("🔄 Backup automático iniciado (cada 5 minutos)")
  }

  // Detener backup automático
  stopAutoBackup(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer)
      this.backupTimer = null
      console.log("⏹️ Backup automático detenido")
    }
  }

  // Sincronizar con servicios en la nube (simulado)
  async syncToCloud(): Promise<boolean> {
    try {
      const backup = this.createBackup()

      // Simular subida a la nube
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // En una implementación real, aquí subirías a Firebase, Supabase, etc.
      console.log("☁️ Datos sincronizados con la nube (simulado)")

      return true
    } catch (error) {
      console.error("❌ Error al sincronizar con la nube:", error)
      return false
    }
  }
}

export const backupService = new BackupService()
