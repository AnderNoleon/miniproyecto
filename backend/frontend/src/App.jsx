// frontend/src/App.jsx

import { useEffect, useState } from "react";
import { login, getTasks, createTask, deleteTask } from "./api";

/* ══════════════════════════════════════════════
   ESTILOS GLOBALES  (inyectados en <head>)
══════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0e0e11;
    --surface:  #18181d;
    --border:   #2a2a35;
    --accent:   #7b61ff;
    --accent2:  #ff6b6b;
    --text:     #f0eeff;
    --muted:    #6b6b82;
    --success:  #4ade80;
    --radius:   12px;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* animaciones */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .fade-up  { animation: fadeUp .4s ease both; }
  .slide-in { animation: slideIn .3s ease both; }

  /* inputs y botones */
  input, select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    padding: 10px 14px;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    width: 100%;
  }
  input::placeholder { color: var(--muted); }
  input:focus, select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(123,97,255,.18);
  }
  select option { background: var(--surface); }

  button {
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    border: none;
    border-radius: var(--radius);
    transition: transform .15s, opacity .15s, box-shadow .2s;
  }
  button:active { transform: scale(.96); }
  button:disabled { opacity: .4; cursor: not-allowed; }

  .btn-primary {
    background: var(--accent);
    color: #fff;
    padding: 10px 20px;
    font-size: 14px;
  }
  .btn-primary:hover:not(:disabled) {
    box-shadow: 0 0 20px rgba(123,97,255,.45);
  }
  .btn-ghost {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    padding: 8px 16px;
    font-size: 13px;
  }
  .btn-ghost:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--text);
  }
  .btn-danger {
    background: transparent;
    color: var(--muted);
    padding: 6px 10px;
    font-size: 16px;
    border-radius: 8px;
  }
  .btn-danger:hover { color: var(--accent2); background: rgba(255,107,107,.1); }

  /* card */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 28px;
  }

  /* tag de estado */
  .tag {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 6px;
    letter-spacing: .04em;
  }
  .tag-done    { background: rgba(74,222,128,.12); color: var(--success); }
  .tag-pending { background: rgba(123,97,255,.12); color: var(--accent); }

  /* chip de página */
  .page-chip {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 13px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
  }

  /* error */
  .error-bar {
    background: rgba(255,107,107,.1);
    border: 1px solid rgba(255,107,107,.3);
    border-radius: 10px;
    color: var(--accent2);
    font-size: 13px;
    padding: 10px 14px;
  }
`;

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const injectStyles = () => {
  if (!document.getElementById("app-styles")) {
    const s = document.createElement("style");
    s.id = "app-styles";
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
  }
};

const PAGE_SIZE = 5;

/* ══════════════════════════════════════════════
   COMPONENTE: LOGIN
══════════════════════════════════════════════ */
function LoginView({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) return;
    setLoading(true);
    setError("");
    try {
      const res = await login({ username, password });
      localStorage.setItem("token", res.data.access);
      onLogin(username);
    } catch {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "radial-gradient(ellipse at 60% 20%, rgba(123,97,255,.12) 0%, transparent 60%)"
    }}>
      <div className="card fade-up" style={{ width: "100%", maxWidth: 380 }}>

        {/* Logo / título */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            background: "rgba(123,97,255,.15)",
            borderRadius: 14,
            marginBottom: 16,
            fontSize: 24,
          }}>✦</div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 28,
            fontWeight: 400,
            letterSpacing: "-.02em",
          }}>Taskboard</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
            Inicia sesión para continuar
          </p>
        </div>

        {/* Campos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {error && (
          <p className="error-bar" style={{ marginTop: 12 }}>{error}</p>
        )}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", marginTop: 20, padding: "12px" }}
        >
          {loading ? "Entrando..." : "Iniciar sesión →"}
        </button>

        <p style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", marginTop: 16 }}>
          Usa las credenciales de tu superusuario Django
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   COMPONENTE: TAREA
══════════════════════════════════════════════ */
function TaskItem({ task, onDelete, index }) {
  return (
    <li
      className="slide-in"
      style={{
        animationDelay: `${index * 50}ms`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Indicador */}
      <div style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        flexShrink: 0,
        background: task.completed ? "var(--success)" : "var(--accent)",
        boxShadow: task.completed
          ? "0 0 8px rgba(74,222,128,.5)"
          : "0 0 8px rgba(123,97,255,.5)",
      }} />

      {/* Título */}
      <span style={{
        flex: 1,
        fontSize: 14,
        color: task.completed ? "var(--muted)" : "var(--text)",
        textDecoration: task.completed ? "line-through" : "none",
        fontWeight: task.completed ? 300 : 400,
      }}>
        {task.title}
      </span>

      {/* Estado */}
      <span className={`tag ${task.completed ? "tag-done" : "tag-pending"}`}>
        {task.completed ? "hecho" : "pendiente"}
      </span>

      {/* Eliminar */}
      <button className="btn-danger" onClick={() => onDelete(task.id)} title="Eliminar">
        ×
      </button>
    </li>
  );
}

/* ══════════════════════════════════════════════
   COMPONENTE PRINCIPAL: APP
══════════════════════════════════════════════ */
export default function App() {
  injectStyles();

  const [user, setUser]       = useState(() => localStorage.getItem("appUser") || null);
  const [tasks, setTasks]     = useState([]);
  const [title, setTitle]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Filtros
  const [search,    setSearch]    = useState("");
  const [completed, setCompleted] = useState("");
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Carga tareas cuando cambia cualquier filtro
  useEffect(() => {
    if (user) loadTasks();
  }, [user, search, completed, page]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks({ search, completed, page });
      const data = res.data;
      if (data.results !== undefined) {
        setTasks(data.results);
        setTotal(data.count);
      } else {
        setTasks(data);
        setTotal(data.length);
      }
    } catch {
      setError("Error al cargar tareas.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (username) => {
    localStorage.setItem("appUser", username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("appUser");
    setUser(null);
    setTasks([]);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await createTask({ title });
      setTitle("");
      setError("");
      setPage(1);
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.title?.[0] || "Error al crear tarea.");
    }
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks();
  };

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };
  const handleFilterChange = (e) => { setCompleted(e.target.value); setPage(1); };

  // ── Sin sesión ──────────────────────────────────────
  if (!user) return <LoginView onLogin={handleLogin} />;

  // ── Con sesión ──────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      padding: "2rem 1rem",
      background: "radial-gradient(ellipse at 80% 0%, rgba(123,97,255,.1) 0%, transparent 55%)",
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div className="fade-up" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}>
          <div>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 32,
              fontWeight: 400,
              letterSpacing: "-.03em",
            }}>
              Taskboard <span style={{ color: "var(--accent)", fontStyle: "italic" }}>✦</span>
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
              Hola, <strong style={{ color: "var(--text)" }}>{user}</strong> —{" "}
              <span style={{ fontFamily: "'DM Mono', monospace" }}>{total}</span> tareas totales
            </p>
          </div>
          <button className="btn-ghost" onClick={handleLogout}>Salir</button>
        </div>

        {/* ── Crear tarea ── */}
        <div className="card fade-up" style={{ animationDelay: "80ms", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--muted)", marginBottom: 10, letterSpacing: ".08em" }}>
            NUEVA TAREA
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe el título de la tarea..."
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              style={{ flex: 1 }}
            />
            <button
              className="btn-primary"
              onClick={handleCreate}
              style={{ flexShrink: 0, whiteSpace: "nowrap" }}
            >
              + Agregar
            </button>
          </div>
          {error && <p className="error-bar" style={{ marginTop: 12 }}>{error}</p>}
        </div>

        {/* ── Filtros ── */}
        <div className="fade-up" style={{
          animationDelay: "140ms",
          display: "flex",
          gap: 10,
          marginBottom: 16,
        }}>
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="🔍  Buscar por título..."
            style={{ flex: 1 }}
          />
          <select
            value={completed}
            onChange={handleFilterChange}
            style={{ width: "auto", minWidth: 140, flex: "0 0 auto" }}
          >
            <option value="">Todos</option>
            <option value="true">✓ Completadas</option>
            <option value="false">◦ Pendientes</option>
          </select>
        </div>

        {/* ── Lista ── */}
        <div className="card fade-up" style={{ animationDelay: "180ms" }}>
          {loading ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "24px 0",
              color: "var(--muted)",
              fontSize: 14,
            }}>
              <div style={{
                width: 18, height: 18,
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                animation: "spin .7s linear infinite",
              }} />
              Cargando tareas...
            </div>
          ) : tasks.length === 0 ? (
            <div style={{
              padding: "40px 0",
              textAlign: "center",
              color: "var(--muted)",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
              <p style={{ fontSize: 14 }}>
                {search || completed ? "Sin resultados para esa búsqueda." : "Aún no hay tareas. ¡Crea una!"}
              </p>
            </div>
          ) : (
            <ul style={{ listStyle: "none" }}>
              {tasks.map((t, i) => (
                <TaskItem key={t.id} task={t} onDelete={handleDelete} index={i} />
              ))}
            </ul>
          )}
        </div>

        {/* ── Paginación ── */}
        {totalPages > 1 && (
          <div className="fade-up" style={{
            animationDelay: "220ms",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginTop: 16,
          }}>
            <button
              className="btn-ghost"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              ← Anterior
            </button>

            <span className="page-chip">
              {page} / {totalPages}
            </span>

            <button
              className="btn-ghost"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* ── Footer ── */}
        <p style={{
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 11,
          fontFamily: "'DM Mono', monospace",
          marginTop: 40,
          letterSpacing: ".05em",
        }}>
          DJANGO REST + REACT — UNIVERSIDAD RAFAEL LANDÍVAR
        </p>

      </div>
    </div>
  );
}
