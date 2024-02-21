import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [ConfigModule.register({ folder: './config' })],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}