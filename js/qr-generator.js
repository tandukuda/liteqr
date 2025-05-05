/**
 * QR Code generation functionality
 */

// DOM Elements
const textInput = document.getElementById('text-input');
const qrSizeSelect = document.getElementById('qr-size');
const errorLevelSelect = document.getElementById('error-level');
const cornerStyleSelect = document.getElementById('corner-style');
const foregroundColorInput = document.getElementById('foreground-color');
const backgroundColorInput = document.getElementById('background-color');
const dynamicQrCheckbox = document.getElementById('dynamic-qr');
const generateBtn = document.getElementById('generate-btn');
const qrcodeDiv = document.getElementById('qrcode');
const placeholderText = document.getElementById('placeholder-text');
const downloadOptions = document.getElementById('download-options');
const downloadPng = document.getElementById('download-png');
const downloadJpg = document.getElementById('download-jpg');
const downloadSvg = document.getElementById('download-svg');
const inputError = document.getElementById('input-error');

// QR Code instance
window.qrcode = null;

// Function to get base URL for dynamic QR codes
function getBaseUrl() {
    // When deployed to Vercel, this will be the actual URL
    return window.location.origin;
}

// Generate QR Code function
function generateQR() {
    const text = textInput.value.trim();
    const size = parseInt(qrSizeSelect.value);
    const errorLevel = errorLevelSelect.value;
    const cornerStyle = cornerStyleSelect.value;
    const foregroundColor = foregroundColorInput.value;
    const backgroundColor = backgroundColorInput.value;
    const isDynamic = dynamicQrCheckbox.checked;
    
    // Validate input
    if (text === '') {
        inputError.style.display = 'block';
        textInput.focus();
        return;
    } else {
        inputError.style.display = 'none';
    }
    
    // Show loading state
    const originalBtnText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<div class="spinner"></div><span>Generating...</span>';
    generateBtn.disabled = true;
    
    // Clear previous QR code
    qrcodeDiv.innerHTML = '';
    qrcodeDiv.classList.add('generating');
    placeholderText.style.display = 'none';
    
    // Hide download options if they were visible
    downloadOptions.classList.add('hidden');
    
    // Process content for QR code
    let qrContent = text;
    
    // If dynamic QR is checked, create a URL that redirects
    if (isDynamic) {
        qrContent = `${getBaseUrl()}/api/redirect?target=${encodeURIComponent(text)}`;
    }
    
    // Small delay to allow UI update and show animation
    setTimeout(() => {
        // Create new QR code
        try {
            // Clear previous QR code
            qrcodeDiv.innerHTML = '';
            
            // Adjust QR code size for very small screens
            let adjustedSize = size;
            if (window.innerWidth < 360 && size > 250) {
                adjustedSize = 250;
            }
            
            // Create the QR code
            window.qrcode = new QRCode(qrcodeDiv, {
                text: qrContent,
                width: adjustedSize,
                height: adjustedSize,
                colorDark: foregroundColor,
                colorLight: backgroundColor,
                correctLevel: QRCode.CorrectLevel[errorLevel]
            });
            
            // Remove generating class
            qrcodeDiv.classList.remove('generating');
            
            // If a non-default corner style is selected, apply it after a slight delay
            // to ensure the QR code has fully rendered
            if (cornerStyle !== 'square') {
                setTimeout(() => {
                    try {
                        applyCornerStyle(cornerStyle);
                    } catch (error) {
                        console.error('Error applying corner style:', error);
                        // If styling fails, the original QR code is still visible
                    }
                }, 100);
            }
            
            // Save to history
            const qrData = {
                text: text,
                isDynamic: isDynamic,
                size: size,
                errorLevel: errorLevel,
                cornerStyle: cornerStyle,
                foregroundColor: foregroundColor,
                backgroundColor: backgroundColor,
                timestamp: new Date().toISOString()
            };
            saveToHistory(qrData);
            
            // Create download links
            updateDownloadLinks();
            
            // Show download options with animation
            downloadOptions.classList.remove('hidden');
            downloadOptions.classList.add('fade-in');
            
            // Remove animation class after it completes
            setTimeout(() => {
                downloadOptions.classList.remove('fade-in');
            }, 500);
            
            // Reset button state
            generateBtn.innerHTML = originalBtnText;
            generateBtn.disabled = false;
        } catch (error) {
            console.error('Error generating QR code:', error);
            generateBtn.innerHTML = originalBtnText;
            generateBtn.disabled = false;
            placeholderText.textContent = 'Error generating QR code. Please try again.';
            placeholderText.style.display = 'block';
        }
    }, 600);
}

// Function to apply corner styles to the QR code
function applyCornerStyle(style) {
    // Skip if the style is square (default)
    if (style === 'square') return;
    
    // Get the QR code image
    const qrImage = qrcodeDiv.querySelector('img');
    
    if (!qrImage || !qrImage.complete) {
        // If image isn't loaded yet, wait for it
        if (qrImage) {
            qrImage.onload = function() {
                applyCornerStyleToImage(qrImage, style);
            };
        }
        return;
    }
    
    applyCornerStyleToImage(qrImage, style);
}

function applyCornerStyleToImage(qrImage, style) {
    try {
        // Create a container for our styled QR code
        const svgContainer = document.createElement('div');
        svgContainer.className = 'styled-qr-container';
        svgContainer.style.width = qrImage.width + 'px';
        svgContainer.style.height = qrImage.height + 'px';
        
        // Draw the QR code to a canvas to analyze its pixel data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = qrImage.width;
        canvas.height = qrImage.height;
        ctx.drawImage(qrImage, 0, 0);
        
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Determine the module size by analyzing the image
        const size = qrImage.width;
        let moduleSize = 0;
        
        // Scan the image to find the first black pixel (start of a module)
        let startX = 0;
        for (let x = 0; x < size; x++) {
            const index = (x + size * 10) * 4; // check on the 10th row
            if (data[index] < 128) { // black pixel
                startX = x;
                break;
            }
        }
        
        // Find the width of the module
        let endX = startX;
        for (let x = startX; x < size; x++) {
            const index = (x + size * 10) * 4;
            if (data[index] >= 128) { // white pixel
                endX = x;
                break;
            }
        }
        
        moduleSize = endX - startX;
        if (moduleSize <= 0) moduleSize = Math.floor(size / 25); // Fallback
        
        // Estimate module count based on moduleSize
        const moduleCount = Math.ceil(size / moduleSize);
        
        // Create SVG content
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <rect width="100%" height="100%" fill="${backgroundColorInput.value}"/>`;
        
        // Set radius based on corner style and module size
        let radius = style === 'slightly-rounded' ? moduleSize * 0.3 : moduleSize * 0.5;
        
        // Create a 2D array to represent QR modules
        const modules = Array(moduleCount).fill().map(() => Array(moduleCount).fill(false));
        
        // Detect dark modules
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                // Check the center of each module
                const x = Math.floor((col + 0.5) * moduleSize);
                const y = Math.floor((row + 0.5) * moduleSize);
                
                // Skip if out of bounds
                if (x >= size || y >= size) continue;
                
                const pixelIndex = (y * size + x) * 4;
                
                // If pixel is dark (not white)
                if (pixelIndex < data.length && data[pixelIndex] < 128) {
                    modules[row][col] = true;
                }
            }
        }
        
        // Draw modules with rounded corners where appropriate
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (modules[row][col]) {
                    const x = col * moduleSize;
                    const y = row * moduleSize;
                    
                    // Check surrounding modules to determine corners
                    const hasTop = row > 0 && modules[row-1][col];
                    const hasRight = col < moduleCount-1 && modules[row][col+1];
                    const hasBottom = row < moduleCount-1 && modules[row+1][col];
                    const hasLeft = col > 0 && modules[row][col-1];
                    
                    // Calculate corner radii
                    const topLeftRadius = (!hasTop && !hasLeft) ? radius : 0;
                    const topRightRadius = (!hasTop && !hasRight) ? radius : 0;
                    const bottomLeftRadius = (!hasBottom && !hasLeft) ? radius : 0;
                    const bottomRightRadius = (!hasBottom && !hasRight) ? radius : 0;
                    
                    // Create path for rounded corners
                    svgContent += `<path d="
                        M ${x + topLeftRadius} ${y}
                        L ${x + moduleSize - topRightRadius} ${y}
                        Q ${x + moduleSize} ${y} ${x + moduleSize} ${y + topRightRadius}
                        L ${x + moduleSize} ${y + moduleSize - bottomRightRadius}
                        Q ${x + moduleSize} ${y + moduleSize} ${x + moduleSize - bottomRightRadius} ${y + moduleSize}
                        L ${x + bottomLeftRadius} ${y + moduleSize}
                        Q ${x} ${y + moduleSize} ${x} ${y + moduleSize - bottomLeftRadius}
                        L ${x} ${y + topLeftRadius}
                        Q ${x} ${y} ${x + topLeftRadius} ${y}
                        Z" fill="${foregroundColorInput.value}" />`;
                }
            }
        }
        
        // Close SVG
        svgContent += `</svg>`;
        
        // Add the SVG to the container
        svgContainer.innerHTML = svgContent;
        
        // Replace the original QR code with our styled version
        qrImage.style.display = 'none';
        qrImage.insertAdjacentElement('afterend', svgContainer);
        
        // Update download links with the styled QR code
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        downloadSvg.href = svgUrl;
        
        // Update PNG and JPG links
        const svgImage = new Image();
        svgImage.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(svgImage, 0, 0, size, size);
            downloadPng.href = canvas.toDataURL('image/png');
            downloadJpg.href = canvas.toDataURL('image/jpeg', 0.95);
        };
        svgImage.src = svgUrl;
        
    } catch (error) {
        console.error('Error styling QR code:', error);
        // Make original QR code visible in case of an error
        qrImage.style.display = 'block';
    }
}

// Function to update download links
function updateDownloadLinks() {
    setTimeout(() => {
        const img = qrcodeDiv.querySelector('img');
        
        if (img) {
            const size = parseInt(qrSizeSelect.value);
            
            // Create canvas for PNG/JPG conversion
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            // Wait for image to load if needed
            if (!img.complete) {
                img.onload = function() {
                    createDownloadLinks(img, canvas, ctx, size);
                };
            } else {
                createDownloadLinks(img, canvas, ctx, size);
            }
        }
    }, 100);
}

// Helper function to create download links
function createDownloadLinks(img, canvas, ctx, size) {
    try {
        // Draw image to canvas with appropriate background color
        ctx.fillStyle = backgroundColorInput.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, size, size);
        
        // Set PNG download link
        downloadPng.href = canvas.toDataURL('image/png');
        
        // Set JPG download link
        downloadJpg.href = canvas.toDataURL('image/jpeg', 0.95);
        
        // Set SVG download link
        const svgContent = generateSvgQrCode();
        const svgBlob = new Blob([svgContent], {type: 'image/svg+xml'});
        downloadSvg.href = URL.createObjectURL(svgBlob);
    } catch (e) {
        console.error('Error creating download links:', e);
    }
}

// Function to generate SVG QR code
function generateSvgQrCode() {
    try {
        // Create a QR code matrix using the qrcode.js library
        if (!window.qrcode) {
            console.error('QR code object not properly initialized');
            return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50">QR Error</text></svg>';
        }
        
        // If we have a styled QR code, use that SVG
        const styledQR = qrcodeDiv.querySelector('.styled-qr-container');
        if (styledQR && styledQR.innerHTML) {
            return styledQR.innerHTML;
        }
        
        // Otherwise generate a basic SVG from the image
        const qrImage = qrcodeDiv.querySelector('img');
        if (!qrImage) {
            return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50">QR Error</text></svg>';
        }
        
        const size = parseInt(qrSizeSelect.value);
        
        // Create a canvas to sample the QR code pixels
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = qrImage.width;
        canvas.height = qrImage.height;
        ctx.drawImage(qrImage, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Create SVG
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <rect width="100%" height="100%" fill="${backgroundColorInput.value}"/>`;
        
        // Add each dark pixel as a small rectangle
        const pixelSize = 1;
        for (let y = 0; y < canvas.height; y += pixelSize) {
            for (let x = 0; x < canvas.width; x += pixelSize) {
                const i = (y * canvas.width + x) * 4;
                // Check if this pixel is dark (not white)
                if (i < data.length && data[i] < 128) {
                    svg += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="${foregroundColorInput.value}" />`;
                }
            }
        }
        
        svg += `</svg>`;
        return svg;
    } catch (error) {
        console.error('Error generating SVG QR code:', error);
        return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50">SVG Error</text></svg>';
    }
}

// Function to regenerate QR code with current theme colors
window.regenerateQRWithThemeColors = function() {
    // Get current settings
    const text = textInput.value.trim();
    const size = parseInt(qrSizeSelect.value);
    const errorLevel = errorLevelSelect.value;
    const cornerStyle = cornerStyleSelect.value;
    
    // Get theme-appropriate colors if user hasn't set custom colors
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    
    // Only update colors if user hasn't manually changed them
    const defaultLightFg = "#575279";
    const defaultLightBg = "#fffaf3";
    const defaultDarkFg = "#e0def4";
    const defaultDarkBg = "#2a273f";
    
    // Update color inputs if they're at default values
    if (foregroundColorInput.value === defaultLightFg || foregroundColorInput.value === defaultDarkFg) {
        foregroundColorInput.value = isDarkMode ? defaultDarkFg : defaultLightFg;
    }
    
    if (backgroundColorInput.value === defaultLightBg || backgroundColorInput.value === defaultDarkBg) {
        backgroundColorInput.value = isDarkMode ? defaultDarkBg : defaultLightBg;
    }
    
    // Regenerate QR code with current settings
    generateQR();
};

// Event listeners
generateBtn.addEventListener('click', generateQR);

// Also generate QR code when Enter key is pressed in input field
textInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        generateQR();
    }
});
