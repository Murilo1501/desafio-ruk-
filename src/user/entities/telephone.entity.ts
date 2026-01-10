import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Telephone {
  @Field(() => ID)
  id: string;

  @Field()
  number: string;

  @Field()
  areaCode: string;
}
