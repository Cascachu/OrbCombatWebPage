'use client';

import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import './forum.scss';

type Message = {
    id: number;
    username: string;
    text: string;
    timestamp: string;
    avatar?: string;
};

type AuthMode = 'login' | 'register';

type OnlineUser = {
    username: string;
    avatar?: string;
};

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
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [text, setText] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('default.svg');
    const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem('token');
        if (stored) {
            const name = parseUsername(stored);
            if (name) setUsername(name);

            fetch('http://localhost:4000/users/profile', {
                headers: { Authorization: `Bearer ${stored}` },
            })
                .then(res => res.json())
                .then(data => setSelectedAvatar(data.avatar || 'default.svg'))
                .catch(console.error);
        }

        fetch('http://localhost:4000/auth/avatars')
            .then(res => res.json())
            .then(data => setAvailableAvatars(data))
            .catch(console.error);
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
        if (authMode === 'register') {
            body.username = formUsername;
            body.avatar = selectedAvatar;
        }

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

            const profileRes = await fetch('http://localhost:4000/users/profile', {
                headers: { Authorization: `Bearer ${data.access_token}` },
            });
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setSelectedAvatar(profileData.avatar || 'default.svg');
            }
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
                            <>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={formUsername}
                                    onChange={(e) => setFormUsername(e.target.value)}
                                />
                                <div className="forum-avatar-selector">
                                    <p>Choose Avatar:</p>
                                    <div className="forum-avatar-grid">
                                        {availableAvatars.map((avatar) => (
                                            <img
                                                key={avatar}
                                                src={`/avatars/${avatar}`}
                                                alt={avatar}
                                                className={`forum-avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                                                onClick={() => setSelectedAvatar(avatar)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
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
                            <li key={user.username} className={user.username === username ? 'forum-sidebar-you' : ''}>
                                {user.avatar && (
                                    <img src={`/avatars/${user.avatar}`} alt={user.username} className="forum-sidebar-avatar" />
                                )}
                                <span>{user.username} {user.username === username ? '(you)' : ''}</span>
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
                                <div className="forum-message-content">
                                    {msg.username !== 'System' && msg.avatar && (
                                        <div className="forum-message-avatar-container">
                                            <img src={`/avatars/${msg.avatar}`} alt={msg.username} className="forum-message-avatar" />
                                            {msg.username !== 'System' && (
                                                <span className="forum-message-username">{msg.username}</span>
                                            )}
                                        </div>
                                    )}
                                    <div className="forum-message-body">
                                        <span className="forum-message-text">{msg.text}</span>
                                        {msg.username !== 'System' && (
                                            <span className="forum-message-time">{msg.timestamp}</span>
                                        )}
                                    </div>
                                </div>
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