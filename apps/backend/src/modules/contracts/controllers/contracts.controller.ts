import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { ContractsService } from '../services/contracts.service';
import {
  CreateContractSchema,
  UpdateContractSchema,
  ContractListSchema,
  type CreateContractDto,
  type UpdateContractDto,
  type ContractListDto,
  type PaginatedContractListResponseDto,
} from '@repo/core';
import { Contract } from '@/shared/entities';
import {
  CreateContract,
  GetAllContracts,
  GetContractById,
  UpdateContract,
  DeleteContract,
} from '../decorators/contract-endpoint.decorators';

@Controller('contracts')
@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateContract()
  async create(
    @Body(new ZodValidationPipe(CreateContractSchema))
    createContractDto: CreateContractDto,
  ): Promise<Contract> {
    return await this.contractsService.create(createContractDto);
  }

  @Get()
  @GetAllContracts()
  async findAll(
    @Query(new ZodValidationPipe(ContractListSchema))
    query: ContractListDto,
  ): Promise<PaginatedContractListResponseDto> {
    return await this.contractsService.findAll(query);
  }

  @Get(':id')
  @GetContractById()
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Contract> {
    return await this.contractsService.findOne(id);
  }

  @Patch(':id')
  @UpdateContract()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateContractSchema))
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    return await this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteContract()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.contractsService.remove(id);
  }
}
