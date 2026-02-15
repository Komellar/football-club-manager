import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sponsorship } from '@/shared/entities/sponsorship.entity';
import { FilterMode, SponsorshipStatus } from '@repo/core';
import type {
  CreateSponsorshipDto,
  UpdateSponsorshipDto,
  SponsorshipResponseDto,
  SponsorshipListDto,
  PaginatedSponsorshipResponseDto,
} from '@repo/core';
import { ListQueryBuilder } from '@/shared/query/list-query-builder';

@Injectable()
export class SponsorshipsService {
  constructor(
    @InjectRepository(Sponsorship)
    private sponsorshipRepository: Repository<Sponsorship>,
  ) {}

  async create(
    createSponsorshipDto: CreateSponsorshipDto,
  ): Promise<SponsorshipResponseDto> {
    await this.checkOverlappingSponsorship(
      createSponsorshipDto.sponsorshipType,
      createSponsorshipDto.startDate,
      createSponsorshipDto.endDate,
    );

    const sponsorship = this.sponsorshipRepository.create(createSponsorshipDto);
    const savedSponsorship = await this.sponsorshipRepository.save(sponsorship);
    return this.mapToResponseDto(savedSponsorship);
  }

  async findAll(
    queryDto?: Partial<SponsorshipListDto>,
  ): Promise<PaginatedSponsorshipResponseDto> {
    const result = await ListQueryBuilder.executeQuery(
      this.sponsorshipRepository,
      queryDto,
      {
        defaultFilterMode: FilterMode.EXACT,
        filterModes: {
          sponsorName: FilterMode.PARTIAL,
        },
        searchOptions: {
          searchFields: ['sponsorName', 'description'],
          searchMode: FilterMode.PARTIAL,
        },
      },
    );

    return {
      data: result.data.map((sponsorship) =>
        this.mapToResponseDto(sponsorship),
      ),
      pagination: result.pagination,
    };
  }

  async findOne(id: number): Promise<SponsorshipResponseDto> {
    const sponsorship = await this.sponsorshipRepository.findOneOrFail({
      where: { id },
    });
    return this.mapToResponseDto(sponsorship);
  }

  async update(
    id: number,
    updateSponsorshipDto: UpdateSponsorshipDto,
  ): Promise<SponsorshipResponseDto> {
    const sponsorship = await this.sponsorshipRepository.findOneOrFail({
      where: { id },
    });

    // Check for overlapping sponsorships if type or dates are being updated
    if (
      updateSponsorshipDto.sponsorshipType ||
      updateSponsorshipDto.startDate ||
      updateSponsorshipDto.endDate
    ) {
      const type =
        updateSponsorshipDto.sponsorshipType || sponsorship.sponsorshipType;
      const startDate = updateSponsorshipDto.startDate || sponsorship.startDate;
      const endDate = updateSponsorshipDto.endDate || sponsorship.endDate;

      await this.checkOverlappingSponsorship(type, startDate, endDate, id);
    }

    Object.assign(sponsorship, updateSponsorshipDto);
    const updatedSponsorship =
      await this.sponsorshipRepository.save(sponsorship);
    return this.mapToResponseDto(updatedSponsorship);
  }

  async remove(id: number): Promise<void> {
    const sponsorship = await this.sponsorshipRepository.findOneOrFail({
      where: { id },
    });
    await this.sponsorshipRepository.remove(sponsorship);
  }

  private async checkOverlappingSponsorship(
    type: string,
    startDate: Date,
    endDate: Date,
    excludeId?: number,
  ): Promise<void> {
    const queryBuilder = this.sponsorshipRepository
      .createQueryBuilder('sponsorship')
      .where('sponsorship.sponsorship_type = :type', { type })
      .andWhere('sponsorship.sponsorship_status != :cancelled', {
        cancelled: SponsorshipStatus.CANCELLED,
      })
      .andWhere('sponsorship.start_date <= :endDate', { endDate })
      .andWhere('sponsorship.end_date >= :startDate', { startDate });

    if (excludeId) {
      queryBuilder.andWhere('sponsorship.id != :excludeId', { excludeId });
    }

    const overlappingSponsorships = await queryBuilder.getMany();

    if (overlappingSponsorships.length > 0) {
      const existing = overlappingSponsorships[0];
      throw new BadRequestException(
        `A sponsorship of type '${type}' already exists for the date range ${new Date(existing.startDate).toLocaleDateString()} - ${new Date(existing.endDate).toLocaleDateString()}. Cannot create overlapping sponsorships of the same type.`,
      );
    }
  }

  private mapToResponseDto(sponsorship: Sponsorship): SponsorshipResponseDto {
    const {
      id,
      sponsorName,
      sponsorshipType,
      sponsorshipStatus,
      startDate,
      endDate,
      annualValue,
      paymentFrequency,
      description,
      contactPerson,
      contactEmail,
      contactPhone,
      notes,
      createdAt,
      updatedAt,
    } = sponsorship;

    return {
      id,
      sponsorName,
      sponsorshipType,
      sponsorshipStatus,
      startDate,
      endDate,
      annualValue: Number(annualValue),
      paymentFrequency,
      description,
      contactPerson,
      contactEmail,
      contactPhone,
      notes,
      createdAt,
      updatedAt,
      isActive: sponsorship.isActive,
      daysRemaining: sponsorship.daysRemaining ?? undefined,
      monthlyValue: sponsorship.monthlyValue,
    };
  }
}
