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
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlayersService } from './players.service';
import { AuthGuard } from '@/core/auth/auth.guard';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import {
  CreatePlayerSchema,
  UpdatePlayerSchema,
  PlayerQuerySchema,
  type CreatePlayerDto,
  type UpdatePlayerDto,
  type PlayerResponseDto,
  type PlayerQueryDto,
  type PaginatedPlayerResponseDto,
} from '@repo/core';

@Controller('players')
@UseGuards(AuthGuard)
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(CreatePlayerSchema))
    createPlayerDto: CreatePlayerDto,
  ): Promise<PlayerResponseDto> {
    return this.playersService.create(createPlayerDto);
  }

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(PlayerQuerySchema))
    queryDto?: PlayerQueryDto,
  ): Promise<PaginatedPlayerResponseDto> {
    return this.playersService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlayerResponseDto> {
    return this.playersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdatePlayerSchema))
    updatePlayerDto: UpdatePlayerDto,
  ): Promise<PlayerResponseDto> {
    return this.playersService.update(id, updatePlayerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.playersService.remove(id);
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ): Promise<PlayerResponseDto> {
    return this.playersService.uploadImage(id, file);
  }
}
