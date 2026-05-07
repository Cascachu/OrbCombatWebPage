import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto.username, dto.email, dto.password, dto.avatar);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto.email, dto.password);
    }

    @Get('avatars')
    getAvailableAvatars() {
        return [
            'avatar1.svg',
            'avatar2.svg',
            'avatar3.svg',
            'avatar4.svg',
            'avatar5.svg',
            'avatar6.svg',
            'default.svg',
        ];
    }
}