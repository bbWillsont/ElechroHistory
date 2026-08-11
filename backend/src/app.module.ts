// app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RatesModule } from './rates/rates.module';
import { EstimatesModule } from './estimates/estimates.module';

@Module({ imports: [PrismaModule, RatesModule, EstimatesModule] })
export class AppModule {}
