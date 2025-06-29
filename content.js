// Content script for Astradyne Extension
console.log('Astradyne Extension content script loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeChart') {
        // Basic chart analysis functionality
        try {
            // Get chart data from the page
            const chartData = document.querySelector('canvas');
            if (chartData) {
                sendResponse({ success: true, message: 'Chart found' });
            } else {
                sendResponse({ success: false, message: 'No chart found on page' });
            }
        } catch (error) {
            sendResponse({ success: false, message: error.message });
        }
        return true; // Required for async sendResponse
    }
}); 