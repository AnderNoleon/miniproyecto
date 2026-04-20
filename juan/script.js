// ── Datos de IPs sospechosas ──
const ips = [
 { ip: "185.220.101.42", pais: " Rusia", tipo: "SQL Injection", estado: "blocked" },
 { ip: "45.33.32.156", pais: " EE.UU.", tipo: "Brute Force SSH", estado: "blocked" },
 { ip: "103.21.244.0", pais: " China", tipo: "Port Scan", estado: "monitor" },
 { ip: "91.108.4.200", pais: " Alemania", tipo: "C2 Callback", estado: "blocked" },
 { ip: "198.51.100.8", pais: " Brasil", tipo: "DDoS", estado: "monitor" },
];
// ── Mensajes del log ──
const logs = [
 { tipo: "ok", msg: "Firewall activo. Reglas cargadas: 2,847" },
 { tipo: "info", msg: "IDS/IPS sincronizado con base de firmas v14.2" },
 { tipo: "warn", msg: "Intento de login fallido: admin@185.220.101.42" },
 { tipo: "err", msg: "ALERTA: SQL Injection detectado en /api/users" },
 { tipo: "info", msg: "IP 185.220.101.42 agregada a lista negra" },
 { tipo: "ok", msg: "Escaneo de vulnerabilidades completado" },
 { tipo: "warn", msg: "Tráfico anómalo en puerto 443 — investigando" },
 { tipo: "err", msg: "CRÍTICO: Posible exfiltración de datos detectada" },
];
// ── Navegación entre secciones ──
function mostrarSeccion(id, btn) {
 document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
 document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
 document.getElementById(id).classList.add("activa");
 if (btn) btn.classList.add("active");
}
// ── Llenar tabla de IPs ──
function llenarTabla() {
 const tbody = document.getElementById("tabla-ips");
 tbody.innerHTML = ips.map(r => `
 <tr>
 <td style="color:#00e5ff">${r.ip}</td>
 <td>${r.pais}</td>
 <td>${r.tipo}</td>
 <td><span class="badge ${r.estado}">${r.estado.toUpperCase()}</span></td>
 </tr>
 `).join("");
}
// ── Agregar línea al log ──
function agregarLog(tipo, msg) {
 const box = document.getElementById("log-box");
 const hora = new Date().toLocaleTimeString("es-GT");
 const linea = document.createElement("div");
 linea.className = `log-${tipo}`;
 linea.textContent = `[${hora}] ${msg}`;
 box.appendChild(linea);
 box.scrollTop = box.scrollHeight;
}
// ── Reloj ──
function actualizarReloj() {
 document.getElementById("clock").textContent = new Date().toLocaleString("es-GT");
}
// ── Solicitudes aleatorias ──
function actualizarContadores() {
 const req = 900 + Math.floor(Math.random() * 600);
 document.getElementById("solicitudes").textContent = req.toLocaleString();
}
// ── Inicialización ──
llenarTabla();
actualizarReloj();
logs.forEach((l, i) => {
 setTimeout(() => agregarLog(l.tipo, l.msg), i * 700);
});
setInterval(actualizarReloj, 1000);
setInterval(actualizarContadores, 3000);
// Nueva amenaza cada 10 segundos
setInterval(() => {
 const el = document.getElementById("amenazas");
 const total = parseInt(el.textContent) + 1;
 el.textContent = total;
 agregarLog("err", `Nueva amenaza detectada. Total activas: ${total}`);
}, 10000);