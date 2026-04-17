'use client';

import { useState, useRef, useEffect } from 'react';
import './forum.scss';

type Message = {
    id: number;
    username: string;
    text: string;
    timestamp: string;
};

const MOCK_MESSAGES: Message[] = [
    { id: 1, username: 'Player1', text: 'Hey everyone! Anyone up for a game?', timestamp: '12:01' },
    { id: 2, username: 'xXSniper99Xx', text: 'Just finished the last level, insane ending!', timestamp: '12:03' },
    { id: 3, username: 'DevGuy', text: 'New patch dropping this Friday 👀', timestamp: '12:05' },
];

export default function Forum() {
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [username, setUsername] = useState<string>('');
    const [inputName, setInputName] = useState<string>('');
    const [text, setText] = useState<string>('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function handleJoin() {
        if (inputName.trim()) {
            setUsername(inputName.trim());
        }
    }

    function handleSend() {
        if (!text.trim()) return;

        const newMessage: Message = {
            id: messages.length + 1,
            username,
            text: text.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, newMessage]);
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
                    <h2>Online</h2>
                    <ul>
                        {MOCK_MESSAGES.map((m) => (
                            <li key={m.id}>{m.username}</li>
                        ))}
                        {username && <li className="forum-sidebar-you">{username} (you)</li>}
                    </ul>
                </aside>

                {/* Chat area */}
                <div className="forum-chat">

                    <div className="forum-messages">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`forum-message ${msg.username === username ? 'forum-message--own' : ''}`}
                            >
                                <span className="forum-message-username">{msg.username}</span>
                                <span className="forum-message-text">{msg.text}</span>
                                <span className="forum-message-time">{msg.timestamp}</span>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Join prompt or chat input */}
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