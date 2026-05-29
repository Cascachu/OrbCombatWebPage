import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Forum from './page';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
    io: jest.fn(() => ({
        on: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
    })),
}));

// Mock next/link
jest.mock('next/link', () => {
    const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
});

describe('Forum', () => {
    beforeEach(() => {
        localStorage.clear();
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });
    });

    it('renders login form when not logged in', () => {
        render(<Forum />);
        expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
        expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('switches to register tab when clicked', () => {
        render(<Forum />);
        fireEvent.click(screen.getByText('Register'));
        expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    });

    it('shows email and password fields on login tab', () => {
        render(<Forum />);
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('shows avatar picker on register tab', () => {
        render(<Forum />);
        fireEvent.click(screen.getByText('Register'));
        expect(screen.getByText('Choose Avatar:')).toBeInTheDocument();
    });

    it('renders all avatars in the picker on register tab', () => {
        render(<Forum />);
        fireEvent.click(screen.getByText('Register'));

        // AVATARS array from page.tsx
        const avatars = [
            'avatar1.svg', 'avatar2.svg', 'avatar3.svg',
            'avatar4.svg', 'avatar5.svg', 'avatar6.svg', 'default.svg'
        ];

        const images = screen.getAllByRole('img');
        const avatarImages = images.filter(img =>
            avatars.some(a => img.getAttribute('src')?.includes(a))
        );

        expect(avatarImages.length).toBe(avatars.length);
    });

    it('selecting an avatar marks it as selected', () => {
        render(<Forum />);
        fireEvent.click(screen.getByText('Register'));

        const avatarImages = screen.getAllByRole('img');
        fireEvent.click(avatarImages[0]);

        expect(avatarImages[0]).toHaveClass('selected');
    });

    it('shows error message on failed login', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Invalid credentials' }),
        });

        render(<Forum />);
        fireEvent.change(screen.getByPlaceholderText('Email'), {
            target: { value: 'wrong@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'wrongpassword' },
        });

        const submitButton = document.querySelector('.forum-auth-submit') as HTMLElement;
        fireEvent.click(submitButton);

        const error = await screen.findByText('Invalid credentials');
        expect(error).toBeInTheDocument();
    });
});