document.addEventListener('DOMContentLoaded', () => {
  const socket = io('https://your-render-app-name.onrender.com');  // Update with your Render URL

  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');

  chatSend.addEventListener('click', () => {
    sendMessage();
  });

  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
      socket.emit('chat message', message);
      chatInput.value = '';
    }
  }

  socket.on('chat message', (msg) => {
    appendMessage('Other', msg);
  });

  function appendMessage(user, message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${user}: ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the bottom
  }
});