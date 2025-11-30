import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // 1. Buscamos al usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparamos la contraseña que envió (texto plano) con el Hash de la DB
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        email: user.email,
        role: user.role, // "ADMIN" o "USER"
        name: user.fullName
      }
    };
  }

  async register(data: { name: string; email: string; password: string }) {
    // 1. Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // 2. Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        fullName: data.name, 
        email: data.email,
        password: hashedPassword,
        role: 'USER',
      },
    });
    
    const { password, ...result } = user;
    return result;
  }
}
