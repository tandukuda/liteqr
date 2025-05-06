/**
 * QR Code generation functionality
 */

// DOM Elements
const textInput = document.getElementById('text-input');
const qrSizeSelect = document.getElementById('qr-size');
const errorLevelSelect = document.getElementById('error-level');
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
const logoUpload = document.getElementById('logo-upload');
const logoPreview = document.getElementById('logo-preview');
const removeLogoBtn = document.getElementById('remove-logo');
const logoSizeSelect = document.getElementById('logo-size');

// QR Code instance
window.qrcode = null;

// Logo variables
let userLogo = null;
let logoSize = "medium"; // Default logo size

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
            
            // Check if we have a logo to embed
            if (userLogo) {
                generateQRWithLogo(qrContent, adjustedSize, errorLevel, foregroundColor, backgroundColor);
            } else {
                // Create the QR code without logo
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
                
                // Create download links
                updateDownloadLinks();
            }
            
            // Save to history
            const qrData = {
                text: text,
                isDynamic: isDynamic,
                size: size,
                errorLevel: errorLevel,
                foregroundColor: foregroundColor,
                backgroundColor: backgroundColor,
                hasLogo: userLogo !== null,
                logoSize: logoSize,
                timestamp: new Date().toISOString()
            };
            saveToHistory(qrData);
            
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

// Function to generate QR code with logo
function generateQRWithLogo(qrContent, size, errorLevel, foregroundColor, backgroundColor) {
    // Create a temporary div to hold the QR code
    const tempDiv = document.createElement("div");
    
    // Generate the QR code in the temporary div
    const tempQRCode = new QRCode(tempDiv, {
        text: qrContent,
        width: size,
        height: size,
        colorDark: foregroundColor,
        colorLight: backgroundColor,
        correctLevel: QRCode.CorrectLevel[errorLevel]
    });
    
    // Get the canvas with the QR code
    const qrCanvas = tempDiv.querySelector("canvas");
    
    // Create a new canvas to combine QR code and logo
    const combinedCanvas = document.createElement("canvas");
    combinedCanvas.width = size;
    combinedCanvas.height = size;
    const ctx = combinedCanvas.getContext("2d");
    
    // Draw the QR code onto the combined canvas
    ctx.drawImage(qrCanvas, 0, 0, size, size);
    
    // Calculate logo size based on selection
    let logoWidth, logoHeight;
    switch (logoSize) {
        case "small":
            logoWidth = logoHeight = size * 0.15;
            break;
        case "medium":
        default:
            logoWidth = logoHeight = size * 0.25;
            break;
    }
    
    // Calculate position (center)
    const logoX = (size - logoWidth) / 2;
    const logoY = (size - logoHeight) / 2;
    
    // Draw a white background for the logo to ensure good contrast
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4);
    
    // Draw the logo
    ctx.drawImage(userLogo, logoX, logoY, logoWidth, logoHeight);
    
    // Create an image element from the combined canvas
    const combinedImg = document.createElement("img");
    combinedImg.src = combinedCanvas.toDataURL("image/png");
    
    // Add the combined image to the qrcode div
    qrcodeDiv.appendChild(combinedImg);
    qrcodeDiv.classList.remove('generating');
    
    // Store reference for downloadable content
    window.qrcode = {
        _el: qrcodeDiv,
        _oDrawing: {
            _elCanvas: combinedCanvas
        }
    };
    
    // Update download links
    updateDownloadLinks();
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
        
        // Get the QR code image
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
        
        // Add each dark pixel as a rectangle
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
        return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50">QR Error</text></svg>';
    }
}

// Function to handle logo upload
function handleLogoUpload(event) {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        
        // Check file type
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        
        // Create image from the file
        const reader = new FileReader();
        reader.onload = function(e) {
            // Create an image element for the logo
            userLogo = new Image();
            userLogo.onload = function() {
                // Create a preview
                logoPreview.innerHTML = '';
                const previewImg = document.createElement('img');
                previewImg.src = e.target.result;
                logoPreview.appendChild(previewImg);
                
                // Show remove button
                removeLogoBtn.style.display = 'inline-block';
                
                // Regenerate QR code if it already exists
                if (textInput.value.trim() !== '') {
                    generateQR();
                }
            };
            userLogo.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Function to remove logo
function removeLogo() {
    userLogo = null;
    logoPreview.innerHTML = '';
    logoUpload.value = '';
    removeLogoBtn.style.display = 'none';
    
    // Regenerate QR code if it already exists
    if (textInput.value.trim() !== '') {
        generateQR();
    }
}

// Function to handle logo size change
function handleLogoSizeChange() {
    logoSize = logoSizeSelect.value;
    
    // Regenerate QR code if it already exists and logo is set
    if (userLogo && textInput.value.trim() !== '') {
        generateQR();
    }
}

// Function to regenerate QR code with current theme colors
window.regenerateQRWithThemeColors = function() {
    // Get current settings
    const text = textInput.value.trim();
    const size = parseInt(qrSizeSelect.value);
    const errorLevel = errorLevelSelect.value;
    
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
logoUpload.addEventListener('change', handleLogoUpload);
removeLogoBtn.addEventListener('click', removeLogo);
logoSizeSelect.addEventListener('change', handleLogoSizeChange);

// Also generate QR code when Enter key is pressed in input field
textInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        generateQR();
    }
});
