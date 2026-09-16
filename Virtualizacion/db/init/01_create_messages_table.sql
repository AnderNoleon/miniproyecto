-- Se ejecuta automaticamente la primera vez que arranca el contenedor
-- de Postgres (carpeta montada en /docker-entrypoint-initdb.d).
CREATE TABLE IF NOT EXISTS mensajes (
    id SERIAL PRIMARY KEY,
    mensaje TEXT NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);
