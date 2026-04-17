'use client';

import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import './forum.scss';

type Message = {
    id: number;
    username: string;
    text: string;
    timestamp: string;
};

let socket: Socket;

export default function Forum() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [username, setUsername] = useState<string>('');
    const [inputName, setInputName] = useState<string>('');
    const [text, setText] = useState<string>('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Connect to NestJS backend
        socket = io('http://localhost:4000');

        socket.on('message', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('onlineUsers', (users: string[]) => {
            setOnlineUsers(users);
        });

        socket.on('userJoined', ({ username }: { username: string }) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    username: 'System',
                    text: `${username} joined the chat.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        });

        socket.on('userLeft', ({ username }: { username: string }) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    username: 'System',
                    text: `${username} left the chat.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function handleJoin() {
        if (inputName.trim()) {
            const name = inputName.trim();
            setUsername(name);
            socket.emit('join', name);
        }
    }

    function handleSend() {
        if (!text.trim()) return;

        const message: Message = {
            id: Date.now(),
            username,
            text: text.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        socket.emit('message', message);
        setText('');
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') handleSend();
    }

    return (
        <main className="forum-page">

            <header className="forum-header">
                <a href="/" className="forum-back">← Back</a>
                <h1>Community Forum</h1>
                <span className="forum-online">● Live</span>
            </header>

            <div className="forum-container">

                {/* Sidebar */}
                <aside className="forum-sidebar">
                    <h2>Online ({onlineUsers.length})</h2>
                    <ul>
                        {onlineUsers.map((user) => (
                            <li key={user} className={user === username ? 'forum-sidebar-you' : ''}>
                                {user} {user === username ? '(you)' : ''}
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Chat area */}
                <div className="forum-chat">

                    <div className="forum-messages">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`forum-message ${msg.username === username ? 'forum-message--own' : ''} ${msg.username === 'System' ? 'forum-message--system' : ''}`}
                            >
                                {msg.username !== 'System' && (
                                    <span className="forum-message-username">{msg.username}</span>
                                )}
                                <span className="forum-message-text">{msg.text}</span>
                                {msg.username !== 'System' && (
                                    <span className="forum-message-time">{msg.timestamp}</span>
                                )}
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {!username ? (
                        <div className="forum-join">
                            <input
                                type="text"
                                placeholder="Enter a username..."
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            />
                            <button onClick={handleJoin}>Join Chat</button>
                        </div>
                    ) : (
                        <div className="forum-input">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button onClick={handleSend}>Send</button>
                        </div>
                    )}

                </div>
            </div>

        </main>
    );
}