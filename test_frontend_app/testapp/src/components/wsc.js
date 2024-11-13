import React, { useState } from 'react';
import useWebSocket from 'react-use-websocket';

function Wsc() {
    const [output, setOutput] = useState('');
    const [input, setInput] = useState('');

    const { sendMessage, lastMessage } = useWebSocket('ws://localhost:8765', {
        onOpen: () => console.log('Conn established'),
        onMessage: (message) => setOutput(message.data),
        shouldReconnect: (CloseEvent) => true,
    });

    const handleSendMess = () => {
        sendMessage(input);
        setInput('');
    };

    return (
        <div>
            <h1>Output</h1>
            <h2>{output}</h2>
            <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Song number'
            />
            <button onClick={handleSendMess}>Send</button>
        </div>
    );
}

export default Wsc;