import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_token'),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user and return a token', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);
            mockUsersService.findByUsername.mockResolvedValue(null);
            mockUsersService.create.mockResolvedValue({
                id: 1,
                username: 'testuser',
                email: 'test@test.com',
                avatar: 'default.svg',
            });

            const result = await service.register('testuser', 'test@test.com', 'password123', 'default.svg');

            expect(result.access_token).toBe('mock_token');
            expect(result.username).toBe('testuser');
        });

        it('should throw ConflictException if email already exists', async () => {
            mockUsersService.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com' });

            await expect(
                service.register('testuser', 'test@test.com', 'password123', 'default.svg')
            ).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException if username already exists', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);
            mockUsersService.findByUsername.mockResolvedValue({ id: 1, username: 'testuser' });

            await expect(
                service.register('testuser', 'test@test.com', 'password123', 'default.svg')
            ).rejects.toThrow(ConflictException);
        });

        it('should hash the password before saving', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);
            mockUsersService.findByUsername.mockResolvedValue(null);
            mockUsersService.create.mockResolvedValue({
                id: 1,
                username: 'testuser',
                email: 'test@test.com',
                avatar: 'default.svg',
            });

            await service.register('testuser', 'test@test.com', 'password123', 'default.svg');

            const createdWithHash = mockUsersService.create.mock.calls[0][2];
            const isHashed = await bcrypt.compare('password123', createdWithHash);
            expect(isHashed).toBe(true);
        });
    });

    describe('login', () => {
        it('should return a token on valid credentials', async () => {
            const hashed = await bcrypt.hash('password123', 10);
            mockUsersService.findByEmail.mockResolvedValue({
                id: 1,
                username: 'testuser',
                email: 'test@test.com',
                password: hashed,
                avatar: 'default.svg',
            });

            const result = await service.login('test@test.com', 'password123');

            expect(result.access_token).toBe('mock_token');
            expect(result.username).toBe('testuser');
        });

        it('should throw UnauthorizedException if email not found', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(
                service.login('wrong@test.com', 'password123')
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password is wrong', async () => {
            const hashed = await bcrypt.hash('password123', 10);
            mockUsersService.findByEmail.mockResolvedValue({
                id: 1,
                username: 'testuser',
                email: 'test@test.com',
                password: hashed,
                avatar: 'default.svg',
            });

            await expect(
                service.login('test@test.com', 'wrongpassword')
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});