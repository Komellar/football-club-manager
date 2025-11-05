import {
  Controller,
  Get,
  Post,
  Body,
  Put,
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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PlayersService } from '../services/players.service';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import {
  CreatePlayer,
  GetAllPlayers,
  GetPlayerById,
  UpdatePlayer,
  DeletePlayer,
  UploadPlayerImage,
} from '../decorators/player-endpoint.decorators';
import {
  CreatePlayerSchema,
  PlayerListSchema,
  type CreatePlayerDto,
  type PlayerResponseDto,
  type PlayerListDto,
  type PaginatedPlayerListResponseDto,
} from '@repo/core';

@ApiTags('players')
@ApiBearerAuth()
@Controller('players')
@UseGuards(AuthGuard)
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreatePlayer()
  async create(
    @Body(new ZodValidationPipe(CreatePlayerSchema))
    createPlayerDto: CreatePlayerDto,
  ): Promise<PlayerResponseDto> {
    return this.playersService.create(createPlayerDto);
  }

  @Get()
  @GetAllPlayers()
  async findAll(
    @Query(new ZodValidationPipe(PlayerListSchema))
    queryDto?: PlayerListDto,
  ): Promise<PaginatedPlayerListResponseDto> {
    return this.playersService.findAll(queryDto);
  }

  @Get('match-squad')
  @HttpCode(HttpStatus.OK)
  async getRandomMatchSquad(): Promise<PlayerResponseDto[]> {
    return this.playersService.getRandomMatchSquad();
  }

  @Get(':id')
  @GetPlayerById()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlayerResponseDto> {
    return this.playersService.findOne(id);
  }

  @Put(':id')
  @UpdatePlayer()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CreatePlayerSchema))
    updatePlayerDto: CreatePlayerDto,
  ): Promise<PlayerResponseDto> {
    return this.playersService.update(id, updatePlayerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeletePlayer()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.playersService.remove(id);
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  @UploadPlayerImage()
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
