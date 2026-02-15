import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SponsorshipsService } from '../services/sponsorships.service';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import {
  CreateSponsorshipSchema,
  UpdateSponsorshipSchema,
  SponsorshipListSchema,
  type CreateSponsorshipDto,
  type UpdateSponsorshipDto,
  type SponsorshipResponseDto,
  type SponsorshipListDto,
  type PaginatedSponsorshipResponseDto,
} from '@repo/core';
import {
  CreateSponsorship,
  GetAllSponsorships,
  GetSponsorshipById,
  UpdateSponsorship,
  DeleteSponsorship,
} from '../decorators/sponsorship-endpoint.decorators';

@Controller('sponsorships')
@ApiTags('sponsorships')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class SponsorshipsController {
  constructor(private readonly sponsorshipsService: SponsorshipsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateSponsorship()
  async create(
    @Body(new ZodValidationPipe(CreateSponsorshipSchema))
    createSponsorshipDto: CreateSponsorshipDto,
  ): Promise<SponsorshipResponseDto> {
    return this.sponsorshipsService.create(createSponsorshipDto);
  }

  @Get()
  @GetAllSponsorships()
  async findAll(
    @Query(new ZodValidationPipe(SponsorshipListSchema))
    queryDto?: SponsorshipListDto,
  ): Promise<PaginatedSponsorshipResponseDto> {
    return this.sponsorshipsService.findAll(queryDto);
  }

  @Get(':id')
  @GetSponsorshipById()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SponsorshipResponseDto> {
    return this.sponsorshipsService.findOne(id);
  }

  @Patch(':id')
  @UpdateSponsorship()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateSponsorshipSchema))
    updateSponsorshipDto: UpdateSponsorshipDto,
  ): Promise<SponsorshipResponseDto> {
    return this.sponsorshipsService.update(id, updateSponsorshipDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteSponsorship()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sponsorshipsService.remove(id);
  }
}
