/**
 * History functionality for LiteQR
 */

// DOM Elements
const historyContainer = document.getElementById('history-container');
const noHistoryMessage = document.getElementById('no-history');
const clearHistoryBtn = document.getElementById('clear-history');

// Load history from localStorage
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
    
    if (history.length === 0) {
        noHistoryMessage.style.display = 'block';
        return;
    }
    
    noHistoryMessage.style.display = 'none';
    historyContainer.innerHTML = '';
    
    history.forEach((item, index) => {
        // Create history item element
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.dataset.index = index;
        
        // Create QR code thumbnail
        const qrThumbnail = document.createElement('div');
        qrThumbnail.className = 'history-qr';
        
        // Create thumbnail QR code
        const tempDiv = document.createElement('div');
        new QRCode(tempDiv, {
            text: item.isDynamic ? 
                `${getBaseUrl()}/api/redirect?target=${encodeURIComponent(item.text)}` : 
                item.text,
            width: 50,
            height: 50,
            colorDark: item.foregroundColor,
            colorLight: item.backgroundColor,
            correctLevel: QRCode.CorrectLevel[item.errorLevel]
        });
        
        // Extract the QR code image
        const qrImg = tempDiv.querySelector('img');
        qrThumbnail.appendChild(qrImg);
        
        // Create details div
        const details = document.createElement('div');
        details.className = 'history-details';
        
        // Add QR content text
        const contentText = document.createElement('div');
        contentText.className = 'history-text';
        contentText.textContent = truncateText(item.text, 40);
        details.appendChild(contentText);
        
        // Add metadata
        const metadata = document.createElement('div');
        metadata.className = 'history-meta';
        let metaText = formatDate(item.timestamp);
        if (item.isDynamic) metaText += ' · Dynamic';
        
        metadata.textContent = metaText;
        details.appendChild(metadata);
        
        // Create actions div
        const actions = document.createElement('div');
        actions.className = 'history-actions';
        
        // Create restore button
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'history-action-btn';
        restoreBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        restoreBtn.title = 'Restore this QR code';
        restoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            restoreQrCode(index);
        });
        actions.appendChild(restoreBtn);
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'history-action-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Remove from history';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromHistory(index);
        });
        actions.appendChild(deleteBtn);
        
        // Assemble history item
        historyItem.appendChild(qrThumbnail);
        historyItem.appendChild(details);
        historyItem.appendChild(actions);
        
        // Add click event to restore
        historyItem.addEventListener('click', () => {
            restoreQrCode(index);
        });
        
        // Add to history container
        historyContainer.appendChild(historyItem);
    });
}

// Save QR code to history
function saveToHistory(qrData) {
    const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
    
    // Add to beginning of array
    history.unshift(qrData);
    
    // Keep only the last 10 items
    const trimmedHistory = history.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('qrHistory', JSON.stringify(trimmedHistory));
    
    // Refresh history display
    loadHistory();
}

// Remove item from history
function removeFromHistory(index) {
    const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
    
    // Remove item at index
    history.splice(index, 1);
    
    // Save back to localStorage
    localStorage.setItem('qrHistory', JSON.stringify(history));
    
    // Refresh history display
    loadHistory();
}

// Restore QR code from history
function restoreQrCode(index) {
    const history = JSON.parse(localStorage.getItem('qrHistory') || '[]');
    const item = history[index];
    
    if (!item) return;
    
    // Update form fields
    textInput.value = item.text;
    qrSizeSelect.value = item.size || 300;
    errorLevelSelect.value = item.errorLevel || 'M';
    foregroundColorInput.value = item.foregroundColor;
    backgroundColorInput.value = item.backgroundColor;
    dynamicQrCheckbox.checked = item.isDynamic;
    
    // Generate QR code
    generateQR();
}

// Clear all history
function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        localStorage.removeItem('qrHistory');
        loadHistory();
    }
}

// Event listeners
clearHistoryBtn.addEventListener('click', clearHistory);

// Scroll history into view when clicking an item far down
historyContainer.addEventListener('click', function(e) {
    const item = e.target.closest('.history-item');
    if (item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
