const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST || 'url-pg',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'pgpassword',
  database: process.env.PGDATABASE || 'postgres',
});

const app = express();
app.use(express.json());

app.post('/mensajes', async (req, res) => {
  const mensaje = (req.body.mensaje || '').trim();

  if (!mensaje) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacio' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO mensajes (mensaje) VALUES ($1) RETURNING id, mensaje, fecha_creacion',
      [mensaje]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo guardar el mensaje' });
  }
});

app.get('/health', (req, res) => res.send('ok'));

app.listen(3000, () => console.log('Backend escuchando en el puerto 3000'));
