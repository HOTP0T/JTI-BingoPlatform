import { supabase } from './supabase.js';

supabase
  .from('chats')
  .on('INSERT', payload => {
    console.log('New message:', payload.new);
    // Update chat UI with new message
  })
  .subscribe();

export async function sendMessage(teamId, userId, message) {
  const { data, error } = await supabase
    .from('chats')
    .insert([{ team_id: teamId, user_id: userId, message: message }]);
  if (error) {
    console.error(error);
    alert('Failed to send message');
  } else {
    console.log('Message sent:', data);
  }
}

// Example usage
document.querySelector('#chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = e.target.message.value;
  await sendMessage('team-id', 'user-id', message);
});