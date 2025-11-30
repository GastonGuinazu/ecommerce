import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class FilesService {
  
  // Método para subir un archivo a Cloudinary
  uploadImage(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'mi-tienda-productos' }, // Carpeta en tu nube
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      // Convertimos el buffer del archivo en un stream legible
      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
}