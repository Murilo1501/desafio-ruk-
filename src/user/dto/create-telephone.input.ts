import { InputType, Field } from '@nestjs/graphql';
import { Length } from 'class-validator';

@InputType()
export class CreateTelephoneInput {
  @Field()
  @Length(11, 11, { message: 'the phone number should have 11 digits' })
  number: string;

  @Field()
  @Length(2, 2, { message: 'the area code should have 2 digits' })
  area_code: string;
}
