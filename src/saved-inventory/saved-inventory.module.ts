import { Module } from '@nestjs/common';
import { SavedInventoryController } from './saved-inventory.controller';
import { SavedInventory } from './saved-inventory';

@Module({
  controllers: [SavedInventoryController],
  providers: [SavedInventory]
})
export class SavedInventoryModule {}
