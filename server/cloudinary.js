import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload an image buffer to Cloudinary using upload_stream with automatic optimization.
 * @param {Buffer} buffer - In-memory file buffer from multer
 * @param {Object} options - Additional Cloudinary upload parameters
 * @returns {Promise<Object>}
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'grocery-mart',
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete an image asset from Cloudinary using its public ID.
 * @param {string} publicId
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    throw new Error('Public ID is required for deletion');
  }
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
