// Get modal elements
const modal = document.getElementById('countdownModal');
const openButton = document.getElementById('openModal');
const closeButton = modal.querySelector('.close-button');

// Open modal
openButton.addEventListener('click', () => {
  modal.style.display = 'flex';
});

// Close modal
closeButton.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Close modal when clicking outside the content
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});