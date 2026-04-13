import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { InvestmentsModule } from './investments/investments.module';

@Module({
  imports: [UsersModule, InvestmentsModule],
})
export class AppModule {}
