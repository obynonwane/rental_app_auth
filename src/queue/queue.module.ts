import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: 'redis',
                port: 6379,
            },
        }),
        BullModule.registerQueue({
            name: 'freemium-subscriptions',
        }),
    ],
    exports: [BullModule],
})
export class QueueModule { }
