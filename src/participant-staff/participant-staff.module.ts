import { Module } from '@nestjs/common';
import { ParticipantStaffController } from './participant-staff.controller';
import { ParticipantStaffService } from './participant-staff.service';

@Module({
  controllers: [ParticipantStaffController],
  providers: [ParticipantStaffService]
})
export class ParticipantStaffModule { }
