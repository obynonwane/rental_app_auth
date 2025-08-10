import { Module } from '@nestjs/common';
import { UserSubscriptionController } from './user-subscription.controller';
import { UserSubscriptionService } from './user-subscription.service';

@Module({
  
  controllers: [UserSubscriptionController],
  providers: [UserSubscriptionService]
})
export class UserSubscriptionModule {}
