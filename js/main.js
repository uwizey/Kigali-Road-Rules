 document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".header");

    if (!header) {
        console.error("Header not found!");
        return;
    }

    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 80) {
            // scrolling down
            header.classList.add("hide");
        } else {
            // scrolling up
            header.classList.remove("hide");
        }

         // add background + blur after user scrolls
        if (currentScrollY > 20) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

        lastScrollY = currentScrollY;
    });
});

 let mode = 'login';

        // SVGs for the toggle button
        const eyeOpen = `<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        const eyeClosed = `<svg class="eye-off-icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

        function setMode(newMode) {
            mode = newMode;
            
            // Elements
            const loginTab = document.getElementById('login-tab');
            const signupTab = document.getElementById('signup-tab');
            const confirmGroup = document.getElementById('confirm-password-group');
            const forgotLink = document.getElementById('forgot-password-link');
            const submitBtn = document.getElementById('submit-btn');
            const confirmInput = document.getElementById('confirmPassword');

            // Toggle Classes
            if (mode === 'login') {
                loginTab.classList.add('active');
                signupTab.classList.remove('active');
                confirmGroup.classList.add('hidden');
                forgotLink.classList.remove('hidden');
                submitBtn.innerText = 'Login';
                confirmInput.required = false;
            } else {
                loginTab.classList.remove('active');
                signupTab.classList.add('active');
                confirmGroup.classList.remove('hidden');
                forgotLink.classList.add('hidden');
                submitBtn.innerText = 'Create Account';
                confirmInput.required = true;
            }
        }

        function togglePass(inputId, btn) {
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = eyeClosed;
            } else {
                input.type = 'password';
                btn.innerHTML = eyeOpen;
            }
        }

        document.getElementById('auth-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (mode === 'login') {
                console.log('Login submitted:', { email, password });
                // Simulate navigation
                 window.location.href = "./modeselection.html";
            } else {
                if (password !== confirmPassword) {
                    alert('Passwords do not match!');
                    return;
                }
                console.log('Sign up submitted:', { email, password });
                // Simulate navigation
                window.location.href = "./modeselection.html";
            }
        });


   