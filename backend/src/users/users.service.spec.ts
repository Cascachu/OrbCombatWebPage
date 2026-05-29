import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@test.com',
    password: 'hashed_password',
    avatar: 'default.svg',
};

const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getRepositoryToken(User), useValue: mockRepository },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        jest.clearAllMocks();
    });

    describe('findByEmail', () => {
        it('should return a user if found', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findByEmail('test@test.com');

            expect(result).toEqual(mockUser);
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
        });

        it('should return null if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await service.findByEmail('notfound@test.com');

            expect(result).toBeNull();
        });
    });

    describe('findByUsername', () => {
        it('should return a user if found', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findByUsername('testuser');

            expect(result).toEqual(mockUser);
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
        });

        it('should return null if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await service.findByUsername('notfound');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create and save a new user', async () => {
            mockRepository.create.mockReturnValue(mockUser);
            mockRepository.save.mockResolvedValue(mockUser);

            const result = await service.create('testuser', 'test@test.com', 'hashed_password', 'default.svg');

            expect(result).toEqual(mockUser);
            expect(mockRepository.create).toHaveBeenCalledWith({
                username: 'testuser',
                email: 'test@test.com',
                password: 'hashed_password',
                avatar: 'default.svg',
            });
            expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
        });
    });
});