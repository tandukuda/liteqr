/**
 * Main script file for LiteQR
 */

// DOM Elements
const currentYearElement = document.getElementById('current-year');

// Set current year in footer
currentYearElement.textContent = new Date().getFullYear();

// Initialize the app
function initApp() {
    // Pre-fill input with a default example
    textInput.value = 'https://example.com';
    
    // Initialize theme colors for inputs
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    foregroundColorInput.value = isDarkMode ? "#e0def4" : "#575279";
    backgroundColorInput.value = isDarkMode ? "#2a273f" : "#fffaf3";
    
    // Load history
    loadHistory();
    
    // Add ripple effect to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Handle window resize for responsive QR code
    window.addEventListener('resize', function() {
        if (window.qrcode && textInput.value.trim() !== '') {
            // Only regenerate if screen size changes significantly
            const currentWidth = window.innerWidth;
            const size = parseInt(qrSizeSelect.value);
            if ((currentWidth < 360 && size > 250) || 
                (currentWidth >= 360 && size <= 250)) {
                window.regenerateQRWithThemeColors();
            }
        }
    });
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
