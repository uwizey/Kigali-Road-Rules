// ===== SAMPLE DATA =====
import { FetchData, PostData, DeleteData, UpdateData } from "../js/api/crud.js";

document.getElementById("btn-logout").addEventListener("click", async () => {
    const response =(await FetchData("/logout", true))
    if (response.success) {

        localStorage.removeItem("token");
        alert("Succeessfull Logout");
         window.location.href = "../auth/login.html";
    }
    else {
        alert("logout failed")
    }
})
let topics = [
    {
        id: 1,
        name: "Mathematics",
        description: "Advanced mathematical concepts and problem solving",
        subtopics: [
            { id: 1, name: "Algebra", topicId: 1 },
            { id: 2, name: "Geometry", topicId: 1 },
            { id: 3, name: "Calculus", topicId: 1 }
        ]
    },
    {
        id: 2,
        name: "Physics",
        description: "Fundamental physics principles and applications",
        subtopics: [
            { id: 4, name: "Mechanics", topicId: 2 },
            { id: 5, name: "Thermodynamics", topicId: 2 }
        ]
    },
    {
        id: 3,
        name: "Chemistry",
        description: "Chemical reactions and molecular structures",
        subtopics: [
            { id: 6, name: "Organic Chemistry", topicId: 3 },
            { id: 7, name: "Inorganic Chemistry", topicId: 3 }
        ]
    }
];

let questions = [
    {
        id: 1,
        statement: "What is the derivative of x²?",
        topic: "Mathematics",
        topicId: 1,
        image: null,
        options: {
            A: "2x",
            B: "x",
            C: "x²",
            D: "2"
        },
        correctAnswer: "A",
        created: "2026-01-20"
    },
    {
        id: 2,
        statement: "What is Newton's first law of motion?",
        topic: "Physics",
        topicId: 2,
        image: null,
        options: {
            A: "F = ma",
            B: "An object in motion stays in motion",
            C: "Every action has an equal reaction",
            D: "Energy is conserved"
        },
        correctAnswer: "B",
        created: "2026-01-21"
    }
];

let users = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
        joined: "2025-12-15",
        status: "active"
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "user",
        joined: "2026-01-05",
        status: "active"
    },
    {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        role: "user",
        joined: "2026-01-10",
        status: "inactive"
    }
];

let exams = [
    {
        id: 1,
        name: "Mid-Term Mathematics Exam",
        description: "Comprehensive test covering algebra and geometry",
        questions: [1, 2],
        created: "2026-01-15"
    },
    {
        id: 2,
        name: "Physics Final Exam",
        description: "Complete physics assessment including mechanics and thermodynamics",
        questions: [2],
        created: "2026-01-20"
    }
];

let nextTopicId = 4;
let nextSubtopicId = 8;
let nextQuestionId = 3;
let nextUserId = 4;
let nextExamId = 3;

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    const links = document.querySelector('.links');
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    
    if (links.style.display === 'flex') {
        links.style.position = 'fixed';
        links.style.top = '86px';
        links.style.left = '0';
        links.style.right = '0';
        links.style.background = 'var(--white)';
        links.style.flexDirection = 'column';
        links.style.padding = '20px';
        links.style.boxShadow = 'var(--shadow)';
        links.style.borderBottom = '1px solid var(--border)';
        links.style.zIndex = '1001';
    }
}

// ===== SIDEBAR TOGGLE =====
function toggleSidebar() {
    const sidebar = document.querySelector('.left-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.querySelector('.left-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// ===== SECTION NAVIGATION =====
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update sidebar nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Update header links
    document.querySelectorAll('.links a').forEach(link => {
        link.style.background = '';
        link.style.color = '';
    });
    
    // Close mobile menu
    const links = document.querySelector('.links');
    if (window.innerWidth <= 768) {
        links.style.display = 'none';
        closeSidebar();
    }
    
    console.log(`Navigated to ${sectionId} section`);
}

// ===== CHARTS INITIALIZATION =====
function initializeCharts() {
    // Questions by Topic Chart
    const questionsCtx = document.getElementById('questionsChart').getContext('2d');
    new Chart(questionsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'],
            datasets: [{
                data: [450, 320, 278, 150, 50],
                backgroundColor: [
                    '#0097b2',
                    '#f59e0b',
                    '#10b981',
                    '#8b5cf6',
                    '#ef4444'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // User Growth Chart
    const usersCtx = document.getElementById('usersChart').getContext('2d');
    new Chart(usersCtx, {
        type: 'line',
        data: {
            labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
            datasets: [{
                label: 'New Users',
                data: [450, 589, 720, 890, 1200, 1542],
                borderColor: '#0097b2',
                backgroundColor: 'rgba(0, 151, 178, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Activity Chart
    const activityCtx = document.getElementById('activityChart').getContext('2d');
    new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Tests Taken',
                data: [1200, 1500, 1300, 1700, 1400, 900, 800],
                backgroundColor: '#0097b2',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Performance Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'radar',
        data: {
            labels: ['Math', 'Physics', 'Chemistry', 'Biology', 'History'],
            datasets: [{
                label: 'Average Score',
                data: [85, 78, 82, 75, 88],
                backgroundColor: 'rgba(0, 151, 178, 0.2)',
                borderColor: '#0097b2',
                pointBackgroundColor: '#0097b2',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#0097b2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// ===== TOPICS MANAGEMENT =====
function loadTopics() {
    const topicsList = document.getElementById('topicsList');
    topicsList.innerHTML = '';
    
    topics.forEach(topic => {
        const topicCard = document.createElement('div');
        topicCard.className = 'topic-card';
        topicCard.innerHTML = `
            <div class="topic-header-section">
                <div class="topic-info">
                    <h3>${topic.name}</h3>
                    <p>${topic.description || 'No description provided'}</p>
                </div>
                <div class="topic-actions">
                    <button class="btn-edit" onclick="editTopic(${topic.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteTopic(${topic.id})">Delete</button>
                </div>
            </div>
            <div class="subtopics-container">
                <div class="subtopics-header">
                    <h4>Subtopics (${topic.subtopics.length})</h4>
                    <button class="btn-small" onclick="addSubtopic(${topic.id})">+ Add Subtopic</button>
                </div>
                <div class="subtopics-grid">
                    ${topic.subtopics.map(sub => `
                        <div class="subtopic-item">
                            <span>${sub.name}</span>
                            <div class="subtopic-actions">
                                <button onclick="editSubtopic(${topic.id}, ${sub.id})" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteSubtopic(${topic.id}, ${sub.id})" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        topicsList.appendChild(topicCard);
    });
}

function openTopicModal(topicId = null) {
    const modal = document.getElementById('topicModal');
    const form = document.getElementById('topicForm');
    const title = document.getElementById('topicModalTitle');
    const subtopicsSection = document.getElementById('subtopicsSection');
    
    form.reset();
    document.getElementById('topicId').value = '';
    subtopicsSection.style.display = 'none';
    
    if (topicId) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
            title.textContent = 'Edit Topic';
            document.getElementById('topicId').value = topic.id;
            document.getElementById('topicName').value = topic.name;
            document.getElementById('topicDescription').value = topic.description || '';
            
            // Show subtopics for editing
            subtopicsSection.style.display = 'block';
            loadSubtopicsForEdit(topic);
        }
    } else {
        title.textContent = 'Add New Topic';
    }
    
    modal.classList.add('active');
}

function closeTopicModal() {
    document.getElementById('topicModal').classList.remove('active');
}

function loadSubtopicsForEdit(topic) {
    const subtopicsList = document.getElementById('subtopicsList');
    subtopicsList.innerHTML = '';
    
    topic.subtopics.forEach(sub => {
        const field = document.createElement('div');
        field.className = 'subtopic-field';
        field.innerHTML = `
            <input type="text" value="${sub.name}" data-subtopic-id="${sub.id}">
            <button type="button" onclick="removeSubtopicField(this, ${sub.id})">Remove</button>
        `;
        subtopicsList.appendChild(field);
    });
}

function addSubtopicField() {
    const subtopicsList = document.getElementById('subtopicsList');
    const field = document.createElement('div');
    field.className = 'subtopic-field';
    field.innerHTML = `
        <input type="text" placeholder="Enter subtopic name" data-subtopic-id="new">
        <button type="button" onclick="removeSubtopicField(this)">Remove</button>
    `;
    subtopicsList.appendChild(field);
}

function removeSubtopicField(button, subtopicId = null) {
    if (subtopicId) {
        if (confirm('Are you sure you want to delete this subtopic?')) {
            button.parentElement.remove();
            console.log(`Subtopic ${subtopicId} marked for deletion`);
        }
    } else {
        button.parentElement.remove();
    }
}

function handleTopicSubmit(event) {
    event.preventDefault();
    
    const topicId = document.getElementById('topicId').value;
    const name = document.getElementById('topicName').value;
    const description = document.getElementById('topicDescription').value;
    
    // Get all subtopics from the form
    const subtopicInputs = document.querySelectorAll('#subtopicsList input');
    const subtopics = [];
    
    subtopicInputs.forEach(input => {
        const subtopicId = input.dataset.subtopicId;
        const subtopicName = input.value.trim();
        
        if (subtopicName) {
            if (subtopicId === 'new') {
                subtopics.push({
                    id: nextSubtopicId++,
                    name: subtopicName,
                    topicId: parseInt(topicId) || nextTopicId
                });
            } else {
                subtopics.push({
                    id: parseInt(subtopicId),
                    name: subtopicName,
                    topicId: parseInt(topicId) || nextTopicId
                });
            }
        }
    });
    
    if (topicId) {
        // Update existing topic
        const topic = topics.find(t => t.id === parseInt(topicId));
        if (topic) {
            topic.name = name;
            topic.description = description;
            topic.subtopics = subtopics;
            console.log('Topic updated:', topic);
        }
    } else {
        // Create new topic
        const newTopic = {
            id: nextTopicId++,
            name,
            description,
            subtopics
        };
        topics.push(newTopic);
        console.log('Topic created:', newTopic);
    }
    
    loadTopics();
    loadTopicOptions();
    closeTopicModal();
}

function editTopic(topicId) {
    openTopicModal(topicId);
}

function deleteTopic(topicId) {
    if (confirm('Are you sure you want to delete this topic? This will also delete all associated subtopics.')) {
        topics = topics.filter(t => t.id !== topicId);
        loadTopics();
        loadTopicOptions();
        console.log(`Topic ${topicId} deleted`);
    }
}

function addSubtopic(topicId) {
    openSubtopicModal(topicId);
}

function editSubtopic(topicId, subtopicId) {
    openSubtopicModal(topicId, subtopicId);
}

function openSubtopicModal(topicId, subtopicId = null) {
    const modal = document.getElementById('subtopicModal');
    const form = document.getElementById('subtopicForm');
    const title = document.getElementById('subtopicModalTitle');
    
    form.reset();
    document.getElementById('subtopicTopicId').value = topicId;
    
    if (subtopicId) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
            const subtopic = topic.subtopics.find(s => s.id === subtopicId);
            if (subtopic) {
                title.textContent = 'Edit Subtopic';
                document.getElementById('subtopicId').value = subtopic.id;
                document.getElementById('subtopicName').value = subtopic.name;
            }
        }
    } else {
        title.textContent = 'Add New Subtopic';
        document.getElementById('subtopicId').value = '';
    }
    
    modal.classList.add('active');
}

function closeSubtopicModal() {
    document.getElementById('subtopicModal').classList.remove('active');
}

function handleSubtopicSubmit(event) {
    event.preventDefault();
    
    const topicId = parseInt(document.getElementById('subtopicTopicId').value);
    const subtopicId = document.getElementById('subtopicId').value;
    const name = document.getElementById('subtopicName').value.trim();
    
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    
    if (subtopicId) {
        // Update existing subtopic
        const subtopic = topic.subtopics.find(s => s.id === parseInt(subtopicId));
        if (subtopic) {
            subtopic.name = name;
            console.log(`Subtopic ${subtopicId} updated to "${name}"`);
        }
    } else {
        // Create new subtopic
        topic.subtopics.push({
            id: nextSubtopicId++,
            name: name,
            topicId
        });
        console.log(`Subtopic "${name}" added to topic ${topicId}`);
    }
    
    loadTopics();
    closeSubtopicModal();
}

function deleteSubtopic(topicId, subtopicId) {
    if (confirm('Are you sure you want to delete this subtopic?')) {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
            topic.subtopics = topic.subtopics.filter(s => s.id !== subtopicId);
            loadTopics();
            console.log(`Subtopic ${subtopicId} deleted from topic ${topicId}`);
        }
    }
}

// ===== QUESTIONS MANAGEMENT =====
function loadQuestions() {
    const tbody = document.getElementById('questionsTableBody');
    tbody.innerHTML = '';
    
    questions.forEach(question => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${question.id}</td>
            <td class="question-text" title="${question.statement}">${question.statement}</td>
            <td>${question.topic}</td>
            <td class="image-indicator">${question.image ? '<i class="fas fa-image" style="color: #0097b2;"></i>' : '-'}</td>
            <td>${question.created}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="editQuestion(${question.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteQuestion(${question.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openQuestionModal(questionId = null) {
    const modal = document.getElementById('questionModal');
    const form = document.getElementById('questionForm');
    const title = document.getElementById('questionModalTitle');
    const imagePreview = document.getElementById('imagePreview');
    
    form.reset();
    imagePreview.innerHTML = '';
    imagePreview.classList.remove('show');
    document.getElementById('questionId').value = '';
    
    if (questionId) {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            title.textContent = 'Edit Question';
            document.getElementById('questionId').value = question.id;
            document.getElementById('questionStatement').value = question.statement;
            document.getElementById('questionTopic').value = question.topicId;
            document.getElementById('optionA').value = question.options.A;
            document.getElementById('optionB').value = question.options.B;
            document.getElementById('optionC').value = question.options.C;
            document.getElementById('optionD').value = question.options.D;
            document.querySelector(`input[value="${question.correctAnswer}"]`).checked = true;
            
            if (question.image) {
                imagePreview.innerHTML = `<img src="${question.image}" alt="Question Image">`;
                imagePreview.classList.add('show');
            }
        }
    } else {
        title.textContent = 'Add New Question';
    }
    
    modal.classList.add('active');
}

function closeQuestionModal() {
    document.getElementById('questionModal').classList.remove('active');
}

function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            preview.classList.add('show');
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
        preview.classList.remove('show');
    }
}

function handleQuestionSubmit(event) {
    event.preventDefault();
    
    const questionId = document.getElementById('questionId').value;
    const statement = document.getElementById('questionStatement').value;
    const topicId = parseInt(document.getElementById('questionTopic').value);
    const topic = topics.find(t => t.id === topicId);
    const correctAnswer = document.querySelector('input[name="correctAnswer"]:checked').value;
    
    const questionData = {
        statement,
        topic: topic ? topic.name : '',
        topicId,
        image: document.getElementById('imagePreview').innerHTML.includes('img') 
            ? document.querySelector('#imagePreview img').src 
            : null,
        options: {
            A: document.getElementById('optionA').value,
            B: document.getElementById('optionB').value,
            C: document.getElementById('optionC').value,
            D: document.getElementById('optionD').value
        },
        correctAnswer
    };
    
    if (questionId) {
        // Update existing question
        const question = questions.find(q => q.id === parseInt(questionId));
        if (question) {
            Object.assign(question, questionData);
            console.log('Question updated:', question);
        }
    } else {
        // Create new question
        const newQuestion = {
            id: nextQuestionId++,
            ...questionData,
            created: new Date().toISOString().split('T')[0]
        };
        questions.push(newQuestion);
        console.log('Question created:', newQuestion);
    }
    
    loadQuestions();
    closeQuestionModal();
}

function editQuestion(questionId) {
    openQuestionModal(questionId);
}

function deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions = questions.filter(q => q.id !== questionId);
        loadQuestions();
        console.log(`Question ${questionId} deleted`);
    }
}

function filterQuestions() {
    const filterTopic = document.getElementById('filterTopic').value;
    const searchTerm = document.getElementById('searchQuestion').value.toLowerCase();
    
    const filtered = questions.filter(q => {
        const matchesTopic = !filterTopic || q.topic === filterTopic;
        const matchesSearch = !searchTerm || q.statement.toLowerCase().includes(searchTerm);
        return matchesTopic && matchesSearch;
    });
    
    displayFilteredQuestions(filtered);
}

function searchQuestions() {
    filterQuestions();
}

function displayFilteredQuestions(filtered) {
    const tbody = document.getElementById('questionsTableBody');
    tbody.innerHTML = '';
    
    filtered.forEach(question => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${question.id}</td>
            <td class="question-text" title="${question.statement}">${question.statement}</td>
            <td>${question.topic}</td>
            <td class="image-indicator">${question.image ? '<i class="fas fa-image" style="color: #0097b2;"></i>' : '-'}</td>
            <td>${question.created}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="editQuestion(${question.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteQuestion(${question.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadTopicOptions() {
    const questionTopicSelect = document.getElementById('questionTopic');
    const filterTopicSelect = document.getElementById('filterTopic');
    
    // Clear and reload question topic select
    questionTopicSelect.innerHTML = '<option value="">Select a topic</option>';
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.id;
        option.textContent = topic.name;
        questionTopicSelect.appendChild(option);
    });
    
    // Clear and reload filter topic select
    filterTopicSelect.innerHTML = '<option value="">All Topics</option>';
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.name;
        option.textContent = topic.name;
        filterTopicSelect.appendChild(option);
    });
}

// ===== USERS MANAGEMENT =====
function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role.toUpperCase()}</td>
            <td>${user.joined}</td>
            <td><span class="status-badge status-${user.status}">${user.status.toUpperCase()}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('userModalTitle');
    const passwordHelp = document.getElementById('passwordHelp');
    const passwordInput = document.getElementById('userPassword');
    
    form.reset();
    document.getElementById('userId').value = '';
    
    if (userId) {
        const user = users.find(u => u.id === userId);
        if (user) {
            title.textContent = 'Edit User';
            document.getElementById('userId').value = user.id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userStatus').value = user.status;
            passwordInput.required = false;
            passwordHelp.style.display = 'block';
        }
    } else {
        title.textContent = 'Add New User';
        passwordInput.required = true;
        passwordHelp.style.display = 'none';
    }
    
    modal.classList.add('active');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}

function handleUserSubmit(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const role = document.getElementById('userRole').value;
    const password = document.getElementById('userPassword').value;
    const status = document.getElementById('userStatus').value;
    
    if (userId) {
        // Update existing user
        const user = users.find(u => u.id === parseInt(userId));
        if (user) {
            user.name = name;
            user.email = email;
            user.role = role;
            user.status = status;
            if (password) {
                console.log(`Password updated for user ${userId}`);
            }
            console.log('User updated:', user);
        }
    } else {
        // Create new user
        const newUser = {
            id: nextUserId++,
            name,
            email,
            role,
            status,
            joined: new Date().toISOString().split('T')[0]
        };
        users.push(newUser);
        console.log('User created:', newUser);
        console.log('Password set for new user');
    }
    
    loadUsers();
    closeUserModal();
}

function editUser(userId) {
    openUserModal(userId);
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(u => u.id !== userId);
        loadUsers();
        console.log(`User ${userId} deleted`);
    }
}

function filterUsers() {
    const filterRole = document.getElementById('filterUserRole').value;
    const searchTerm = document.getElementById('searchUser').value.toLowerCase();
    
    const filtered = users.filter(u => {
        const matchesRole = !filterRole || u.role === filterRole;
        const matchesSearch = !searchTerm || 
            u.name.toLowerCase().includes(searchTerm) || 
            u.email.toLowerCase().includes(searchTerm);
        return matchesRole && matchesSearch;
    });
    
    displayFilteredUsers(filtered);
}

function searchUsers() {
    filterUsers();
}

function displayFilteredUsers(filtered) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    filtered.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role.toUpperCase()}</td>
            <td>${user.joined}</td>
            <td><span class="status-badge status-${user.status}">${user.status.toUpperCase()}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== EXAMS MANAGEMENT =====
let selectedQuestionIds = [];

function loadExams() {
    const examsList = document.getElementById('examsList');
    examsList.innerHTML = '';
    
    if (exams.length === 0) {
        examsList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 40px;">No exams created yet. Click "Add New Exam" to get started.</p>';
        return;
    }
    
    exams.forEach(exam => {
        const examCard = document.createElement('div');
        examCard.className = 'exam-card';
        examCard.innerHTML = `
            <div class="exam-card-header">
                <div>
                    <h3>${exam.name}</h3>
                    <p>${exam.description || 'No description provided'}</p>
                </div>
                <div class="exam-actions">
                    <button class="btn-edit" onclick="editExam(${exam.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteExam(${exam.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <div class="exam-meta">
                <div class="exam-meta-item">
                    <i class="fas fa-question-circle"></i>
                    <span><strong>${exam.questions.length}</strong> Questions</span>
                </div>
                <div class="exam-meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>Created: ${exam.created}</span>
                </div>
            </div>
        `;
        examsList.appendChild(examCard);
    });
}

function openExamModal(examId = null) {
    const modal = document.getElementById('examModal');
    const form = document.getElementById('examForm');
    const title = document.getElementById('examModalTitle');
    
    form.reset();
    document.getElementById('examId').value = '';
    selectedQuestionIds = [];
    
    // Load topic filter options
    const topicFilter = document.getElementById('examQuestionTopicFilter');
    topicFilter.innerHTML = '<option value="">All Topics</option>';
    topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.name;
        option.textContent = topic.name;
        topicFilter.appendChild(option);
    });
    
    if (examId) {
        const exam = exams.find(e => e.id === examId);
        if (exam) {
            title.textContent = 'Edit Exam';
            document.getElementById('examId').value = exam.id;
            document.getElementById('examName').value = exam.name;
            document.getElementById('examDescription').value = exam.description || '';
            selectedQuestionIds = [...exam.questions];
        }
    } else {
        title.textContent = 'Add New Exam';
    }
    
    loadAvailableQuestions();
    updateSelectedQuestionsDisplay();
    modal.classList.add('active');
}

function closeExamModal() {
    document.getElementById('examModal').classList.remove('active');
    selectedQuestionIds = [];
}

function loadAvailableQuestions() {
    const container = document.getElementById('availableQuestions');
    const topicFilter = document.getElementById('examQuestionTopicFilter').value;
    const searchTerm = document.getElementById('examQuestionSearch').value.toLowerCase();
    
    const filtered = questions.filter(q => {
        const matchesTopic = !topicFilter || q.topic === topicFilter;
        const matchesSearch = !searchTerm || q.statement.toLowerCase().includes(searchTerm);
        return matchesTopic && matchesSearch;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">No questions found.</p>';
        return;
    }
    
    container.innerHTML = '';
    filtered.forEach(question => {
        const isSelected = selectedQuestionIds.includes(question.id);
        const item = document.createElement('div');
        item.className = 'question-checkbox-item';
        item.innerHTML = `
            <input type="checkbox" 
                   id="q-${question.id}" 
                   ${isSelected ? 'checked' : ''}
                   onchange="toggleQuestionSelection(${question.id})">
            <div class="question-checkbox-content">
                <strong>${question.statement}</strong>
                <span class="question-topic-badge">${question.topic}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

function filterAvailableQuestions() {
    loadAvailableQuestions();
}

function toggleQuestionSelection(questionId) {
    const index = selectedQuestionIds.indexOf(questionId);
    if (index > -1) {
        selectedQuestionIds.splice(index, 1);
    } else {
        selectedQuestionIds.push(questionId);
    }
    updateSelectedQuestionsDisplay();
}

function updateSelectedQuestionsDisplay() {
    const container = document.getElementById('selectedQuestions');
    const countSpan = document.getElementById('selectedCount');
    
    countSpan.textContent = selectedQuestionIds.length;
    
    if (selectedQuestionIds.length === 0) {
        container.innerHTML = '<p class="no-selection">No questions selected yet</p>';
        return;
    }
    
    container.innerHTML = '';
    selectedQuestionIds.forEach(questionId => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            const item = document.createElement('div');
            item.className = 'selected-question-item';
            item.innerHTML = `
                <span>${question.statement.substring(0, 60)}${question.statement.length > 60 ? '...' : ''}</span>
                <button type="button" onclick="removeQuestionFromSelection(${questionId})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(item);
        }
    });
}

function removeQuestionFromSelection(questionId) {
    const index = selectedQuestionIds.indexOf(questionId);
    if (index > -1) {
        selectedQuestionIds.splice(index, 1);
    }
    
    // Update checkbox
    const checkbox = document.getElementById(`q-${questionId}`);
    if (checkbox) {
        checkbox.checked = false;
    }
    
    updateSelectedQuestionsDisplay();
}

function handleExamSubmit(event) {
    event.preventDefault();
    
    if (selectedQuestionIds.length === 0) {
        alert('Please select at least one question for the exam.');
        return;
    }
    
    const examId = document.getElementById('examId').value;
    const name = document.getElementById('examName').value;
    const description = document.getElementById('examDescription').value;
    
    if (examId) {
        // Update existing exam
        const exam = exams.find(e => e.id === parseInt(examId));
        if (exam) {
            exam.name = name;
            exam.description = description;
            exam.questions = [...selectedQuestionIds];
            console.log('Exam updated:', exam);
        }
    } else {
        // Create new exam
        const newExam = {
            id: nextExamId++,
            name,
            description,
            questions: [...selectedQuestionIds],
            created: new Date().toISOString().split('T')[0]
        };
        exams.push(newExam);
        console.log('Exam created:', newExam);
    }
    
    loadExams();
    closeExamModal();
}

function editExam(examId) {
    openExamModal(examId);
}

function deleteExam(examId) {
    if (confirm('Are you sure you want to delete this exam?')) {
        exams = exams.filter(e => e.id !== examId);
        loadExams();
        console.log(`Exam ${examId} deleted`);
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard loaded successfully');
    
    // Initialize all sections
    initializeCharts();
    loadTopics();
    loadQuestions();
    loadUsers();
    loadExams();
    loadTopicOptions();
    
    // Update statistics
    document.getElementById('totalTopics').textContent = topics.length;
    document.getElementById('totalQuestions').textContent = questions.length;
    document.getElementById('totalUsers').textContent = users.length;
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const links = document.querySelector('.links');
        const toggle = document.querySelector('.mobile-menu-toggle');
        
        if (window.innerWidth <= 768 && links.style.display === 'flex') {
            if (!links.contains(e.target) && !toggle.contains(e.target)) {
                links.style.display = 'none';
            }
        }
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    console.log('All data loaded:', { topics, questions, users, exams });
});
