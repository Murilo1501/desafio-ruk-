import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator';

@InputType()
export class LoginUserInput {
  @IsNotEmpty({ message: 'password is required' })
  @IsEmail({}, {message:'the email is not valid'} )
  @Field()
  email: string;

  @Field()
  @MinLength(5,{message:'Password must have at least 5 characters'})
  @IsNotEmpty({ message: 'password is required' })
  password: string;
}
