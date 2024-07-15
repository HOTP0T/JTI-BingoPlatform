const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Message from server:', data);

    // Handle real-time updates here
    // For example, you can update the page content based on the message
    if (data.action === 'login') {
        console.log(`A user logged in and was redirected to: ${data.redirectUrl}`);
        // Update the UI or notify the user as needed
    }
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};