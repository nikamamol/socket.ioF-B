import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
    transports: ['websocket'], // This forces the WebSocket transport
});

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Load previous messages
        socket.on('previous messages', (previousMessages) => {
            setMessages(previousMessages);
        });

        // Listen for incoming messages
        socket.on('chat message', (msg) => {
            console.log('Received message:', msg);
            setMessages((prev) => [...prev, msg]); // Add the received message to state
        });

        // Cleanup on component unmount
        return () => {
            socket.off('previous messages');
            socket.off('chat message');
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input && username) {
            const msgData = { username, message: input };
            console.log('Sending message:', msgData); // Log the sent message
            socket.emit('chat message', msgData); // Send message to server
            setInput(''); // Clear input field
        } else {
            console.log('Input or username is empty, message not sent.'); // Log if input is empty
        }
    };

    return (
        <div>
            <h1>Chat Room</h1>
            <input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
            />
            <form onSubmit={sendMessage}>
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}><strong>{msg.username}:</strong> {msg.message}</li>
                ))}
            </ul>
        </div>
    );
};

export default Chat;
