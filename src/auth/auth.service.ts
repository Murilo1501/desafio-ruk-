import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserInput } from './dto/login-user.input';
import { prisma } from '../lib/prisma/prisma';
import { AuthJwtPayload } from './types/auth-jwt-payload';
import { JwtService } from '@nestjs/jwt';
import { Auth } from './entities/auth.entity';
import { User } from 'src/user/entities/user.entity';
import { JwtUser } from './types/jwt-user';
import { verify } from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly JwtService: JwtService) {}

  async auth({ email, password }: LoginUserInput) {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email: email,
      },
    });

    const passwordMatched = await verify(user.password, password);

    if (!passwordMatched) throw new UnauthorizedException();

    return user;
  }

  async generateToken(id: string) {
    const payload: AuthJwtPayload = {
      sub: {
        id,
      },
    };

    const accessToken = await this.JwtService.signAsync(payload);
    return { accessToken };
  }

  async login(user): Promise<Auth> {
    const { accessToken } = await this.generateToken(user.id);

    return {
      id: user.id,
      accessToken,
    };
  }

  async validateJwtUser(id: string) {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    const jwtUser: JwtUser = {
      id: (await user).id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      modifiedAt: user.modifiedAt,
    };

    return jwtUser;
  }
}
