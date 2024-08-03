export interface StorageService {
  uploadFile(
    file: Express.Multer.File | undefined,
  ): Promise<string | undefined>;
  deleteFile(key: string): Promise<boolean>;
}
