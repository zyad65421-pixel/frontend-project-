// Sticky Navigation Shrink Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.padding = '10px 20px';
        header.style.background = 'rgba(139, 69, 19, 1)';
    } else {
        header.style.padding = '20px';
        header.style.background = 'rgba(139, 69, 19, 0.9)';
    }
});

// Typing Effect for Hero Subtitle
const typingText = document.getElementById('typing-text');
const text = "Where every sip feels like home.";
let index = 0;

function typeWriter() {
    if (index < text.length) {
        typingText.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100);
    }
}
typeWriter();

// Smooth Scroll for Navigation Links
document.querySelectorAll('.nav-menu a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Mobile Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Fade-in Animation on Scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.menu-card').forEach(card => {
    observer.observe(card);
});

// Parallax Effect for Hero Background
window.addEventListener('scroll', () => {
    const heroBg = document.querySelector('.hero-bg');
    heroBg.style.transform = `translateY(${window.scrollY * 0.5}px)`;
});