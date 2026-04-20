// Configuración
const API_BASE_URL = 'http://localhost:5000/api'; // Cambia esto según tu backend

// Estado de la aplicación
let anomaliesData = [];
let activityChart = null;

// Inicialización cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    initializeDateTime();
    loadAnomalies();
    setupEventListeners();
    startAutoRefresh();
});

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('refreshBtn').addEventListener('click', loadAnomalies);
    document.getElementById('filterType').addEventListener('change', filterAndDisplayData);
    document.getElementById('searchInput').addEventListener('input', filterAndDisplayData);
}

// Inicializar fecha y hora
function initializeDateTime() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('currentDateTime').textContent = 
        now.toLocaleDateString('es-ES', options);
}

// Iniciar auto-refresh cada 30 segundos
function startAutoRefresh() {
    setInterval(loadAnomalies, 30000);
}

// Cargar anomalías desde la API
async function loadAnomalies() {
    const tableBody = document.getElementById('tableBody');
    
    try {
        const response = await fetch(`${API_BASE_URL}/recent-anomalies`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        anomaliesData = await response.json();
        filterAndDisplayData();
        updateKPIs();
        updateChart();
        
    } catch (error) {
        console.error('Error cargando anomalías:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="color: var(--danger-color); text-align: center;">
                    <i class="fas fa-exclamation-circle"></i> 
                    Error al cargar datos: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Filtrar y mostrar datos según filtros actuales
function filterAndDisplayData() {
    const filterType = document.getElementById('filterType').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filteredData = [...anomaliesData];
    
    // Aplicar filtro por tipo
    if (filterType === 'failed') {
        filteredData = filteredData.filter(item => !item.was_successful);
    } else if (filterType === 'external') {
        filteredData = filteredData.filter(item => !isPrivateIP(item.ip_address));
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
        filteredData = filteredData.filter(item => 
            item.usuario.toLowerCase().includes(searchTerm) ||
            item.ip_address.toLowerCase().includes(searchTerm) ||
            item.table_accessed.toLowerCase().includes(searchTerm)
        );
    }
    
    displayTableData(filteredData);
}

// Verificar si una IP es privada
function isPrivateIP(ip) {
    // IPv4
    if (ip.startsWith('192.168.')) return true;
    if (ip.startsWith('10.')) return true;
    if (ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) return true;
    if (ip === '127.0.0.1') return true;
    
    // IPv6
    if (ip.startsWith('fc00:') || ip.startsWith('fd00:')) return true;
    if (ip === '::1') return true;
    
    return false;
}

// Mostrar datos en la tabla
function displayTableData(data) {
    const tableBody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center;">
                    <i class="fas fa-info-circle"></i> No hay alertas para mostrar
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = data.map(item => {
        const isFailed = !item.was_successful;
        const isExternal = !isPrivateIP(item.ip_address);
        
        // Determinar tipo de alerta
        let alertType = '';
        let alertClass = '';
        if (isFailed && isExternal) {
            alertType = 'Fallo + IP Externa';
            alertClass = 'alert-both';
        } else if (isFailed) {
            alertType = 'Acceso Fallido';
            alertClass = 'alert-failed';
        } else if (isExternal) {
            alertType = 'IP Externa';
            alertClass = 'alert-external';
        }
        
        // Formatear fecha
        const date = new Date(item.access_timestamp);
        const formattedDate = date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        return `
            <tr>
                <td><i class="fas fa-user"></i> ${item.usuario}</td>
                <td><i class="fas fa-network-wired"></i> ${item.ip_address}</td>
                <td><i class="far fa-calendar-alt"></i> ${formattedDate}</td>
                <td><i class="fas fa-table"></i> ${item.table_accessed}</td>
                <td><span class="badge">${item.operation_type}</span></td>
                <td>
                    <span class="status-badge ${item.was_successful ? 'status-success' : 'status-failed'}">
                        ${item.was_successful ? '✓ Éxito' : '✗ Fallo'}
                    </span>
                </td>
                <td>
                    <span class="alert-type ${alertClass}">
                        ${alertType}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// Actualizar KPIs
function updateKPIs() {
    const alertCount = anomaliesData.length;
    const failedCount = anomaliesData.filter(item => !item.was_successful).length;
    const externalIPCount = anomaliesData.filter(item => !isPrivateIP(item.ip_address)).length;
    
    document.getElementById('alertCount').textContent = alertCount;
    document.getElementById('failedCount').textContent = failedCount;
    document.getElementById('externalIPCount').textContent = externalIPCount;
    document.getElementById('totalAccess').textContent = anomaliesData.length;
}

// Actualizar gráfico
function updateChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    
    // Preparar datos para el gráfico (últimas 24 horas por hora)
    const last24h = Array(24).fill(0);
    const failedByHour = Array(24).fill(0);
    
    anomaliesData.forEach(item => {
        const hour = new Date(item.access_timestamp).getHours();
        last24h[hour]++;
        if (!item.was_successful) {
            failedByHour[hour]++;
        }
    });
    
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    
    if (activityChart) {
        activityChart.destroy();
    }
    
    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: 'Total Alertas',
                    data: last24h,
                    borderColor: 'rgb(52, 152, 219)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Accesos Fallidos',
                    data: failedByHour,
                    borderColor: 'rgb(231, 76, 60)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Alertas por Hora'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Función para simular datos de prueba (útil para desarrollo)
function loadMockData() {
    const mockData = [
        {
            usuario: "admin",
            ip_address: "192.168.1.100",
            access_timestamp: new Date().toISOString(),
            table_accessed: "users",
            operation_type: "SELECT",
            was_successful: true
        },
        {
            usuario: "invitado",
            ip_address: "45.33.22.11",
            access_timestamp: new Date(Date.now() - 3600000).toISOString(),
            table_accessed: "products",
            operation_type: "SELECT",
            was_successful: true
        },
        {
            usuario: "hacker",
            ip_address: "203.0.113.5",
            access_timestamp: new Date(Date.now() - 7200000).toISOString(),
            table_accessed: "credit_cards",
            operation_type: "SELECT",
            was_successful: false
        },
        {
            usuario: "admin",
            ip_address: "10.0.0.50",
            access_timestamp: new Date(Date.now() - 10800000).toISOString(),
            table_accessed: "users",
            operation_type: "UPDATE",
            was_successful: true
        },
        {
            usuario: "externo",
            ip_address: "8.8.8.8",
            access_timestamp: new Date(Date.now() - 14400000).toISOString(),
            table_accessed: "passwords",
            operation_type: "SELECT",
            was_successful: true
        }
    ];
    
    anomaliesData = mockData;
    filterAndDisplayData();
    updateKPIs();
    updateChart();
}

// Descomenta la siguiente línea para usar datos de prueba sin backend
loadMockData();