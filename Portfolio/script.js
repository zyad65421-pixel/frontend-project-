document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Dark/Light Theme Switching Logic (Robust implementation)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    const htmlElement = document.documentElement;

    // Check for saved user preference, if any, on load of the website
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('bx-moon', 'bx-sun');
    }

    // Toggle logic
    themeToggleBtn.addEventListener('click', () => {
        let theme = htmlElement.getAttribute('data-theme');
        if (theme === 'light') {
            htmlElement.setAttribute('data-theme', 'dark');
            themeIcon.classList.replace('bx-moon', 'bx-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            themeIcon.classList.replace('bx-sun', 'bx-moon');
            localStorage.setItem('theme', 'light');
        }
    });

    // 2. Contact Form Submission Handling (Flawless JS interactions)
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload
            
            // 1. Show loading/sending state
            btnText.textContent = "Sending...";
            btnIcon.classList.replace('bx-send', 'bx-loader-alt');
            btnIcon.classList.add('bx-spin');
            submitBtn.disabled = true;

            // 2. Simulate network request (2 seconds)
            setTimeout(() => {
                // Success State!
                btnIcon.classList.remove('bx-spin');
                btnIcon.classList.replace('bx-loader-alt', 'bx-check');
                btnText.textContent = "Message Sent Successfully!";
                submitBtn.classList.add('btn-success');
                
                // Clear the form
                contactForm.reset();

                // 3. Revert back to original state after 3 seconds
                setTimeout(() => {
                    btnText.textContent = "Send Message";
                    btnIcon.classList.replace('bx-check', 'bx-send');
                    submitBtn.classList.remove('btn-success');
                    submitBtn.disabled = false;
                }, 3000);

            }, 2000);
        });
    }

    // 3. Initialize AOS Animation Library
    AOS.init({
        duration: 800,
        offset: 50,
        easing: 'ease-out-cubic',
        once: true,
        mirror: false
    });

    // Initialize VanillaTilt if not already applied automatically via data attributes
    // Ensure smooth 3D tilt effects on elements with .tech-card
    if(typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".tech-card, .profile-card"), {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.1,
        });
    }

    // 4. Mobile Navigation Menu
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const menuBtnIcon = menuBtn.querySelector('i');

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        if(navLinks.classList.contains('nav-active')) {
            menuBtnIcon.classList.replace('bx-menu', 'bx-x');
        } else {
            menuBtnIcon.classList.replace('bx-x', 'bx-menu');
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('nav-active');
            menuBtnIcon.classList.replace('bx-x', 'bx-menu');
        });
    });

    // 5. Header Scroll Effect & Active Link Highlight
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 250)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').substring(1) === current) {
                item.classList.add('active');
            }
        });
    });

    // 6. Typing Effect for Hero Section
    const typeText = document.querySelector('.typing-text');
    const phrases = [
        "Aspiring Web Penetration Tester",
        "Cybersecurity Enthusiast",
        "Bug Bounty Hunter",
        "Computer Science Student"
    ];
    let phraseIndex = 0;
    let letterIndex = 0;
    let currentText = "";
    let isDeleting = false;

    function type() {
        if (!typeText) return;

        currentText = phrases[phraseIndex];
        
        if (isDeleting) {
            typeText.textContent = currentText.substring(0, letterIndex - 1);
            letterIndex--;
        } else {
            typeText.textContent = currentText.substring(0, letterIndex + 1);
            letterIndex++;
        }

        let typeSpeed = isDeleting ? 30 : 70; // Faster typing for a snappier feel

        if (!isDeleting && letterIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && letterIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 400;
        }

        setTimeout(type, typeSpeed);
    }
    
    setTimeout(type, 1000);
});
