import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';

export const authService = {
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  async getCurrentOrganizationId() {
    const { data, error } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
    if (error) {
      console.error('Error fetching org:', error);
      return null;
    }
    return data?.id;
  }
};

export const marketService = {
  async getMarkets(orgId: string) {
    const { data, error } = await supabase
      .from('market_summaries')
      .select('*')
      .eq('organization_id', orgId);
    if (error) throw error;
    return data;
  }
};

export const exceptionService = {
  async getExceptions(orgId: string) {
    const { data, error } = await supabase
      .from('lane_exceptions')
      .select('*')
      .eq('organization_id', orgId);
    if (error) throw error;
    return data;
  }
};

export const adjustmentService = {
  async getAdjustments(orgId: string) {
    const { data, error } = await supabase
      .from('pricing_adjustments')
      .select('*')
      .eq('organization_id', orgId);
    if (error) throw error;
    return data;
  },
  async createAdjustment(adjustment: any) {
    const { data, error } = await supabase
      .from('pricing_adjustments')
      .insert([adjustment]);
    if (error) throw error;
    return data;
  }
};

export const rateLaneService = {
  async getCustomerLanes(orgId: string) {
    const { data, error } = await supabase
      .from('customer_rate_lanes')
      .select('*')
      .eq('organization_id', orgId);
    if (error) throw error;
    return data;
  }
};
