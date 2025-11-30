import { Controller, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' es el nombre del campo en el formulario
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Validamos que no pese más de 5MB
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), 
          // Validamos que sea imagen (jpg, png, webp, etc)
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Subimos la imagen y devolvemos la URL segura
    const result = await this.filesService.uploadImage(file);
    return { url: result.secure_url };
  }
}