// Import fetchGPTResponse from gpt.js
// Note: In Chrome extensions, the function is available globally through window object
// so we don't need an explicit import

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const imagePreview = document.getElementById('imagePreview');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const outputDiv = document.getElementById('output');
  const chatContainer = document.getElementById('chatContainer');

  let imageDataUrl = null;

  // Handle file selection
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imageDataUrl = event.target.result;
        showImagePreview(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle paste
  dropzone.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          imageDataUrl = event.target.result;
          showImagePreview(imageDataUrl);
        };
        reader.readAsDataURL(file);
        e.preventDefault();
        break;
      }
    }
  });

  // Drag & drop support
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', (e) => {
    dropzone.classList.remove('dragover');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imageDataUrl = event.target.result;
        showImagePreview(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  });

  function showImagePreview(dataUrl) {
    imagePreview.src = dataUrl;
    imagePreviewContainer.style.display = 'block';
    analyzeBtn.style.display = 'block';
    outputDiv.innerHTML = '';
    chatContainer.style.display = 'none';
  }

  function showLoader() {
    outputDiv.innerHTML = `
      <div class="loader-wrapper">
        <div class="loader">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
      </div>
    `;
    chatContainer.style.display = 'block';
  }

  function createMessageSection(title, content) {
    return `
      <div class="message-section ${title.toLowerCase().replace(/[\[\]\s]/g, '-')}">
        <div class="message-section-title">${title}</div>
        <div class="message-section-content">${content}</div>
      </div>
    `;
  }

  function showError(message) {
    outputDiv.innerHTML = `
      <div class="message system error">
        <div class="message-section">
          <div class="message-section-title">Error</div>
          <div class="message-section-content">${message}</div>
        </div>
      </div>
    `;
    if (chatContainer) chatContainer.style.display = 'block';
  }

  // Format the AI response for better readability and skip N/A sections
  function formatAIResponseSections(text) {
    // Split into sections
    const sectionRegex = /\[(.+?)\]:\s*([^\[]*)/g;
    let match;
    let html = '';
    while ((match = sectionRegex.exec(text)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      if (!content || content.toLowerCase() === 'n/a') continue; // Skip N/A
      html += `<div class=\"ai-section\"><span class=\"ai-section-title\">${title}:</span><br>${content.replace(/\n/g, '<br>')}</div>`;
    }
    return `<div class=\"analysis-container\">${html}</div>`;
  }

  // Utility to extract trade details from AI response
  function extractTradeDetails(text) {
    const getSection = (label) => {
      const match = text.match(new RegExp(`\\[${label}\\]:\\s*([^\[]*)`, 'i'));
      return match ? match[1].trim() : '';
    };
    return {
      advice: getSection('My Advice'),
      entry: getSection('Entry Zone'),
      stop: getSection('Stop Loss'),
      target: getSection('Target Zone'),
      risk: getSection('Risk-to-Reward'),
    };
  }

  // Show trade action button if advice is BUY or SELL
  function showTradeActionButtons(details) {
    // Remove any previous action button/modal
    const old = document.getElementById('trade-action-btn');
    if (old) old.remove();
    const oldModal = document.getElementById('trade-modal');
    if (oldModal) oldModal.remove();

    if (!details.advice) return;
    const advice = details.advice.toLowerCase();
    let action = '';
    if (advice.includes('buy')) action = 'Buy';
    if (advice.includes('sell')) action = 'Sell';
    if (!action) return;

    const btn = document.createElement('button');
    btn.id = 'trade-action-btn';
    btn.className = action === 'Buy' ? 'primary-button' : 'secondary-button';
    btn.textContent = action;
    btn.style.marginTop = '18px';
    btn.onclick = () => showTradeModal(action, details);
    outputDiv.appendChild(btn);
  }

  // Show modal with trade details and copy option
  function showTradeModal(action, details) {
    // Remove any previous modal
    const oldModal = document.getElementById('trade-modal');
    if (oldModal) oldModal.remove();
    // Modal overlay
    const modal = document.createElement('div');
    modal.id = 'trade-modal';
    modal.style.position = 'fixed';
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.zIndex = 999999;
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    // Modal content
    const content = document.createElement('div');
    content.style.background = '#232b3a';
    content.style.padding = '28px 24px';
    content.style.borderRadius = '12px';
    content.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    content.style.color = '#fff';
    content.style.minWidth = '320px';
    content.innerHTML = `
      <h2 style=\"margin-top:0;\">${action} Trade Details</h2>
      <div style=\"margin-bottom:10px;\"><b>Entry Zone:</b> ${details.entry || 'N/A'}</div>
      <div style=\"margin-bottom:10px;\"><b>Stop Loss:</b> ${details.stop || 'N/A'}</div>
      <div style=\"margin-bottom:10px;\"><b>Target Zone:</b> ${details.target || 'N/A'}</div>
      <div style=\"margin-bottom:10px;\"><b>Risk-to-Reward:</b> ${details.risk || 'N/A'}</div>
      <div style=\"margin:18px 0 10px 0; color:#bfaaff; font-size:1.08em;\"><b>Professional Guidance:</b><br>
        As a professional trading advisor, I recommend you <b>place your BUY order at <span style='color:#4f8cff;'>${details.entry || 'the recommended entry zone'}</span></b> and <b>set your SELL/TAKE PROFIT order at <span style='color:#ff4f4f;'>${details.target || 'the recommended target zone'}</span></b>.<br>
        Always use a stop loss to manage risk. Review your trade plan before execution.
      </div>
      <button id=\"copy-trade-btn\" class=\"primary-button\" style=\"margin-top:18px;\">Copy to Clipboard</button>
      <button id=\"close-trade-modal\" class=\"secondary-button\" style=\"margin-top:10px;\">Close</button>
    `;
    modal.appendChild(content);
    document.body.appendChild(modal);
    // Copy to clipboard
    document.getElementById('copy-trade-btn').onclick = () => {
      const text = `${action} Trade\nEntry: ${details.entry}\nStop Loss: ${details.stop}\nTarget: ${details.target}\nRisk-to-Reward: ${details.risk}`;
      navigator.clipboard.writeText(text);
      document.getElementById('copy-trade-btn').textContent = 'Copied!';
      setTimeout(() => {
        document.getElementById('copy-trade-btn').textContent = 'Copy to Clipboard';
      }, 1200);
    };
    // Close modal
    document.getElementById('close-trade-modal').onclick = () => {
      modal.remove();
    };
  }

  analyzeBtn.addEventListener('click', async () => {
    if (!imageDataUrl) {
      showError('Please select an image first.');
      return;
    }
    showLoader();
    try {
      const response = await window.fetchGPTResponse(imageDataUrl);
      if (response.startsWith('Error:')) {
        showError(response.replace('Error:', '').trim());
        return;
      }
      // Show AI response immediately (no typewriter)
      outputDiv.innerHTML = formatAIResponseSections(response);
      const details = extractTradeDetails(response);
      showTradeActionButtons(details);
    } catch (error) {
      showError('An error occurred while analyzing the image.');
    }
  });
});
