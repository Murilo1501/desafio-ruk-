import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UserResponse } from './dto/response-user.create';
import { UseGuards } from '@nestjs/common';
import { GqlJwtGuardGuard } from './../auth/guards/ggl-jwt-guard/ggl-jwt-guard';
import { CurrentUser } from 'src/auth/decorators/current-user-decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserResponse)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @UseGuards(GqlJwtGuardGuard)
  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.userService.findOne(id);
  }

  @Query(() => User)
  @UseGuards(GqlJwtGuardGuard)
  me(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(GqlJwtGuardGuard)
  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.userService.findAll();
  }




}
