import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';

export async function uploadImageToCloudinary(
  fileBuffer: Buffer,
  folder = 'campus_events'
): Promise<string> {
  // If Cloudinary keys are not real/configured, return a mock/placeholder image URL
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name' ||
    env.CLOUDINARY_CLOUD_NAME === 'mock_cloud'
  ) {
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${randomId}/800/450`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error('Cloudinary upload failed'));
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function uploadDocumentToCloudinary(
  fileBuffer: Buffer,
  originalFilename: string,
  folder = 'campus_resources'
): Promise<{ file_url: string; file_type: string }> {
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'pdf';

  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name' ||
    env.CLOUDINARY_CLOUD_NAME === 'mock_cloud'
  ) {
    return {
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_type: ext,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error('Cloudinary document upload failed'));
        resolve({
          file_url: result.secure_url,
          file_type: result.format || ext,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}
