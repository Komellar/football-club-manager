import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../core/auth/auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  ContractQuery,
  ContractQuerySchema,
  CreateContractSchema,
  UpdateContractSchema,
  CreateContractDto,
  UpdateContractDto,
  PaginatedContractResponseDto,
} from '@repo/core';
import { ContractsService } from './contracts.service';

@Controller('contracts')
@UseGuards(AuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(CreateContractSchema))
    createContractDto: CreateContractDto,
  ) {
    return await this.contractsService.create(createContractDto);
  }

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(ContractQuerySchema)) query: ContractQuery,
  ): Promise<PaginatedContractResponseDto> {
    return await this.contractsService.findAll(query);
  }

  @Get('active')
  async findActiveContracts() {
    return await this.contractsService.findActiveContracts();
  }

  @Get('expiring')
  async findExpiringContracts(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return await this.contractsService.findExpiringContracts(daysNumber);
  }

  @Get('player/:playerId')
  async findByPlayerId(@Param('playerId', ParseIntPipe) playerId: number) {
    return await this.contractsService.findByPlayerId(playerId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.contractsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateContractSchema))
    updateContractDto: UpdateContractDto,
  ) {
    return await this.contractsService.update(id, updateContractDto);
  }

  @Patch(':id/terminate')
  async terminate(
    @Param('id', ParseIntPipe) id: number,
    @Body('notes') notes?: string,
  ) {
    return await this.contractsService.terminate(id, notes);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.contractsService.remove(id);
  }
}
