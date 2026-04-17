import type { Metadata } from 'next';
import './globals.scss';


export const metadata: Metadata = {
    title: 'My Game',
    description: 'Download My Game',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}