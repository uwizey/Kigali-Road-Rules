# Kigali RoadRules - Enhanced Dashboard

## 🚀 New Features

### Content Mode Enhancements:
1. **7 Content Display Formats:**
   - Flip Cards (image front, text back)
   - Image Right + Text Left
   - Image Left + Text Right
   - Full-width Image with Overlay
   - Accordion (expandable sections)
   - Tabs (multiple content sections)
   - Timeline/Steps (numbered progression)

2. **Automatic Exercises:**
   - Multiple choice exercises appear after each subtopic
   - Instant feedback with correct/incorrect highlighting
   - Score calculation and performance feedback

3. **Topic Navigation:**
   - Previous/Next topic buttons
   - Automatic sidebar updates
   - Seamless topic-to-topic flow
   - Progress tracking with checkmarks

### Q&A Mode Enhancements:
1. **Question Navigation Grid:**
   - Visual grid showing all questions (1-20)
   - Click any number to jump to that question
   - Color-coded states:
     - White/Gray: Unanswered
     - Blue: Answered
     - Current: Blue with glow
     - Green: Correct (after submission)
     - Red: Incorrect (after submission)

2. **Latest Police Exam:**
   - Separate quiz topic with different icon (certificate)
   - 20 official exam questions
   - Can be taken multiple times like other quizzes

3. **Responsive Quiz Interface:**
   - Questions fit within viewport (no scrolling needed)
   - Optimized layout for all screen sizes
   - Timer and progress bar always visible

---

## 📁 File Structure

```
/user/
├── user-dashboard-enhanced.html    # Main HTML file
├── user-dashboard-enhanced.css     # Complete styling
└── user-dashboard-enhanced.js      # All functionality with placeholder data
```

---

## 🔌 Backend Integration Guide

### 1. Content Mode Data Structure

Replace the `CONTENT_DATA` object in JavaScript with your backend API response:

```javascript
// API Endpoint: GET /api/content/topics
{
    "topics": [
        {
            "id": "unique-topic-id",
            "title": "Traffic Signs",
            "icon": "fas fa-traffic-light",  // Font Awesome icon class
            "subtopics": [
                {
                    "id": "unique-subtopic-id",
                    "title": "Warning Signs",
                    "formatType": "flip_card",  // Options: flip_card, image_right, image_left, image_overlay, accordion, tabs, timeline
                    "content": {
                        // Content structure varies by formatType (see below)
                    },
                    "exercise": {
                        "questions": [
                            {
                                "question": "What does a red sign mean?",
                                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                                "correctAnswer": 1  // Index of correct answer (0-3)
                            }
                        ]
                    }
                }
            ]
        }
    ]
}
```

### 2. Content Format Structures

#### A. Flip Card Format (`formatType: "flip_card"`):
```javascript
"content": {
    "cards": [
        {
            "image": "https://example.com/image.jpg",
            "title": "Card Title",
            "description": "Description shown when flipped"
        }
    ]
}
```

#### B. Image Right Format (`formatType: "image_right"`):
```javascript
"content": {
    "title": "Main Title",
    "text": [
        "Paragraph 1",
        "Paragraph 2",
        "Paragraph 3"
    ],
    "image": "https://example.com/image.jpg"
}
```

#### C. Image Left Format (`formatType: "image_left"`):
```javascript
"content": {
    "title": "Main Title",
    "text": [
        "Paragraph 1",
        "Paragraph 2"
    ],
    "image": "https://example.com/image.jpg"
}
```

#### D. Image Overlay Format (`formatType: "image_overlay"`):
```javascript
"content": {
    "title": "Overlay Title",
    "description": "Text shown on image overlay",
    "image": "https://example.com/wide-image.jpg"
}
```

#### E. Accordion Format (`formatType: "accordion"`):
```javascript
"content": {
    "sections": [
        {
            "title": "Section Title",
            "text": "Section content text",
            "image": "https://example.com/image.jpg"  // Optional
        }
    ]
}
```

#### F. Tabs Format (`formatType: "tabs"`):
```javascript
"content": {
    "tabs": [
        {
            "title": "Tab Name",
            "content": "Tab content text",
            "image": "https://example.com/image.jpg"  // Optional
        }
    ]
}
```

#### G. Timeline Format (`formatType: "timeline"`):
```javascript
"content": {
    "steps": [
        {
            "title": "Step Title",
            "description": "Step description",
            "image": "https://example.com/image.jpg"  // Optional
        }
    ]
}
```

### 3. Quiz Mode Data Structure

Replace the `QUIZ_DATA` object with your backend API response:

```javascript
// API Endpoint: GET /api/quizzes
{
    "quizzes": [
        {
            "id": "unique-quiz-id",
            "title": "Traffic Signs Quiz",
            "icon": "fas fa-traffic-light",  // Font Awesome icon
            "questionCount": 15,
            "questions": [
                {
                    "topic": "Traffic Signs",  // Topic badge text
                    "question": "What does a red octagonal sign indicate?",
                    "options": [
                        "Yield",
                        "Stop",
                        "Speed limit",
                        "No parking"
                    ],
                    "correctAnswer": 1,  // Index 0-3
                    "image": "https://example.com/sign.jpg"  // Optional
                }
            ]
        },
        {
            "id": "latest-exam",
            "title": "Latest Police Exam",
            "icon": "fas fa-certificate",  // Different icon for official exam
            "questionCount": 20,
            "questions": [...]
        }
    ]
}
```

---

## 🎨 Easy Customization Guide

### Color Scheme (CSS Variables)

Edit the `:root` section in `user-dashboard-enhanced.css`:

```css
:root {
    --primary: #0097b2;           /* Main blue color */
    --primary-dark: #1e40af;      /* Darker blue */
    --white: #ffffff;
    --black: #0F172A;             /* Text color */
    --gray: #4b5563;              /* Secondary text */
    --border: #e5e7eb;            /* Border color */
    --success: #16a34a;           /* Green for correct */
    --danger: #dc2626;            /* Red for incorrect */
    --warning: #f59e0b;           /* Orange for warnings */
}
```

### Icons

All icons use [Font Awesome 6](https://fontawesome.com/icons). To change icons:

1. Find the icon class (e.g., `fas fa-traffic-light`)
2. Replace in the data objects in JavaScript

**Common Icons:**
- Overview: `fas fa-map`
- Traffic Signs: `fas fa-traffic-light`
- Road Rules: `fas fa-road`
- Latest Exam: `fas fa-certificate`
- Book: `fas fa-book`
- Question: `fas fa-question-circle`

---

## 🔧 Backend Integration Steps

### Step 1: Replace Placeholder Data

In `user-dashboard-enhanced.js`, locate these sections:

```javascript
// Line ~20 - CONTENT MODE DATA
const CONTENT_DATA = { ... }

// Replace with:
let CONTENT_DATA = {};

async function fetchContentData() {
    const response = await fetch('/api/content/topics');
    CONTENT_DATA = await response.json();
    loadContentSidebar();
}

// Line ~XXX - QUIZ MODE DATA
const QUIZ_DATA = { ... }

// Replace with:
let QUIZ_DATA = {};

async function fetchQuizData() {
    const response = await fetch('/api/quizzes');
    QUIZ_DATA = await response.json();
    loadQuizSidebar();
}
```

### Step 2: Update Initialization

```javascript
function initializeApp() {
    // Fetch data from backend
    Promise.all([
        fetchContentData(),
        fetchQuizData()
    ]).then(() => {
        setupEventListeners();
    });
}
```

### Step 3: Save Progress (Optional)

Add these functions to save user progress:

```javascript
async function saveExerciseProgress(topicId, subtopicId, score) {
    await fetch('/api/user/progress/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            topicId,
            subtopicId,
            score,
            completedAt: new Date().toISOString()
        })
    });
}

async function saveQuizResults(quizId, score, answers, timeSpent) {
    await fetch('/api/user/progress/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            quizId,
            score,
            answers,
            timeSpent,
            completedAt: new Date().toISOString()
        })
    });
}
```

### Step 4: Update Stats Display

Fetch user stats on page load:

```javascript
async function loadUserStats() {
    const response = await fetch('/api/user/stats');
    const stats = await response.json();
    
    // Update quiz stats
    document.getElementById('statTestsTaken').textContent = stats.testsTaken;
    document.getElementById('statAvgScore').textContent = stats.avgScore + '%';
    document.getElementById('statBestScore').textContent = stats.bestScore + '%';
    
    // Update quick stats
    // ... update bookmarks, study time, completed topics
}
```

---

## 📱 Responsive Breakpoints

The dashboard is fully responsive with these breakpoints:

- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: < 480px

---

## 🎯 Key JavaScript Functions to Know

### Content Mode:
- `loadContent(event, topicId, subtopicId)` - Loads a specific subtopic
- `renderContent(subtopic)` - Renders content based on format type
- `submitExercise()` - Grades exercise and shows results
- `navigateTopic(direction)` - Goes to next/previous topic

### Quiz Mode:
- `startQuiz(quizId)` - Initializes a quiz
- `loadQuestion(index)` - Loads a specific question
- `selectAnswer(optionIndex)` - Records user's answer
- `submitQuiz()` - Calculates score and shows results
- `jumpToQuestion(index)` - Navigates to specific question via grid

### UI Functions:
- `switchMode(mode)` - Switches between content/quiz mode
- `toggleSidebar()` - Opens/closes sidebar (mobile)
- `toggleTopic(element)` - Expands/collapses topic in sidebar

---

## 🔒 Important Notes

1. **Image URLs**: All placeholder images use `via.placeholder.com`. Replace with your actual image URLs.

2. **Format Selection**: The admin should select `formatType` when creating content. Valid values:
   - `flip_card`
   - `image_right`
   - `image_left`
   - `image_overlay`
   - `accordion`
   - `tabs`
   - `timeline`

3. **Exercise Questions**: Each subtopic can have 0-5 exercise questions. They're optional.

4. **Quiz Questions**: Each quiz should have at least 5 questions. The "Latest Police Exam" should have exactly 20 questions.

5. **Answer Indexing**: All correct answers use zero-based indexing (0, 1, 2, 3).

---

## 🎨 Admin Panel Requirements

Your admin panel should allow:

1. **Topic Management:**
   - Create/Edit/Delete topics
   - Set topic title and icon

2. **Subtopic Management:**
   - Create/Edit/Delete subtopics
   - Select format type from dropdown
   - Input content based on selected format

3. **Exercise Management:**
   - Add multiple-choice questions
   - Set correct answer

4. **Quiz Management:**
   - Create/Edit quiz topics
   - Add questions with 4 options
   - Upload optional question images

---

## 📊 Database Schema Suggestion

```sql
-- Topics
CREATE TABLE topics (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    icon VARCHAR(100),
    order_index INT
);

-- Subtopics
CREATE TABLE subtopics (
    id UUID PRIMARY KEY,
    topic_id UUID REFERENCES topics(id),
    title VARCHAR(255),
    format_type VARCHAR(50),
    content JSON,
    order_index INT
);

-- Exercises
CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    subtopic_id UUID REFERENCES subtopics(id),
    question TEXT,
    options JSON,
    correct_answer INT
);

-- Quizzes
CREATE TABLE quizzes (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    icon VARCHAR(100),
    question_count INT
);

-- Quiz Questions
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY,
    quiz_id UUID REFERENCES quizzes(id),
    topic VARCHAR(100),
    question TEXT,
    options JSON,
    correct_answer INT,
    image_url VARCHAR(500),
    order_index INT
);

-- User Progress
CREATE TABLE user_progress (
    id UUID PRIMARY KEY,
    user_id UUID,
    subtopic_id UUID,
    completed BOOLEAN,
    score INT,
    completed_at TIMESTAMP
);
```

---

## 🐛 Testing Checklist

- [ ] All 7 content formats render correctly
- [ ] Flip cards flip on click
- [ ] Accordion sections expand/collapse
- [ ] Tabs switch properly
- [ ] Exercises grade correctly
- [ ] Topic navigation works (prev/next)
- [ ] Question navigation grid updates
- [ ] Questions fit in viewport without scrolling
- [ ] Quiz timer works
- [ ] Results display correctly
- [ ] Responsive on mobile, tablet, desktop
- [ ] Sidebar opens/closes on mobile
- [ ] Latest exam appears with certificate icon

---

## 💡 Tips

1. **Performance**: If you have many topics/quizzes, implement pagination or lazy loading
2. **Images**: Optimize images before upload (compress, resize)
3. **Caching**: Cache API responses in localStorage for faster loading
4. **Analytics**: Track which topics users struggle with most
5. **Accessibility**: All interactive elements are keyboard accessible

---

## 📞 Support

For questions about implementation or customization, refer to the inline comments in the JavaScript file. Each function is documented with its purpose and parameters.

---

## 🎉 You're All Set!

The dashboard is now ready for backend integration. Simply connect your APIs, update the data structures, and you're good to go!
