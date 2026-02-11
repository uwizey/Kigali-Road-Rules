function toggleMobileMenu() {
    const links = document.querySelector('.links');
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    
    // Position mobile menu below header
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

// ===== TOGGLE SIDEBAR FOR MOBILE =====
function toggleSidebar() {
    const sidebar = document.querySelector('.left-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// ===== CLOSE SIDEBAR =====
function closeSidebar() {
    const sidebar = document.querySelector('.left-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// ===== ACTION BUTTON HANDLERS (Placeholders for later) =====
function handleProgress() {
    console.log('My Progress clicked');
    alert('My Progress feature - Coming soon!');
}

function handleBookmarks() {
    console.log('Bookmarks clicked');
    alert('Bookmarks feature - Coming soon!');
}

function handleTakeTest() {
    console.log('Take Test clicked');
    alert('Take Test feature - Coming soon!');
}

// ===== TOGGLE TOPIC (EXPAND/COLLAPSE) =====
function toggleTopic(topicHeader) {
    // Get the subtopics container (next sibling of the button)
    const subtopics = topicHeader.nextElementSibling;
    
    // Check if this topic is currently active
    const isActive = topicHeader.classList.contains('active');
    
    // Close all other topics first
    const allHeaders = document.querySelectorAll('.topic-header');
    const allSubtopics = document.querySelectorAll('.subtopics');
    
    allHeaders.forEach(header => header.classList.remove('active'));
    allSubtopics.forEach(sub => sub.classList.remove('open'));
    
    // If it wasn't active, open it
    if (!isActive) {
        topicHeader.classList.add('active');
        subtopics.classList.add('open');
    }
}

// ===== SHOW CONTENT BASED ON SUBTOPIC =====
function showContent(sectionId) {
    // Hide all content sections
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(section => section.classList.remove('active'));
    
    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Highlight active subtopic
    const allSubtopics = document.querySelectorAll('.subtopic-btn');
    allSubtopics.forEach(btn => btn.classList.remove('active'));
    
    // Find and highlight the clicked subtopic
    event.target.classList.add('active');
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loaded successfully');
    
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
});