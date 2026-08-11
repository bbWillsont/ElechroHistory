import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { RatesService } from './rates.service';
import { QueryRatesDto } from './dto/query-rates.dto';

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  search(@Query() q: QueryRatesDto) {
    return this.ratesService.search(q);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.ratesService.getById(id);
  }
}
