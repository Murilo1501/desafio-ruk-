import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class Auth {
  @Field(() => ID)
  id: string;

  @Field()
  accessToken: string;
}
