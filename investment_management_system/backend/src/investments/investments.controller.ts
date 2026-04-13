import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}
 
  @Get()
  findAll() {
    return this.investmentsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.investmentsService.findByUser(userId);
  }
 
  @Get('user/:userId/summary')
  getPortfolioSummary(@Param('userId', ParseIntPipe) userId: number) {
    return this.investmentsService.getPortfolioSummary(userId);
  }
 
  // ✅ Динамічний маршрут (:id) — завжди ПІСЛЯ статичних
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.investmentsService.findOne(id);
  }
 
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInvestmentDto: CreateInvestmentDto) {
    return this.investmentsService.create(createInvestmentDto);
  }
 
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.investmentsService.remove(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInvestmentDto) {
    return this.investmentsService.update(+id, dto);
  }
}