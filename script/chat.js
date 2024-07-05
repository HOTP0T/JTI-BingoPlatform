// chat.js
function toggleWidget() {
  const widget = document.getElementById('discord-widget');
  if (widget.style.display === 'none' || widget.style.display === '') {
    widget.style.display = 'block';
  } else {
    widget.style.display = 'none';
  }
}