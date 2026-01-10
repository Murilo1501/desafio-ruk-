import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import { LoginUserInput } from './dto/login-user.input';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Auth)
  async auth(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    const user = await this.authService.auth(loginUserInput);
    return await this.authService.login(user);
  }
}
