import React from 'react';
import { render } from '@testing-library/react';
import BackgroundSpheres from './BackgroundSpheres';

// Mock canvas context since jsdom doesn't support it
beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        createRadialGradient: jest.fn().mockReturnValue({
            addColorStop: jest.fn(),
        }),
    });
});

describe('BackgroundSpheres', () => {
    it('renders a canvas element', () => {
        const { container } = render(<BackgroundSpheres />);
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });

    it('canvas has correct styles for background positioning', () => {
        const { container } = render(<BackgroundSpheres />);
        const canvas = container.querySelector('canvas');
        expect(canvas).toHaveStyle({ position: 'fixed', zIndex: -1 });
    });
});