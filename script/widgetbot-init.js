// widgetbot-init.js
document.addEventListener('DOMContentLoaded', () => {
  new Crate({
    server: '1258158936603758663',
    channel: '1258616481990840371',
    location: [-60, -20], // Move the button 60px from the top and 20px from the right
    // token: 'your_generated_jwt_token_here', // Add your JWT token here
    notifications: false, // Disable notifications
    indicator: true, // Enable unread message indicator
    allChannelNotifications: true, // Enable notifications for all channels
    defer: true // Load the widget only when the user opens it
  });
});