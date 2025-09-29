import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/core/auth/auth.guard';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { ContractsService } from '../services/contracts.service';
import {
  CreateContractSchema,
  UpdateContractSchema,
  type CreateContractDto,
  type UpdateContractDto,
} from '@repo/core';
import { Contract } from '@/shared/entities';

@Controller('contracts')
@UseGuards(AuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(CreateContractSchema))
    createContractDto: CreateContractDto,
  ): Promise<Contract> {
    return await this.contractsService.create(createContractDto);
  }

  @Get()
  async findAll(): Promise<Contract[]> {
    return await this.contractsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Contract> {
    return await this.contractsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateContractSchema))
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    return await this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.contractsService.remove(id);
  }
}
