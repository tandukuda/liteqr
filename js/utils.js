/**
 * Utility functions for LiteQR
 */

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    // Today
    if (date.toDateString() === now.toDateString()) {
        return `Today at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Within a week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${days[date.getDay()]} at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Older
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// Truncate text for display
function truncateText(text, maxLength = 30) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
