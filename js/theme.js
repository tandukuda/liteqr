/**
 * Theme management for LiteQR
 */

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference or use system preference
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = localStorage.getItem('theme');

// Initialize theme
if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
    document.body.setAttribute('data-theme', 'dark');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
} else {
    document.body.removeAttribute('data-theme');
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
}

// Theme toggle functionality
themeToggle.addEventListener('click', () => {
    themeIcon.classList.add('rotate');
    
    setTimeout(() => {
        if (document.body.getAttribute('data-theme') === 'dark') {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        
        // If there's a QR code already generated, regenerate it with the new theme colors
        if (window.qrcode && textInput.value.trim() !== '') {
            window.regenerateQRWithThemeColors();
        }
        
        setTimeout(() => {
            themeIcon.classList.remove('rotate');
        }, 500);
    }, 150);
});