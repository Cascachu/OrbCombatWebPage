import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async register(username: string, email: string, password: string, avatar?: string) {
        const existingEmail = await this.usersService.findByEmail(email);
        if (existingEmail) throw new ConflictException('Email already in use');

        const existingUsername = await this.usersService.findByUsername(username);
        if (existingUsername) throw new ConflictException('Username already in use');

        const hashed = await bcrypt.hash(password, 10);
        const user = await this.usersService.create(username, email, hashed, avatar || 'default.svg');

        return this.signToken(user.id, user.username);
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new UnauthorizedException('Invalid credentials');

        return this.signToken(user.id, user.username);
    }

    private signToken(userId: number, username: string) {
        const payload = { sub: userId, username };
        return {
            access_token: this.jwtService.sign(payload),
            username,
        };
    }
}