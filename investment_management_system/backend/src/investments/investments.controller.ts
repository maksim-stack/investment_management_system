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
  UseGuards, 
  Req 
} from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}
  
  @Get('me')
  findMyInvestments(@Req() req) {
    console.log('CONTROLLER REACHED');
    return this.investmentsService.findByUser(req.user.userId);
  }
 
  @Get('me/summary')
  getPortfolioSummary(@Req() req) {
    return this.investmentsService.getPortfolioSummary(req.user.userId);
  }
 
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.investmentsService.findOne(id, req.user.userId);
  }
 
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateInvestmentDto, @Req() req) {
    return this.investmentsService.create({ ...dto, userId: req.user.userId });
  }
 
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.investmentsService.remove(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInvestmentDto, @Req() req) {
    return this.investmentsService.update(id, dto, req.user.userId );
  }
}