// services/storageService.ts
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';

export class StorageService {
  /**
   * Uploads a base64 encoded image to the Supabase 'cafe-images' bucket.
   * Converts the base64 string to an ArrayBuffer before uploading.
   * @param base64FileData The base64 representation of the image.
   * @param fileExtension The extension of the file (e.g., 'jpg', 'png').
   * @returns The public URL of the uploaded image.
   */
  static async uploadImage(
    base64FileData: string,
    fileExtension: string,
  ): Promise<string> {
    try {
      const fileName = `${Date.now()}.${fileExtension}`;
      const filePath = `public/${fileName}`;

      const { error } = await supabase.storage
        .from('cafe-images')
        .upload(filePath, decode(base64FileData), {
          contentType: `image/${fileExtension}`,
        });

      if (error) throw new Error(error.message);

      const { data } = supabase.storage
        .from('cafe-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Storage Upload Error: ', error.message);
      throw error;
    }
  }

  /**
   * Deletes an image from the Supabase 'cafe-images' bucket.
   * It safely ignores external URLs (like Unsplash) and only deletes Supabase hosted files.
   * @param imageUrl The full public URL of the image to be deleted.
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Step 1: Check if the URL belongs to our Supabase storage
      if (
        !imageUrl ||
        !imageUrl.includes('supabase.co') ||
        !imageUrl.includes('cafe-images')
      ) {
        return;
      }

      // Step 2: Extract the file path
      const filePath = imageUrl.split('/cafe-images/')[1];

      if (filePath) {
        // Step 3: Delete the file from the bucket
        const { error } = await supabase.storage
          .from('cafe-images')
          .remove([filePath]);

        if (error) throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Storage Delete Error: ', error.message);
    }
  }
}
