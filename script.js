document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const profileSetup = document.getElementById('profile-setup');
    const appContainer = document.getElementById('app-container');

    const profileImagePreview = document.getElementById('profile-image-preview');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileNameDisplay = document.getElementById('profile-name-display');
    const enterAppBtn = document.getElementById('enter-app-btn');

    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeButton = editProfileModal.querySelector('.close-button');
    const profileImageUpload = document.getElementById('profile-image-upload');
    const profileNameInput = document.getElementById('profile-name-input');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelProfileBtn = document.getElementById('cancel-profile-btn');

    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const toggleDarkModeBtn = document.getElementById('toggleDarkMode');
    const filterAllBtn = document.getElementById('filterAll');
    const filterActiveBtn = document.getElementById('filterActive');
    const filterCompletedBtn = document.getElementById('filterCompleted'); 
    const clearCompletedBtn = document.getElementById('clearCompleted'); // Este es para "Eliminar Completados"
    const datetimeDiv = document.getElementById('datetime');

    // Elementos del encabezado de la app
    const profileIconPreviewHeader = document.getElementById('profile-icon-preview'); 
    const profileNameHeader = document.getElementById('profile-name-header');

    // --- Variables Globales ---
    let profileData = loadProfile();
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let draggedTaskIndex = null;
    let datetimeIntervalId = null; // Para controlar el intervalo de fecha/hora

    // --- Funciones de Utilidad ---

    function updateDateTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Formato 24 horas
        };
        // Para formato más legible y localizado
        datetimeDiv.textContent = now.toLocaleDateString('es-ES', options);
    }

    // Inicia o reinicia el actualizador de fecha y hora
    function startDateTimeUpdater() {
        if (datetimeIntervalId) {
            clearInterval(datetimeIntervalId); // Limpia si ya existe uno
        }
        updateDateTime(); // Actualiza inmediatamente
        datetimeIntervalId = setInterval(updateDateTime, 1000); // Luego cada segundo
    }

    function loadProfile() {
        const storedProfile = localStorage.getItem('userProfile');
        return storedProfile ? JSON.parse(storedProfile) : { image: null, name: '' };
    }

    function saveProfile(data) {
        localStorage.setItem('userProfile', JSON.stringify(data));
        profileData = data; // Actualizar la variable global
        displayProfile(profileData);
        displayProfileHeader(profileData);
    }

    // Muestra el perfil en la pantalla de configuración
    function displayProfile(data) {
        profileImagePreview.innerHTML = ''; // Limpiar contenido previo
        if (data.image) {
            const img = document.createElement('img');
            img.src = data.image;
            img.alt = "Foto de perfil"; // Agregar alt para accesibilidad
            profileImagePreview.appendChild(img);
        } else if (data.name) {
            const initials = data.name.split(' ').map(word => word[0]).join('').toUpperCase();
            profileImagePreview.textContent = initials.substring(0, 2);
        } else {
            profileImagePreview.textContent = ''; // Asegurarse de que esté vacío si no hay datos
        }
        profileNameDisplay.textContent = data.name || 'Sin nombre de perfil';
        enterAppBtn.disabled = !data.image && !data.name; // Habilitar si hay imagen O nombre
    }

    // Muestra el perfil en el encabezado de la aplicación
    function displayProfileHeader(data) {
        profileIconPreviewHeader.innerHTML = ''; // Limpiar contenido previo
        if (data.image) {
            const img = document.createElement('img');
            img.src = data.image;
            img.alt = "Icono de perfil"; // Agregar alt para accesibilidad
            profileIconPreviewHeader.appendChild(img);
        } else if (data.name) {
            const initials = data.name.split(' ').map(word => word[0]).join('').toUpperCase();
            profileIconPreviewHeader.textContent = initials.substring(0, 2);
        } else {
            profileIconPreviewHeader.textContent = '';
        }
        profileNameHeader.textContent = data.name || ''; // Puede ser vacío si no hay nombre
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    const renderTasks = (filter = 'all') => {
        taskList.innerHTML = '';
        let filteredTasks = tasks;

        if (filter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.add('task-item'); // Clase para identificar elementos de tarea
            if (task.completed) {
                li.classList.add('completed');
            }

            const checkbox = document.createElement('span');
            checkbox.classList.add('task-checkbox');
            if (task.completed) {
                checkbox.classList.add('checked');
                checkbox.innerHTML = '<i class="fas fa-check"></i>'; // Usar Font Awesome para el check
            }
            // El listener se manejará por delegación de eventos en el (taskList)

            const taskTextSpan = document.createElement('span');
            taskTextSpan.classList.add('task-text');
            taskTextSpan.textContent = task.text;

            li.appendChild(checkbox);
            li.appendChild(taskTextSpan);

            li.setAttribute('draggable', true);
            taskList.appendChild(li);
        });
    };

    const addTask = () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            tasks.push({ text: taskText, completed: false });
            taskInput.value = '';
            saveTasks();
            renderTasks();
        } else {
            alert('Por favor, escribe una tarea.'); // Considerar una notificación en UI en lugar de alert
        }
    };

    const toggleTask = (index) => {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks(); // Re-renderizar para actualizar la UI
    };

    const deleteAllTasks = () => {
        if (confirm('¿Estás seguro de que quieres eliminar TODAS las tareas?')) {
            tasks = [];
            saveTasks();
            renderTasks();
        }
    };

    const deleteCompletedTasks = () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    };

    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
        // Opcional: guardar preferencia de modo oscuro en localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.removeItem('darkMode');
        }
    };

    const filterTasks = (filter) => {
        renderTasks(filter);
        // Opcional: Resaltar el botón de filtro activo
        document.querySelectorAll('.filters button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');
    };

    // --- Funciones de Drag & Drop ---
    const dragStart = (e) => {
        const li = e.target.closest('li');
        if (li) {
            draggedTaskIndex = Array.from(taskList.children).indexOf(li);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', li.innerHTML); // Opcional, para feedback visual
            li.classList.add('dragging'); // Añadir clase visual para arrastrar
        }
    };

    const dragOver = (e) => {
        e.preventDefault(); // Necesario para permitir el "drop"
        const li = e.target.closest('li');
        if (li && li !== taskList.children[draggedTaskIndex]) {
            const boundingBox = li.getBoundingClientRect();
            const offset = boundingBox.y + (boundingBox.height / 2);
            if (e.clientY < offset) {
                // Arrancando por encima de la mitad del elemento
                if (li.previousElementSibling !== taskList.children[draggedTaskIndex]) {
                    taskList.insertBefore(taskList.children[draggedTaskIndex], li);
                }
            } else {
                // Arrancando por debajo de la mitad del elemento
                if (li.nextElementSibling !== taskList.children[draggedTaskIndex]) {
                    taskList.insertBefore(taskList.children[draggedTaskIndex], li.nextElementSibling);
                }
            }
        }
    };

    const drop = () => {
        const newOrder = Array.from(taskList.children).map(li => li.querySelector('.task-text').textContent);
        const reorderedTasks = [];
        newOrder.forEach(text => {
            const originalTask = tasks.find(task => task.text === text);
            if (originalTask) {
                reorderedTasks.push(originalTask);
            }
        });
        tasks = reorderedTasks;
        saveTasks();
        renderTasks(); // Re-renderizar para asegurar la coherencia
        document.querySelector('.dragging')?.classList.remove('dragging'); // Eliminar la clase
    };

    const dragEnd = (e) => {
        e.target.classList.remove('dragging');
    };

    // --- Event Listeners ---

    // Pantalla de Configuración de Perfil
    editProfileBtn.addEventListener('click', () => {
        profileImageUpload.value = ''; // Limpiar input de archivo
        profileNameInput.value = profileData.name;
        // Si hay una imagen cargada previamente, mostrarla en el modal
        if (profileData.image) {
             const img = document.createElement('img');
             img.src = profileData.image;
             profileImagePreview.innerHTML = '';
             profileImagePreview.appendChild(img);
        } else {
            displayProfile(profileData); // Muestra iniciales si no hay imagen
        }
        editProfileModal.style.display = 'block';
    });

    closeButton.addEventListener('click', () => {
        editProfileModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == editProfileModal) {
            editProfileModal.style.display = 'none';
        }
    });

    let uploadedImage = null; // Variable para almacenar la imagen cargada temporalmente
    profileImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                uploadedImage = reader.result;
                profileImagePreview.innerHTML = `<img src="${reader.result}" alt="Vista previa de perfil">`;
            };
            reader.readAsDataURL(file);
        } else {
            uploadedImage = null; // Reiniciar si no se selecciona ningún archivo
            displayProfile(profileData); // Volver a mostrar el perfil actual (iniciales o vacío)
        }
    });

    saveProfileBtn.addEventListener('click', () => {
        const newName = profileNameInput.value.trim();
        const newData = { image: uploadedImage || profileData.image, name: newName }; // Mantener la imagen si no se carga una nueva
        saveProfile(newData);
        editProfileModal.style.display = 'none';
    });

    cancelProfileBtn.addEventListener('click', () => {
        editProfileModal.style.display = 'none';
        uploadedImage = null; // Resetear la imagen temporal al cancelar
        displayProfile(profileData); // Volver a mostrar el perfil original
    });

    enterAppBtn.addEventListener('click', () => {
        profileSetup.style.display = 'none';
        appContainer.style.display = 'block';
        startDateTimeUpdater();
        renderTasks();
        displayProfileHeader(profileData);
    });

    // Event listener para el icono de perfil en el header (para volver a la configuración)
    profileIconPreviewHeader.parentNode.addEventListener('click', () => { // Evento en el contenedor padre
        appContainer.style.display = 'none';
        profileSetup.style.display = 'flex';
        // Opcional: pausar el actualizador de fecha/hora si no es visible
        if (datetimeIntervalId) {
            clearInterval(datetimeIntervalId);
            datetimeIntervalId = null;
        }
    });

    // Eventos de la aplicación To-Do List
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Delegación de eventos para los checkboxes
    taskList.addEventListener('click', (event) => {
        if (event.target.classList.contains('task-checkbox') || event.target.parentNode.classList.contains('task-checkbox')) {
            const checkboxElement = event.target.classList.contains('task-checkbox') ? event.target : event.target.parentNode;
            const li = checkboxElement.closest('li');
            if (li) {
                const index = Array.from(taskList.children).indexOf(li);
                toggleTask(index);
            }
        }
    });

    // Eventos de Drag & Drop
    taskList.addEventListener('dragstart', dragStart);
    taskList.addEventListener('dragover', dragOver);
    taskList.addEventListener('drop', drop);
    taskList.addEventListener('dragend', dragEnd); // Para limpiar la clase 'dragging'

    clearAllBtn.addEventListener('click', deleteAllTasks);
    clearCompletedBtn.addEventListener('click', deleteCompletedTasks);
    toggleDarkModeBtn.addEventListener('click', toggleDarkMode);

    filterAllBtn.addEventListener('click', () => filterTasks('all'));
    filterActiveBtn.addEventListener('click', () => filterTasks('active'));
    filterCompletedBtn.addEventListener('click', () => filterTasks('completed')); // Asegúrate de que el ID del HTML sea 'filterCompleted'

    // --- Inicialización al cargar la página ---
    displayProfile(profileData); // Muestra el perfil inicial en la pantalla de configuración

    // Comprobar la preferencia de modo oscuro al cargar
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    // Decide qué pantalla mostrar al cargar
    if (profileData.image || profileData.name) {
        // Si ya hay un perfil configurado, ir directamente a la aplicación
        profileSetup.style.display = 'none';
        appContainer.style.display = 'block';
        startDateTimeUpdater(); // Iniciar el actualizador de fecha/hora
        renderTasks(); // Renderizar las tareas
        displayProfileHeader(profileData); // Mostrar el perfil en el encabezado
    } else {
        // Si no hay perfil, mostrar la pantalla de configuración
        profileSetup.style.display = 'flex';
        appContainer.style.display = 'none';
    }
});