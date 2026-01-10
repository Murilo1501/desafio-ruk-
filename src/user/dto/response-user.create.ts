import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserSuccessResponse {
  @Field(() => ID)
  id: string;

  @Field({ name: 'created_at' })
  createdAt: Date;

  @Field({ name: 'modified_at' })
  modifieldAt: Date;
}

@ObjectType()
export class ErrorResponse {
  @Field()
  status: string;

  @Field()
  message: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => UserSuccessResponse, { nullable: true })
  data?: UserSuccessResponse;

  @Field(() => ErrorResponse, { nullable: true })
  error?: ErrorResponse;
}
