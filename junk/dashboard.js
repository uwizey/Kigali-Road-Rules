import { FetchData, PostData, DeleteData, UpdateData } from "../js/api/crud.js";

document.getElementById("btn-logout").addEventListener("click", async () => {
    const response =(await FetchData("/logout", true))
    if (response.success) {

        localStorage.removeItem("token");
        alert("Succeessfull Logout");
         window.location.href = "../auth/login.html";
    }
    else {
        console.log(response)
    }
})     // Sidebar toggle functionality
    

const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    menuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    function toggleMobileMenu() {
        console.log('Mobile menu toggled');
    }

    // Topic accordion functionality
    function toggleTopic(headerElement) {
        const topic = headerElement.parentElement;
        const isActive = topic.classList.contains('active');
        
        // Close all topics
        document.querySelectorAll('.topic').forEach(t => {
            t.classList.remove('active');
        });
        
        // Open clicked topic if it wasn't active
        if (!isActive) {
            topic.classList.add('active');
        }
    }

    // Load content based on topic and subtopic
    function loadContent(event, topic, subtopic) {
        event.preventDefault();
        
        // Remove active class from all subtopics
        document.querySelectorAll('.subtopic-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked subtopic
        event.target.classList.add('active');
        
        // Close sidebar on mobile after selection
        if (window.innerWidth <= 900) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
        
        // This is where you'll fetch content from your backend
        // For now, showing example content
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <h1>${formatTitle(subtopic)}</h1>
            <p>Content for <strong>${topic}</strong> → <strong>${subtopic}</strong></p>
            <p>This content will be loaded from your backend based on the topic and subtopic.</p>
            <p><em>Topic ID: ${topic}, Subtopic ID: ${subtopic}</em></p>
        `;
        
        // TODO: Replace with actual backend call
        // Example:
        // fetch(`/api/content?topic=${topic}&subtopic=${subtopic}`)
        //     .then(response => response.json())
        //     .then(data => {
        //         mainContent.innerHTML = data.content;
        //     });
    }

    // Helper function to format titles
    function formatTitle(str) {
        return str.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // Function to dynamically load topics from backend
    function loadTopicsFromBackend() {
        // TODO: Fetch topics from your backend
        // Example structure of data you'd receive:
        /*
        const topics = [
            {
                id: 'overview',
                title: 'Overview',
                subtopics: [
                    { id: 'intro', title: 'Introduction' },
                    { id: 'getting-started', title: 'Getting Started' }
                ]
            },
            // ... more topics
        ];
        */
        
        // Then build the HTML dynamically:
        // buildTopicsNav(topics);
    }

    // Function to build navigation from data
    function buildTopicsNav(topics) {
        const nav = document.getElementById('topicsNav');
        nav.innerHTML = '';
        
        topics.forEach(topic => {
            const topicDiv = document.createElement('div');
            topicDiv.className = 'topic';
            
            const subtopicsHTML = topic.subtopics.map(sub => 
                `<a href="#" class="subtopic-link" onclick="loadContent(event, '${topic.id}', '${sub.id}')">${sub.title}</a>`
            ).join('');
            
            topicDiv.innerHTML = `
                <div class="topic-header" onclick="toggleTopic(this)">
                    <span>${topic.title}</span>
                    <span class="topic-icon">▶</span>
                </div>
                <div class="subtopics">
                    ${subtopicsHTML}
                </div>
            `;
            
            nav.appendChild(topicDiv);
        });
    }
