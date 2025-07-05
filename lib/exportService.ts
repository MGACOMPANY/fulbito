"use client"

import { usePartidosStore } from "./partidosStore"

class ExportService {
  // Convertir datos a CSV
  private arrayToCSV(data: any[]): string {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Escapar comillas y envolver en comillas si contiene comas
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    return csvContent
  }

  // Descargar archivo
  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Exportar partidos a CSV
  exportPartidosCSV(): void {
    const { partidos } = usePartidosStore.getState()

    const partidosData = partidos.map((partido) => ({
      Fecha: new Date(partido.fecha).toLocaleDateString("es-ES"),
      "Goles Blanco": partido.resultado.blanco,
      "Goles Negro": partido.resultado.negro,
      Resultado:
        partido.resultado.blanco > partido.resultado.negro
          ? "Victoria Blanco"
          : partido.resultado.negro > partido.resultado.blanco
            ? "Victoria Negro"
            : "Empate",
      Figura: partido.figura,
      "Goleadores Blanco": partido.goleadores.blanco.map((g) => g.jugador).join("; "),
      "Goleadores Negro": partido.goleadores.negro.map((g) => g.jugador).join("; "),
      "Equipo Blanco": partido.equipos.blanco.join("; "),
      "Equipo Negro": partido.equipos.negro.join("; "),
    }))

    const csv = this.arrayToCSV(partidosData)
    const filename = `partidos-${new Date().toISOString().split("T")[0]}.csv`
    this.downloadFile(csv, filename, "text/csv")
  }

  // Exportar estadísticas a CSV
  exportEstadisticasCSV(): void {
    const { obtenerEstadisticas } = usePartidosStore.getState()
    const stats = obtenerEstadisticas()

    // Goleadores
    const goleadoresCSV = this.arrayToCSV(
      stats.goleadores.map((g, index) => ({
        Posicion: index + 1,
        Jugador: g.nombre,
        Goles: g.goles,
        Equipo: g.equipo,
      })),
    )

    // Figuras
    const figurasCSV = this.arrayToCSV(
      stats.figuras.map((f, index) => ({
        Posicion: index + 1,
        Jugador: f.nombre,
        Veces: f.veces,
      })),
    )

    // Promedios
    const promediosCSV = this.arrayToCSV(
      stats.promedios.map((p, index) => ({
        Posicion: index + 1,
        Jugador: p.nombre,
        Promedio: p.promedio.toFixed(2),
        Partidos: p.partidos,
      })),
    )

    // Resumen general
    const resumenCSV = this.arrayToCSV([
      {
        "Total Partidos": stats.totalPartidos,
        "Victorias Blanco": stats.victoriasBlanco,
        "Victorias Negro": stats.victoriasNegro,
        Empates: stats.empates,
        "Goles Blanco": stats.golesFavorBlanco,
        "Goles Negro": stats.golesFavorNegro,
      },
    ])

    const contenidoCompleto = [
      "RESUMEN GENERAL",
      resumenCSV,
      "",
      "TABLA DE GOLEADORES",
      goleadoresCSV,
      "",
      "FIGURAS DEL PARTIDO",
      figurasCSV,
      "",
      "PROMEDIOS DE PUNTAJES",
      promediosCSV,
    ].join("\n")

    const filename = `estadisticas-${new Date().toISOString().split("T")[0]}.csv`
    this.downloadFile(contenidoCompleto, filename, "text/csv")
  }

  // Exportar todo a JSON
  exportTodoJSON(): void {
    const { partidos, plantillas, obtenerEstadisticas } = usePartidosStore.getState()
    const stats = obtenerEstadisticas()

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        totalPartidos: partidos.length,
        totalPlantillas: plantillas.length,
      },
      estadisticas: stats,
      partidos: partidos,
      plantillas: plantillas,
    }

    const json = JSON.stringify(exportData, null, 2)
    const filename = `futbol-completo-${new Date().toISOString().split("T")[0]}.json`
    this.downloadFile(json, filename, "application/json")
  }

  // Generar reporte HTML
  exportReporteHTML(): void {
    const { partidos, obtenerEstadisticas } = usePartidosStore.getState()
    const stats = obtenerEstadisticas()

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Fútbol 8 - ${new Date().toLocaleDateString("es-ES")}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .equipo-blanco { background-color: #f8f9fa; }
        .equipo-negro { background-color: #343a40; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚽ Reporte Fútbol 8</h1>
        <p>Generado el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-number">${stats.totalPartidos}</div>
            <div>Partidos Jugados</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.victoriasBlanco}</div>
            <div>Victorias Blanco</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.victoriasNegro}</div>
            <div>Victorias Negro</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.golesFavorBlanco + stats.golesFavorNegro}</div>
            <div>Total Goles</div>
        </div>
    </div>

    <h2>🏆 Tabla de Goleadores</h2>
    <table>
        <thead>
            <tr><th>Pos</th><th>Jugador</th><th>Goles</th><th>Equipo</th></tr>
        </thead>
        <tbody>
            ${stats.goleadores
              .slice(0, 10)
              .map(
                (g, i) => `
                <tr class="${g.equipo === "blanco" ? "equipo-blanco" : "equipo-negro"}">
                    <td>${i + 1}</td><td>${g.nombre}</td><td>${g.goles}</td><td>${g.equipo}</td>
                </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>

    <h2>⭐ Figuras del Partido</h2>
    <table>
        <thead>
            <tr><th>Pos</th><th>Jugador</th><th>Veces</th></tr>
        </thead>
        <tbody>
            ${stats.figuras
              .slice(0, 10)
              .map(
                (f, i) => `
                <tr><td>${i + 1}</td><td>${f.nombre}</td><td>${f.veces}</td></tr>
            `,
              )
              .join("")}
        </tbody>
    </table>

    <h2>📊 Historial de Partidos</h2>
    <table>
        <thead>
            <tr><th>Fecha</th><th>Resultado</th><th>Figura</th></tr>
        </thead>
        <tbody>
            ${partidos
              .slice(-10)
              .reverse()
              .map(
                (p) => `
                <tr>
                    <td>${new Date(p.fecha).toLocaleDateString("es-ES")}</td>
                    <td>${p.resultado.blanco} - ${p.resultado.negro}</td>
                    <td>${p.figura}</td>
                </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>
</body>
</html>`

    const filename = `reporte-futbol-${new Date().toISOString().split("T")[0]}.html`
    this.downloadFile(html, filename, "text/html")
  }
}

export const exportService = new ExportService()
