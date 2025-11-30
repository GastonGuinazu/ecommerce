import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Importamos nuestro puente a la DB
import * as bcrypt from 'bcrypt'; // Importamos la librería de seguridad

@Injectable()
export class UsersService {
  // Inyectamos el servicio de Prisma para poder usar la DB
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Encriptar la contraseña (Hashing). El '10' es el costo de procesamiento (salt rounds). Más alto = más seguro pero más lento.
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        password: hashedPassword,
      },
    });

    // 3. Retornar el usuario (pero borramos la contraseña del objeto de retorno por seguridad)
    const { password, ...result } = newUser;
    return result;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}