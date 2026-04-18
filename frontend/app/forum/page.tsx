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

type AuthMode = 'login' | 'register';

let socket: Socket;

function parseUsername(token: string): string | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.username || null;
    } catch {
        return null;
    }
}

export default function Forum() {
    const [username, setUsername] = useState<string | null>(null);
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    const [formEmail, setFormEmail] = useState('');
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [text, setText] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem('token');
        if (stored) {
            const name = parseUsername(stored);
            if (name) setUsername(name);
        }
    }, []);

    useEffect(() => {
        if (!username) return;

        socket = io('http://localhost:4000');

        socket.on('connect', () => {
            socket.emit('join', username);
        });

        socket.on('message', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('onlineUsers', (users: string[]) => {
            setOnlineUsers(users);
        });

        socket.on('userJoined', ({ username: u }: { username: string }) => {
            setMessages((prev) => [...prev, {
                id: Date.now(),
                username: 'System',
                text: `${u} joined the chat.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
        });

        socket.on('userLeft', ({ username: u }: { username: string }) => {
            setMessages((prev) => [...prev, {
                id: Date.now(),
                username: 'System',
                text: `${u} left the chat.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
        });

        return () => {
            socket.disconnect();
        };
    }, [username]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function handleAuth() {
        setAuthError('');
        const url = `http://localhost:4000/auth/${authMode}`;

        const body: Record<string, string> = {
            email: formEmail,
            password: formPassword,
        };
        if (authMode === 'register') body.username = formUsername;

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setAuthError(data.message || 'Something went wrong');
                return;
            }

            localStorage.setItem('token', data.access_token);
            setUsername(data.username);
        } catch {
            setAuthError('Could not connect to the server');
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        setUsername(null);
        setMessages([]);
        setOnlineUsers([]);
        if (socket) socket.disconnect();
    }

    function handleSend() {
        if (!text.trim() || !username) return;

        const message: Message = {
            id: Date.now(),
            username,
            text: text.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        socket.emit('message', message);
        setText('');
    }

    if (!username) {
        return (
            <main className="forum-page">
                <header className="forum-header">
                    <a href="/" className="forum-back">← Back</a>
                    <h1>Community Forum</h1>
                </header>

                <div className="forum-auth">
                    <div className="forum-auth-box">
                        <div className="forum-auth-tabs">
                            <button
                                className={authMode === 'login' ? 'active' : ''}
                                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                            >
                                Login
                            </button>
                            <button
                                className={authMode === 'register' ? 'active' : ''}
                                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                            >
                                Register
                            </button>
                        </div>

                        {authMode === 'register' && (
                            <input
                                type="text"
                                placeholder="Username"
                                value={formUsername}
                                onChange={(e) => setFormUsername(e.target.value)}
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                        />

                        {authError && <p className="forum-auth-error">{authError}</p>}

                        <button className="forum-auth-submit" onClick={handleAuth}>
                            {authMode === 'login' ? 'Login' : 'Register'}
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="forum-page">
            <header className="forum-header">
                <a href="/" className="forum-back">← Back</a>
                <h1>Community Forum</h1>
                <span className="forum-online">● Live</span>
                <button className="forum-logout" onClick={handleLogout}>Logout</button>
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

                    {/* Messages */}
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

                    <div className="forum-input">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            </div>
        </main>
    );
}