// ============================================
// JAVIER MENDOZA - DENNYS CARRETO - ANDERSON HERNANDEZ
// Sistema de Gestión de Aulas - JavaScript
// ============================================


const appState = {
    currentSection: 'inicio',
    classrooms: [
        { id: 101, name: 'Aula 101', capacity: 30, resources: 'Proyector, Pizarra', status: 'disponible' },
        { id: 202, name: 'Aula 202', capacity: 50, resources: 'Computadoras, Internet', status: 'ocupada' },
        { id: 303, name: 'Aula 303', capacity: 20, resources: 'Pizarra, Aire Acondicionado', status: 'disponible' },
        { id: 404, name: 'Aula 404', capacity: 40, resources: 'Proyector, Sonido', status: 'disponible' },
        { id: 505, name: 'Aula 505', capacity: 35, resources: 'Pizarra Digital', status: 'disponible' }
    ],
    reservations: [],
    filters: {
        capacity: 0,
        status: 'all',
        searchTerm: ''
    }
};


// Selección de elementos usando diferentes métodos
const navItems = document.querySelectorAll('.nav-item'); // querySelectorAll
const sections = document.querySelectorAll('.content-section'); // querySelectorAll
const modal = document.getElementById('confirmation-modal'); // getElementById
const modalTitle = document.querySelector('#modal-title'); // querySelector
const modalMessage = document.querySelector('#modal-message'); // querySelector
const closeModalBtn = document.querySelector('.close-modal'); // querySelector
const modalCloseBtn = document.getElementById('modal-close-btn'); // getElementById


document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});


function initializeApp() {
    
    renderClassroomsTable();
    
    
    populateClassroomSelect();
    
    
    setMinDate();
    
    
    renderReservations();
    
    
    updateStats();
    
    
    setupNavigation();
    
    
    setupFilters();
    
    
    setupReservationForm();
    
    
    setupAddClassroomForm();
    
    
    setupCardNavigation();
    
    
    setupModal();
}


function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSection = item.getAttribute('data-section');
            navigateToSection(targetSection);
        });
    });
}

function navigateToSection(sectionName) {
    
    appState.currentSection = sectionName;
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}


function setupCardNavigation() {
    const featureCards = document.querySelectorAll('.feature-card[data-navigate]');
    
    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetSection = card.getAttribute('data-navigate');
            navigateToSection(targetSection);
        });
    });
}


function renderClassroomsTable() {
    const tbody = document.getElementById('classrooms-tbody');
    
    
    let filteredClassrooms = appState.classrooms.filter(classroom => {
        const matchesCapacity = classroom.capacity >= appState.filters.capacity;
        const matchesStatus = appState.filters.status === 'all' || 
                              classroom.status === appState.filters.status;
        const matchesSearch = classroom.name.toLowerCase()
                              .includes(appState.filters.searchTerm.toLowerCase());
        
        return matchesCapacity && matchesStatus && matchesSearch;
    });
    
    
    tbody.innerHTML = '';
    
    
    filteredClassrooms.forEach(classroom => {
        const row = document.createElement('tr');
        
        const statusClass = classroom.status === 'disponible' ? 
                            'status-disponible' : 'status-ocupada';
        const statusText = classroom.status === 'disponible' ? 
                          'Disponible' : 'Ocupada';
        const buttonDisabled = classroom.status === 'ocupada' ? 'disabled' : '';
        
        row.innerHTML = `
            <td>${classroom.name}</td>
            <td>${classroom.capacity}</td>
            <td>${classroom.resources}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="action-button" 
                        onclick="quickReserve(${classroom.id})" 
                        ${buttonDisabled}>
                    Reservar
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    
    if (filteredClassrooms.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 30px; color: #999;">
                No se encontraron aulas que coincidan con los filtros
            </td>
        `;
        tbody.appendChild(row);
    }
}


function setupFilters() {
    
    const capacityFilter = document.getElementById('filter-capacity');
    capacityFilter.addEventListener('change', (e) => {
        appState.filters.capacity = parseInt(e.target.value);
        renderClassroomsTable();
    });
    
    
    const statusFilter = document.getElementById('filter-status');
    statusFilter.addEventListener('change', (e) => {
        appState.filters.status = e.target.value;
        renderClassroomsTable();
    });
    
    
    const searchInput = document.getElementById('search-classroom');
    searchInput.addEventListener('input', (e) => {
        appState.filters.searchTerm = e.target.value;
        renderClassroomsTable();
    });
}


function populateClassroomSelect() {
    const select = document.getElementById('classroom');
    
    
    select.innerHTML = '<option value="">Seleccione un aula</option>';
    
    
    appState.classrooms
        .filter(classroom => classroom.status === 'disponible')
        .forEach(classroom => {
            const option = document.createElement('option');
            option.value = classroom.id;
            option.textContent = `${classroom.name} - Capacidad: ${classroom.capacity} - ${classroom.resources}`;
            select.appendChild(option);
        });
}

function setMinDate() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}

function setupReservationForm() {
    const form = document.getElementById('reservation-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        
        const classroomId = parseInt(document.getElementById('classroom').value);
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const purpose = document.getElementById('purpose').value;
        
        
        if (!classroomId || !date || !time || !purpose) {
            showModal('Error', 'Por favor complete todos los campos', 'error');
            return;
        }
        
        
        const classroom = appState.classrooms.find(c => c.id === classroomId);
        
        
        const reservation = {
            id: Date.now(),
            classroom: classroom.name,
            classroomId: classroomId,
            date: date,
            time: time,
            purpose: purpose,
            status: 'activa'
        };
        
        
        appState.reservations.push(reservation);
        
        
        classroom.status = 'ocupada';
        
        
        renderClassroomsTable();
        populateClassroomSelect();
        renderReservations();
        updateStats();
        
        
        form.reset();
        
        
        showModal(
            'Reserva Exitosa', 
            `Se ha reservado ${classroom.name} para el ${formatDate(date)} a las ${time}`
        );
    });
}


function quickReserve(classroomId) {
    
    navigateToSection('reservar');
    
    
    const select = document.getElementById('classroom');
    select.value = classroomId;
    
    
    setTimeout(() => {
        select.focus();
    }, 300);
}


function renderReservations() {
    const container = document.getElementById('reservations-list');
    
    
    container.innerHTML = '';
    
    
    if (appState.reservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>No tienes reservas activas</p>
            </div>
        `;
        return;
    }
    
    
    appState.reservations.forEach(reservation => {
        const reservationDiv = document.createElement('div');
        reservationDiv.className = 'reservation-item';
        
        reservationDiv.innerHTML = `
            <div class="reservation-info">
                <h4>${reservation.classroom}</h4>
                <p><i class="fas fa-calendar"></i> Fecha: ${formatDate(reservation.date)}</p>
                <p><i class="fas fa-clock"></i> Hora: ${reservation.time}</p>
                <p><i class="fas fa-info-circle"></i> Propósito: ${reservation.purpose}</p>
            </div>
            <div class="reservation-actions">
                <button class="cancel-button" onclick="cancelReservation(${reservation.id})">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        `;
        
        container.appendChild(reservationDiv);
    });
}


function cancelReservation(reservationId) {
    
    if (!confirm('¿Está seguro de que desea cancelar esta reserva?')) {
        return;
    }
    
    
    const reservationIndex = appState.reservations.findIndex(r => r.id === reservationId);
    
    if (reservationIndex !== -1) {
        const reservation = appState.reservations[reservationIndex];
        
        
        const classroom = appState.classrooms.find(c => c.id === reservation.classroomId);
        if (classroom) {
            classroom.status = 'disponible';
        }
        
        
        appState.reservations.splice(reservationIndex, 1);
        
        
        renderReservations();
        renderClassroomsTable();
        populateClassroomSelect();
        updateStats();
        
        
        showModal('Reserva Cancelada', 'La reserva ha sido cancelada exitosamente');
    }
}


function setupAddClassroomForm() {
    const form = document.getElementById('add-classroom-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        
        const name = document.getElementById('new-classroom-name').value;
        const capacity = parseInt(document.getElementById('new-classroom-capacity').value);
        const resources = document.getElementById('new-classroom-resources').value;
        
        
        if (!name || !capacity || !resources) {
            showModal('Error', 'Por favor complete todos los campos', 'error');
            return;
        }
        
        
        const newId = Math.max(...appState.classrooms.map(c => c.id)) + 1;
        
        
        const newClassroom = {
            id: newId,
            name: name,
            capacity: capacity,
            resources: resources,
            status: 'disponible'
        };
        
        
        appState.classrooms.push(newClassroom);
        
        
        renderClassroomsTable();
        populateClassroomSelect();
        updateStats();
        
        
        form.reset();
        
        
        showModal('Aula Agregada', `${name} ha sido agregada exitosamente al sistema`);
    });
}


function updateStats() {
    
    const totalClassrooms = appState.classrooms.length;
    document.getElementById('stat-total-classrooms').textContent = totalClassrooms;
    
    
    const availableClassrooms = appState.classrooms.filter(c => c.status === 'disponible').length;
    document.getElementById('stat-available-classrooms').textContent = availableClassrooms;
    
    
    const activeReservations = appState.reservations.length;
    document.getElementById('stat-active-reservations').textContent = activeReservations;
}


function setupModal() {
    
    closeModalBtn.addEventListener('click', closeModal);
    
    
    modalCloseBtn.addEventListener('click', closeModal);
    
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function showModal(title, message, type = 'success') {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    
    const modalIcon = document.querySelector('.modal-icon i');
    if (type === 'error') {
        modalIcon.className = 'fas fa-exclamation-circle';
        modalIcon.style.color = 'var(--accent-color)';
    } else {
        modalIcon.className = 'fas fa-check-circle';
        modalIcon.style.color = 'var(--success-color)';
    }
    
    
    modal.classList.add('show');
}

function closeModal() {
    
    modal.classList.remove('show');
}


function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}
