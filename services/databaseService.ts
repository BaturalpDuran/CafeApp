// services/databaseService.ts
import { supabase } from '../lib/supabase';
import { StorageService } from './storageService';

// Tüm veritabanı işlemlerimizi yöneteceğimiz Controller/Service sınıfımız
export class DatabaseService {
  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  /**
   * Creates a new user profile in the database after successful authentication signup.
   * Default role is assigned as 'customer'.
   * @param userId The unique ID from Supabase Auth.
   * @param email The user's email address.
   * @param firstName The user's first name.
   * @param lastName The user's last name.
   */
  static async createUserProfile(
    userId: string,
    email: string,
    firstName: string,
    lastName: string,
  ) {
    try {
      const { error } = await supabase.from('profiles').insert([
        {
          id: userId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: 'customer', // Default role for new signups
        },
      ]);

      if (error) throw new Error(error.message);
    } catch (error: any) {
      console.error('Create User Profile Error: ', error.message);
      throw error;
    }
  }
  // ==========================================
  // (CAMPAIGNS)
  // ==========================================

  static async getCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  static async getCampaignById(id: string | string[]) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async addCampaign(
    title: string,
    description: string,
    imageUrl: string,
  ) {
    const { error } = await supabase
      .from('campaigns')
      .insert([{ title, description, image_url: imageUrl }]);

    if (error) throw new Error(error.message);
  }

  static async deleteCampaign(id: string, imageUrl: string) {
    // First, try to remove the image from the storage bucket
    await StorageService.deleteImage(imageUrl);

    // Then, remove the record from the database
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ==========================================
  // (RECIPES)
  // ==========================================

  static async getRecipes() {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  static async getRecipeById(id: string | string[]) {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async addRecipe(title: string, details: string, imageUrl: string) {
    const { error } = await supabase
      .from('recipes')
      .insert([{ title, details: details, image_url: imageUrl }]);

    if (error) throw new Error(error.message);
  }

  static async deleteRecipe(id: string, imageUrl: string) {
    // First, try to remove the image from the storage bucket
    await StorageService.deleteImage(imageUrl);

    // Then, remove the record from the database
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
