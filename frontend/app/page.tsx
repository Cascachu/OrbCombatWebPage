import Image from "next/image";

export default function Home() {
    return (
        <main>

            <header>
                <nav>
                    <ul>
                        <li><a href="#about">About</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#download">Download</a></li>
                        <li><a href="/forum">Forum</a></li>
                    </ul>
                </nav>
            </header>

            <section id="hero">
                <h1>Game Title</h1>
                <p>A short, punchy tagline for the game.</p>
                <a href="#download">Download Now</a>
            </section>

            <section id="about">
                <h2>About the Game</h2>
                <p>A brief description of the game — what it is, what makes it fun, who it's for.</p>
            </section>

            <section id="features">
                <h2>Features</h2>
                <ul>
                    <li>Feature one</li>
                    <li>Feature two</li>
                    <li>Feature three</li>
                </ul>
            </section>

            <section id="screenshots">
                <h2>Screenshots</h2>
                <div>
                    <img src="/screenshots/screen1.png" alt="Screenshot 1" />
                    <img src="/screenshots/screen2.png" alt="Screenshot 2" />
                    <img src="/screenshots/screen3.png" alt="Screenshot 3" />
                </div>
            </section>

            <section id="download">
                <h2>Download</h2>
                <p>Available for Windows, macOS, and Linux.</p>
                <div>
                    <a href="/downloads/game-windows.exe">Download for Windows</a>
                    <a href="/downloads/game-mac.dmg">Download for macOS</a>
                    <a href="/downloads/game-linux.tar.gz">Download for Linux</a>
                </div>
            </section>

            <footer>
                <p>&copy; 2026 Game Studio. All rights reserved.</p>
                <nav>
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                </nav>
            </footer>

        </main>
    );
}