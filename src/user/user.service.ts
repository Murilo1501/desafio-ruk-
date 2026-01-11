import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { hash } from 'argon2';
import { prisma } from '../lib/prisma/prisma';
import { UserResponse } from './dto/response-user.create';

@Injectable()
export class UserService {
  async create(createUserInput: CreateUserInput): Promise<UserResponse> {
    const hashPassword = await hash(createUserInput.password);
    try {
      const user = await prisma.user.create({
        data: {
          name: createUserInput.name,
          email: createUserInput.email,
          password: hashPassword,
          telephones: {
            create: createUserInput.telephones.map((t) => ({
              number: t.number,
              areaCode: t.area_code,
            })),
          },
        },
      });

      return {
        data: {
          id: user.id,
          createdAt: user.createdAt,
          modifieldAt: user.modifiedAt,
        },
      };
    } catch (err) {
      if (err.code === 'P2002') {
        return {
          error: {
            status: 'error',
            message: 'Email already exists',
          },
        };
      }

      return {
        error: {
          status: 'error',
          message: err.message || 'Failed to create user',
        },
      };
    }
  }

  async findOne(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { telephones: true },
    });

    return user;
  }

  async findAll()
  {
    const users = await prisma.user.findMany({
      include:{telephones:true}
    });

    return users;
   
  }
}
