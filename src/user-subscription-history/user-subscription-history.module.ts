import { Module } from '@nestjs/common';
import { UserSubscriptionHistoryController } from './user-subscription-history.controller';
import { UserSubscriptionHistoryService } from './user-subscription-history.service';

@Module({
  controllers: [UserSubscriptionHistoryController],
  providers: [UserSubscriptionHistoryService]
})
export class UserSubscriptionHistoryModule {}
