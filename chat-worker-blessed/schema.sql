-- Conversaciones: el id es el SHA-256 del identificador del visitante (nunca se guarda en claro)
CREATE TABLE IF NOT EXISTS sessions (
  id      TEXT PRIMARY KEY,
  short   TEXT NOT NULL,     -- etiqueta corta que ve la banda en Telegram (#a3f9)
  ip_hash TEXT NOT NULL,     -- sólo para limitar abusos; la IP no se guarda
  created INTEGER NOT NULL,
  last    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_ip ON sessions (ip_hash, created);

-- Mensajes cifrados con AES-GCM (body + iv en base64)
CREATE TABLE IF NOT EXISTS messages (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  sid    TEXT NOT NULL,
  sender TEXT NOT NULL,      -- 'me' (visitante) | 'band'
  name   TEXT,
  body   TEXT NOT NULL,
  iv     TEXT NOT NULL,
  ts     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_sid ON messages (sid, id);
CREATE INDEX IF NOT EXISTS idx_messages_ts ON messages (ts);

-- Qué mensaje de Telegram pertenece a qué conversación (para enrutar las respuestas)
CREATE TABLE IF NOT EXISTS tg_map (
  tg_id INTEGER PRIMARY KEY,
  sid   TEXT NOT NULL,
  ts    INTEGER NOT NULL
);
