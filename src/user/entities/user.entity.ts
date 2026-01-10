import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Telephone } from './telephone.entity';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => [Telephone])
  telephones: Telephone[];

  @Field()
  createdAt: Date;

  @Field()
  modifiedAt: Date;
}
