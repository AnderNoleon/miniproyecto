// frontend/src/App.jsx

import { useEffect, useState } from "react";
import { getTasks, createTask, deleteTask } from "./api";

function App() {
  const [tasks, setTasks]   = useState([]);
  const [title, setTitle]   = useState("");
  const [error, setError]   = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch {
      setError("Error al cargar tareas");
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await createTask({ title });
      setTitle("");
      setError("");
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.title?.[0] || "Error al crear tarea");
    }
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks();
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "Arial" }}>
      <h1>Lista de tareas</h1>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea..."
          style={{ flex: 1, padding: "6px 10px" }}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button onClick={handleCreate}>Agregar</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ paddingLeft: 0, listStyle: "none", marginTop: "1rem" }}>
        {tasks.map((t) => (
          <li
            key={t.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>{t.title}</span>
            <button onClick={() => handleDelete(t.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
