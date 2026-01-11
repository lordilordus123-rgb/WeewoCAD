// ============================================================
// WeewoCAD - Main Application Script
// ============================================================


// DOM Elements
const inputField = document.getElementById('myInput');
const submitBtn = document.getElementById('myButton');
const messageDisplay = document.getElementById('msg');
const emailField = document.getElementById('emailInput');
const passwordField = document.getElementById('passwordInput');
const label = document.getElementById('myLabel');

// ============================================================
// Event Listeners
// ============================================================

// Submit button click
submitBtn.addEventListener('click', handleSubmit);

// Enter key in input field
inputField.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleSubmit();
  }
});

// Input field focus effects
inputField.addEventListener('focus', () => {
  label.style.color = '#667eea';
});

inputField.addEventListener('blur', () => {
  label.style.color = '#333';
});

// ============================================================
// Core Functions
// ============================================================

/**
 * Handle form submission
 */
function handleSubmit() {
  const inputValue = inputField.value.trim();
  const emailValue = emailField ? emailField.value.trim() : '';

  // Clear previous message
  messageDisplay.textContent = '';
  messageDisplay.style.background = '#f0f4ff';

  // Validation
  if (inputValue === '') {
    showMessage('❌ Bitte geben Sie einen Text ein!', 'error');
    inputField.focus();
    return;
  }

  // Simple email validation if field exists
  if (emailValue) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(emailValue)) {
      showMessage('❌ Bitte geben Sie eine gültige E‑Mail-Adresse ein.', 'error');
      emailField.focus();
      return;
    }
  }

  if (inputValue.length < 2) {
    showMessage('⚠️ Der Text muss mindestens 2 Zeichen lang sein.', 'warning');
    return;
  }

  // Success message
  const timestamp = new Date().toLocaleTimeString('de-DE');
  const message = `✅ Eingabe: "${inputValue}" ${emailValue ? '| E‑Mail: ' + emailValue : ''} (${timestamp})`;
  showMessage(message, 'success');

  // Additional processing
  processInput(inputValue);

  // Clear input
  inputField.value = '';
  inputField.focus();
}

/**
 * Display message with styling
 * @param {string} text - Message text
 * @param {string} type - Message type (success, error, warning)
 */
function showMessage(text, type = 'info') {
  messageDisplay.textContent = text;

  // Reset all classes
  messageDisplay.className = 'message';

  // Apply type-specific styling
  switch (type) {
    case 'success':
      messageDisplay.style.background = '#d4edda';
      messageDisplay.style.color = '#155724';
      messageDisplay.style.borderLeft = '4px solid #28a745';
      break;
    case 'error':
      messageDisplay.style.background = '#f8d7da';
      messageDisplay.style.color = '#721c24';
      messageDisplay.style.borderLeft = '4px solid #dc3545';
      break;
    case 'warning':
      messageDisplay.style.background = '#fff3cd';
      messageDisplay.style.color = '#856404';
      messageDisplay.style.borderLeft = '4px solid #ffc107';
      break;
    default:
      messageDisplay.style.background = '#f0f4ff';
      messageDisplay.style.color = '#333';
  }

  // Add padding for border styling
  messageDisplay.style.paddingLeft = '1rem';
}

/**
 * Process user input (extended functionality)
 * @param {string} input - User input text
 */
function processInput(input) {
  // Count characters
  const charCount = input.length;

  // Count words
  const wordCount = input.split(/\s+/).filter((w) => w.length > 0).length;

  // Detect if input is a number
  const isNumber = !isNaN(input) && input !== '';

  // Build debug info
  const debugInfo = {
    input: input,
    length: charCount,
    words: wordCount,
    isNumber: isNumber,
  };

  // Log to console (for development)
  console.log('Input processed:', debugInfo);

  // If email was provided, log it too
  if (emailField && emailField.value.trim()) {
    console.log('Email provided:', emailField.value.trim());
  }

  // Example: Additional message if long text
  if (charCount > 50) {
    setTimeout(() => {
      showMessage(`📝 Das ist ein längerer Text mit ${charCount} Zeichen und ${wordCount} Wörtern.`, 'info');
    }, 1500);
  }
}

/**
 * Initialize application
 */
function init() {
  console.log('WeewoCAD App initialized');
  console.log('Ready to receive input...');

  // Set input focus
  inputField.focus();

  // Optional: Add keyboard shortcut info
  console.info('💡 Tipp: Du kannst auch Enter drücken zum Abschicken.');
}

// ============================================================
// Start Application
// ============================================================

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Format timestamp
 * @returns {string} Formatted time
 */
function getFormattedTime() {
  return new Date().toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Clear all messages and reset form
 */
function resetForm() {
  inputField.value = '';
  messageDisplay.textContent = '';
  messageDisplay.style.background = '#f0f4ff';
  inputField.focus();
}

// Optional: Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+R or Cmd+R to reset (alternative to manual clear)
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    // Prevent browser reload - remove this if you want default behavior
    // e.preventDefault();
    // resetForm();
  }
});

console.log('✨ WeewoCAD v1.0 - All systems go!');
