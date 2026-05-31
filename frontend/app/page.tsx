'use client';

import Image from "next/image";
import Background from './components/BackgroundSpheres';
import { useState } from 'react';

export default function Home() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <main>
            <Background />
            <div id="background-overlay" />

            <header className="orb-barrier">
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
                <h1>Orb Combat</h1>
                <p>Fight using bouncing balls!</p>
                <a href="#download">Download Now</a>
            </section>

            <section id="about" className="orb-barrier">
                <h2>About the Game</h2>
                <p>Orb Combat is a physics-based battle simulator where different types of orbs fight each other in an arena. Each orb has unique abilities — fire orbs inflict stacking burn damage, ice orbs freeze their targets in place, slime orbs split into smaller versions of themselves on death, and sword orbs wield a spinning blade that knocks enemies away. Choose your fighters and watch the chaos unfold.</p>
            </section>

            <section id="features" className="orb-barrier">
                <h2>Features</h2>
                <ul>
                    <li>Custom Combat — choose your fighters from a roster of unique orbs and watch them battle it out in the arena</li>
                    <li>Unique Abilities — each orb comes with its own special ability, from stacking burn damage to freezing enemies solid</li>
                    <li>Dynamic Physics — orbs bounce, collide and interact with each other in real time with unpredictable results every match</li>
                </ul>
            </section>

            <section id="screenshots" className="orb-barrier">
                <h2>Screenshots</h2>
                <div>
                    <img src="/screenshots/screen1.png" alt="Screenshot 1" onClick={() => setSelectedImage('/screenshots/screen1.png')} />
                    <img src="/screenshots/screen2.png" alt="Screenshot 2" onClick={() => setSelectedImage('/screenshots/screen2.png')} />
                    <img src="/screenshots/screen3.png" alt="Screenshot 3" onClick={() => setSelectedImage('/screenshots/screen3.png')} />
                </div>
            </section>

            {selectedImage && (
                <div id="image-modal" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Enlarged screenshot" />
                </div>
            )}

            <section id="download" className="orb-barrier">
                <h2>Download</h2>
                <p>Available for Android.</p>
                <div>
                    <a href="/downloads/OrbCombat.apk" download>Download APK</a>
                    <a href="https://github.com/Cascachu/OrbCombat/releases">Open on Github</a>

                </div>
            </section>

            <footer>
                <p>&copy; 2026 OrbCombat. All rights reserved.</p>
                <nav>
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                    <a href="https://github.com/Cascachu/OrbCombatWebPage">Github</a>
                </nav>
            </footer>

        </main>
    );
}
