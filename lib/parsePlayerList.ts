export function parsePlayerList(texto: string): string[] {
  if (!texto.trim()) return []

  const lineas = texto.split("\n")
  const jugadores: string[] = []

  // Palabras a ignorar
  const palabrasIgnorar = [
    "fut",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "horas",
    "hora",
    "waiting",
    "wait",
    "regreso",
    "lesion",
    "de",
    "del",
    "la",
    "el",
    "partido",
    "cancha",
    "municipal",
  ]

  lineas.forEach((linea) => {
    // Limpiar la línea
    const lineaLimpia = linea.trim().toLowerCase()

    // Saltar líneas vacías o que solo contengan números
    if (!lineaLimpia || /^\d+$/.test(lineaLimpia)) return

    // Saltar líneas que empiecen con palabras comunes de contexto
    if (palabrasIgnorar.some((palabra) => lineaLimpia.startsWith(palabra))) return

    // Extraer nombre después del número inicial
    const match = lineaLimpia.match(/^\d+\s*(.+)/)
    if (match) {
      let nombre = match[1].trim()

      // Limpiar palabras adicionales del nombre
      palabrasIgnorar.forEach((palabra) => {
        nombre = nombre.replace(new RegExp(`\\b${palabra}\\b`, "gi"), "").trim()
      })

      // Capitalizar primera letra de cada palabra
      nombre = nombre
        .split(" ")
        .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(" ")
        .trim()

      if (nombre && nombre.length > 1) {
        jugadores.push(nombre)
      }
    } else {
      // Si no hay número al inicio, intentar extraer el nombre directamente
      let nombre = lineaLimpia

      // Limpiar palabras adicionales
      palabrasIgnorar.forEach((palabra) => {
        nombre = nombre.replace(new RegExp(`\\b${palabra}\\b`, "gi"), "").trim()
      })

      // Capitalizar
      nombre = nombre
        .split(" ")
        .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(" ")
        .trim()

      if (nombre && nombre.length > 1 && !jugadores.includes(nombre)) {
        jugadores.push(nombre)
      }
    }
  })

  // Remover duplicados y retornar
  return [...new Set(jugadores)]
}
