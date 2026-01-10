import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from 'src/auth/auth.service';
import { AuthJwtPayload } from 'src/auth/types/auth-jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
      ignoreExpiration: false,
    });
  }

  validate(payload: AuthJwtPayload) {
    const { id } = payload.sub;
    const jwtUser = this.authService.validateJwtUser(id);
    return jwtUser;
  }
}
