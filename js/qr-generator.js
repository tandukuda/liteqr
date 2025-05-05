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
            
            // Apply corner style
            applyCornerStyle(cornerStyle);
            
            qrcodeDiv.classList.remove('generating');
            
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
    // Get all the QR code cells
    const qrImage = qrcodeDiv.querySelector('img');
    
    // If we have the QR code image, we need to convert it to SVG for styling
    if (qrImage) {
        // First create a container for our SVG QR code
        const svgContainer = document.createElement('div');
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
        
        // Create SVG
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
            <rect width="100%" height="100%" fill="${backgroundColorInput.value}"/>`;
        
        // Determine the module size (each QR code square)
        const moduleSize = canvas.width / window.qrcode._oQRCode.moduleCount;
        
        // Set radius based on corner style
        let radius = 0;
        switch(style) {
            case 'slightly-rounded':
                radius = moduleSize * 0.3; // 30% of a module size
                break;
            case 'very-rounded':
                radius = moduleSize * 0.5; // 50% of a module size
                break;
            default: // square
                radius = 0;
        }
        
        // Only proceed with special styling for rounded corners
        if (radius > 0) {
            // Group all modules in the QR code
            const moduleCount = window.qrcode._oQRCode.moduleCount;
            
            // Iterate through each module in the QR code
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    // Check if this module should be colored (is dark)
                    if (window.qrcode._oQRCode.isDark(row, col)) {
                        // Determine the position of this module
                        const x = col * moduleSize;
                        const y = row * moduleSize;
                        
                        // Check if the surrounding modules are dark to determine if this is an edge
                        const top = row > 0 ? window.qrcode._oQRCode.isDark(row - 1, col) : false;
                        const right = col < moduleCount - 1 ? window.qrcode._oQRCode.isDark(row, col + 1) : false;
                        const bottom = row < moduleCount - 1 ? window.qrcode._oQRCode.isDark(row + 1, col) : false;
                        const left = col > 0 ? window.qrcode._oQRCode.isDark(row, col - 1) : false;
                        
                        // Determine if this is a corner module
                        const topLeft = !top && !left;
                        const topRight = !top && !right;
                        const bottomLeft = !bottom && !left;
                        const bottomRight = !bottom && !right;
                        
                        // Create the appropriate SVG shape based on surrounding modules
                        // We'll use a rect with border-radius for rounded corners
                        let rx = "0"; // Default x-radius
                        let ry = "0"; // Default y-radius
                        
                        // Adjust radius based on position
                        if (topLeft) rx = ry = `${radius}`;
                        if (topRight) rx = ry = `${radius}`;
                        if (bottomLeft) rx = ry = `${radius}`;
                        if (bottomRight) rx = ry = `${radius}`;
                        
                        // Add the module to the SVG
                        svgContent += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${foregroundColorInput.value}" rx="${rx}" ry="${ry}" />`;
                    }
                }
            }
        } else {
            // For square style, use the original pixel data to create the SVG
            const pixelSize = 1; // 1px per SVG rect for high resolution
            
            for (let y = 0; y < canvas.height; y += pixelSize) {
                for (let x = 0; x < canvas.width; x += pixelSize) {
                    const i = (y * canvas.width + x) * 4;
                    // Check if this pixel is dark (not white)
                    if (data[i] < 128 || data[i + 1] < 128 || data[i + 2] < 128) {
                        svgContent += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="${foregroundColorInput.value}" />`;
                    }
                }
            }
        }
        
        // Close the SVG
        svgContent += `</svg>`;
        
        // Add the SVG to the container
        svgContainer.innerHTML = svgContent;
        
        // Replace the QR code image with our SVG
        qrImage.style.display = 'none';
        qrImage.insertAdjacentElement('afterend', svgContainer);
        
        // Update the download methods to use our SVG
        const svgBlob = new Blob([svgContent], {type: 'image/svg+xml'});
        downloadSvg.href = URL.createObjectURL(svgBlob);
        
        // Also update the PNG and JPG download methods
        const svgImage = new Image();
        svgImage.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = svgImage.width;
            canvas.height = svgImage.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(svgImage, 0, 0);
            downloadPng.href = canvas.toDataURL('image/png');
            downloadJpg.href = canvas.toDataURL('image/jpeg', 0.95);
        };
        svgImage.src = URL.createObjectURL(svgBlob);
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
            
            // Draw image to canvas with appropriate background color
            ctx.fillStyle = backgroundColorInput.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, size, size);
            
            // Set PNG download link
            downloadPng.href = canvas.toDataURL('image/png');
            
            // Set JPG download link
            downloadJpg.href = canvas.toDataURL('image/jpeg', 0.95);
            
            try {
                // Set SVG download link
                const svgContent = generateSvgQrCode();
                const svgBlob = new Blob([svgContent], {type: 'image/svg+xml'});
                downloadSvg.href = URL.createObjectURL(svgBlob);
            } catch (e) {
                console.error('Error creating SVG:', e);
            }
        }
    }, 100);
}

// Function to generate SVG QR code
function generateSvgQrCode() {
    try {
        // Create a QR code matrix using the qrcode.js library
        if (!window.qrcode || !window.qrcode._oQRCode) {
            console.error('QR code object not properly initialized');
            return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50">QR Error</text></svg>';
        }
        
        const qr = window.qrcode._oQRCode;
        const size = parseInt(qrSizeSelect.value);
        
        // Compute the cell size and margin
        const moduleCount = qr.moduleCount;
        const cellSize = Math.floor(size / moduleCount);
        const margin = Math.floor((size - (moduleCount * cellSize)) / 2);
        
        // Get colors for SVG
        const fillColor = foregroundColorInput.value;
        const bgColor = backgroundColorInput.value;
        
        // Initialize SVG content
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <rect width="100%" height="100%" fill="${bgColor}"/>`;
        
        // Add each QR code cell to the SVG
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    const x = margin + col * cellSize;
                    const y = margin + row * cellSize;
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fillColor}"/>`;
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
