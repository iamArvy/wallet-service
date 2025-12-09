import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserModelAction } from './model-actions/user.model-action';

@Module({
  controllers: [UserController],
  providers: [UserService, UserModelAction],
  exports: [UserModelAction],
})
export class UserModule {}
