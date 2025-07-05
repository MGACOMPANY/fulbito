-- Crear tablas para la aplicación de fútbol 8

-- Tabla de jugadores
CREATE TABLE IF NOT EXISTS jugadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de partidos
CREATE TABLE IF NOT EXISTS partidos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  goles_blanco INTEGER DEFAULT 0,
  goles_negro INTEGER DEFAULT 0,
  figura_partido VARCHAR(100),
  estado VARCHAR(20) DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de alineaciones
CREATE TABLE IF NOT EXISTS alineaciones (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INTEGER REFERENCES jugadores(id) ON DELETE CASCADE,
  equipo VARCHAR(10) NOT NULL CHECK (equipo IN ('blanco', 'negro')),
  posicion VARCHAR(20) NOT NULL,
  numero INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de goles
CREATE TABLE IF NOT EXISTS goles (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INTEGER REFERENCES jugadores(id) ON DELETE CASCADE,
  cantidad INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de puntajes
CREATE TABLE IF NOT EXISTS puntajes (
  id SERIAL PRIMARY KEY,
  partido_id INTEGER REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INTEGER REFERENCES jugadores(id) ON DELETE CASCADE,
  puntaje DECIMAL(3,1) CHECK (puntaje >= 1 AND puntaje <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_partidos_fecha ON partidos(fecha);
CREATE INDEX IF NOT EXISTS idx_alineaciones_partido ON alineaciones(partido_id);
CREATE INDEX IF NOT EXISTS idx_goles_partido ON goles(partido_id);
CREATE INDEX IF NOT EXISTS idx_puntajes_partido ON puntajes(partido_id);
