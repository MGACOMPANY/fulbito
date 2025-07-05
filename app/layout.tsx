import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"

// Importar el ThemeProvider
import { ThemeProvider } from "@/components/ThemeProvider"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Fútbol 8 Manager - Blanco vs Negro",
  description: "Aplicación para gestionar partidos semanales de fútbol 8 entre amigos",
  keywords: "fútbol, torneo, equipos, estadísticas, partidos",
  authors: [{ name: "Fútbol 8 Team" }],
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

// Envolver el children con ThemeProvider:
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
