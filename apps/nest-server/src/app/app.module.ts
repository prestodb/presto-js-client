import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrestoService } from './presto.service'

@Module({
  controllers: [AppController],
  imports: [],
  providers: [AppService, PrestoService],
})
export class AppModule {}
