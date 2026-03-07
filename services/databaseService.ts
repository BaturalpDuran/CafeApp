// services/databaseService.ts
import { supabase } from '../lib/supabase';

// Tüm veritabanı işlemlerimizi yöneteceğimiz Controller/Service sınıfımız
export class DatabaseService {
  // ==========================================
  // KAMPANYA İŞLEMLERİ (CAMPAIGNS)
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

  static async deleteCampaign(id: string) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ==========================================
  // TARİF İŞLEMLERİ (RECIPES)
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

  static async deleteRecipe(id: string) {
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
