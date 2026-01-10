import { InputType, Field } from '@nestjs/graphql';
import { CreateTelephoneInput } from './create-telephone.input';
import { IsEmail, IsNotEmpty, MinLength, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateUserInput {
  @IsNotEmpty({ message: 'Name is required' })
  @Field()
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'The email is not valid' })
  @Field()
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(5, { message: 'Password must have at least 5 characters' })
  @Field()
  password: string;

  @Field(() => [CreateTelephoneInput])
  @ValidateNested({ each: true })
  @Type(() => CreateTelephoneInput)
  @ArrayMinSize(1, { message: 'You must provide at least one telephone' })
  telephones: CreateTelephoneInput[];
}
