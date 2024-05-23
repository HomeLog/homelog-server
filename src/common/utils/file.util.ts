import { diskStorage } from 'multer';

export const getLocalStorage = () =>
  diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
    },
  });

export async function getFilePath(
  file?: Express.Multer.File,
): Promise<string | undefined> {
  return file?.path;
}

export async function getFilePaths(files: {
  files?: Express.Multer.File[];
}): Promise<{
  filePaths: string[];
}> {
  const filePaths = files.files?.map((file) => file.path) || [];
  return { filePaths };
}
