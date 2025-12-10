/**
 * Supabase API Client
 * Direct Supabase queries for frontend components
 * Replaces Express API routes for read operations
 */

import { supabase } from './supabase';

// ============================================================================
// COUNTIES
// ============================================================================

export interface County {
  id: number;
  name: string;
  population?: number | null;
  thematic_area_id?: number | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  status?: 'draft' | 'published';
  created_by_user?: {
    full_name: string;
  } | null;
  water_score?: number | null;
  waste_score?: number | null;
}

export async function listCounties(): Promise<County[]> {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get counties with creator info and latest year's performance scores
    const { data, error } = await supabase
      .from('counties')
      .select(`
        *,
        created_by_user:user_profiles(full_name)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching counties:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get performance scores for all counties for the current year
    const countyIds = data.map(c => c.id);
    const { data: performanceData, error: perfError } = await supabase
      .from('county_performance')
      .select('county_id, sector, sector_score')
      .in('county_id', countyIds)
      .eq('year', currentYear);

    if (perfError) {
      console.error('Error fetching county performance:', perfError);
      // Continue without performance data rather than failing
    }

    // Map performance scores to counties
    const performanceMap = new Map<number, { water?: number; waste?: number }>();
    (performanceData || []).forEach((perf: any) => {
      if (!performanceMap.has(perf.county_id)) {
        performanceMap.set(perf.county_id, {});
      }
      const scores = performanceMap.get(perf.county_id)!;
      if (perf.sector === 'water') {
        scores.water = perf.sector_score;
      } else if (perf.sector === 'waste') {
        scores.waste = perf.sector_score;
      }
    });

    // Combine counties with performance scores
    return data.map((county: any) => ({
      ...county,
      created_by_user: county.created_by_user ? { full_name: county.created_by_user.full_name } : null,
      water_score: performanceMap.get(county.id)?.water ?? null,
      waste_score: performanceMap.get(county.id)?.waste ?? null,
    }));
  } catch (err) {
    console.error('listCounties failed:', err);
    throw err;
  }
}

export async function getCounty(id: number): Promise<County | null> {
  const { data, error } = await supabase
    .from('counties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function createCounty(payload: {
  name: string;
  population?: number;
  thematic_area_id?: number;
  status?: 'draft' | 'published';
}): Promise<County> {
  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('counties')
    .insert({
      name: payload.name,
      population: payload.population || null,
      thematic_area_id: payload.thematic_area_id || null,
      created_by: user?.id || null,
      status: payload.status || 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCounty(
  id: number,
  payload: { 
    name: string; 
    population?: number; 
    thematic_area_id?: number;
    status?: 'draft' | 'published';
  }
): Promise<County> {
  const { data, error } = await supabase
    .from('counties')
    .update({
      name: payload.name,
      population: payload.population || null,
      thematic_area_id: payload.thematic_area_id || null,
      status: payload.status || undefined,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCounty(id: number): Promise<void> {
  const { error } = await supabase
    .from('counties')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// THEMATIC AREAS
// ============================================================================

export interface ThematicArea {
  id: number;
  name: string;
  description?: string | null;
  sector?: 'water' | 'waste' | null;
  weight_percentage?: number | null;
  created_at?: string;
  updated_at?: string;
  indicator_count?: number; // Computed field for UI
}

export async function listThematicAreas(): Promise<ThematicArea[]> {
  try {
    // Get all thematic areas
    const { data: thematicAreas, error: thematicError } = await supabase
      .from('thematic_areas')
      .select('*')
      .order('sector')
      .order('name');

    if (thematicError) {
      console.error('Error fetching thematic areas:', thematicError);
      throw thematicError;
    }

    if (!thematicAreas || thematicAreas.length === 0) {
      return [];
    }

    // Get all indicators to count per thematic area and sector
    const { data: indicators, error: indicatorError } = await supabase
      .from('indicators')
      .select('sector, thematic_area');

    if (indicatorError) {
      console.error('Error fetching indicators for count:', indicatorError);
      // Continue without indicator counts rather than failing
    }

    // Count indicators per thematic area per sector
    const indicatorCounts = new Map<string, number>();
    (indicators || []).forEach((ind: any) => {
      const key = `${ind.sector}:${ind.thematic_area}`;
      indicatorCounts.set(key, (indicatorCounts.get(key) || 0) + 1);
    });

    // Add indicator counts to thematic areas
    return thematicAreas.map((area: any) => {
      const waterKey = `water:${area.name}`;
      const wasteKey = `waste:${area.name}`;
      const waterCount = indicatorCounts.get(waterKey) || 0;
      const wasteCount = indicatorCounts.get(wasteKey) || 0;
      
      // Return thematic area with indicator count for its sector
      const count = area.sector === 'water' ? waterCount : 
                    area.sector === 'waste' ? wasteCount : 0;

      return {
        ...area,
        indicator_count: count,
      };
    });
  } catch (err) {
    console.error('listThematicAreas failed:', err);
    throw err;
  }
}

export async function getThematicArea(id: number): Promise<ThematicArea | null> {
  const { data, error } = await supabase
    .from('thematic_areas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Validate that thematic area weights total to 100% or less for a given sector
 * @param sector - The sector to validate ('water' or 'waste')
 * @param excludeId - Optional ID to exclude from calculation (for updates)
 * @returns Validation result with current total and message
 */
export async function validateThematicAreaWeights(
  sector: 'water' | 'waste',
  excludeId?: number
): Promise<{ isValid: boolean; currentTotal: number; message: string }> {
  try {
    let query = supabase
      .from('thematic_areas')
      .select('weight_percentage')
      .eq('sector', sector);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const currentTotal = (data || []).reduce(
      (sum, area) => sum + (area.weight_percentage || 0),
      0
    );
    
    return {
      isValid: currentTotal <= 100,
      currentTotal,
      message: currentTotal > 100
        ? `Total weight would exceed 100%. Current total: ${currentTotal.toFixed(2)}%`
        : `Current total: ${currentTotal.toFixed(2)}%`
    };
  } catch (err) {
    console.error('Error validating thematic area weights:', err);
    throw err;
  }
}

export async function createThematicArea(payload: { 
  name: string; 
  description?: string;
  sector?: 'water' | 'waste';
  weight_percentage?: number;
}): Promise<ThematicArea> {
  // Validate weights before creating
  if (payload.sector && payload.weight_percentage !== undefined && payload.weight_percentage > 0) {
    const validation = await validateThematicAreaWeights(payload.sector);
    const newTotal = validation.currentTotal + payload.weight_percentage;
    
    if (newTotal > 100) {
      throw new Error(
        `Cannot add thematic area: Total weight would be ${newTotal.toFixed(2)}%, exceeding 100%. ` +
        `Current total: ${validation.currentTotal.toFixed(2)}%, New weight: ${payload.weight_percentage}%`
      );
    }
  }
  
  const { data, error } = await supabase
    .from('thematic_areas')
    .insert({
      name: payload.name,
      description: payload.description || null,
      sector: payload.sector || null,
      weight_percentage: payload.weight_percentage || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateThematicArea(
  id: number,
  payload: { 
    name: string; 
    description?: string;
    sector?: 'water' | 'waste';
    weight_percentage?: number;
  }
): Promise<ThematicArea> {
  // Validate weights before updating
  if (payload.sector && payload.weight_percentage !== undefined && payload.weight_percentage > 0) {
    const validation = await validateThematicAreaWeights(payload.sector, id);
    const newTotal = validation.currentTotal + payload.weight_percentage;
    
    if (newTotal > 100) {
      throw new Error(
        `Cannot update thematic area: Total weight would be ${newTotal.toFixed(2)}%, exceeding 100%. ` +
        `Current total (excluding this area): ${validation.currentTotal.toFixed(2)}%, New weight: ${payload.weight_percentage}%`
      );
    }
  }
  
  const { data, error } = await supabase
    .from('thematic_areas')
    .update({
      name: payload.name,
      description: payload.description || null,
      sector: payload.sector !== undefined ? payload.sector : undefined,
      weight_percentage: payload.weight_percentage !== undefined ? payload.weight_percentage : undefined,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteThematicArea(id: number): Promise<void> {
  const { error } = await supabase
    .from('thematic_areas')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// PUBLICATIONS
// ============================================================================

export interface Publication {
  id: number;
  title: string;
  date?: string | null;
  summary?: string | null;
  filename: string;
  storage_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function listPublications(): Promise<Publication[]> {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .order('date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching publications:', error);
    throw error;
  }
  console.log('Publications query result:', data);
  return data || [];
}

export async function getPublication(id: number): Promise<Publication | null> {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function downloadPublication(id: number): Promise<Blob> {
  // Get publication metadata
  const publication = await getPublication(id);
  if (!publication) throw new Error('Publication not found');

  // Download from Supabase Storage
  const { data, error } = await supabase.storage
    .from('publications')
    .download(publication.storage_path);

  if (error) throw error;
  if (!data) throw new Error('File not found');

  return data;
}

export async function deletePublication(id: number): Promise<void> {
  // Get publication metadata to get storage path
  const publication = await getPublication(id);
  if (!publication) throw new Error('Publication not found');

  // Delete file from storage first
  if (publication.storage_path) {
    const { error: storageError } = await supabase.storage
      .from('publications')
      .remove([publication.storage_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }
  }

  // Delete publication record from database
  const { error } = await supabase
    .from('publications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// COUNTY PERFORMANCE
// ============================================================================

export interface CountyPerformance {
  id: number;
  county_id: number;
  year: number;
  sector: 'water' | 'waste';
  overall_score?: number | null;
  sector_score?: number | null;
  governance?: number | null;
  mrv?: number | null;
  mitigation?: number | null;
  adaptation?: number | null;
  finance?: number | null;
  indicators_json?: any; // JSONB
  created_at?: string;
  updated_at?: string;
}

export interface CountySummaryPerformance {
  name: string;
  score: number;
  rank?: number;
  performance?: string;
}

export async function getCountySummaryPerformance(
  sector: 'water' | 'waste',
  year: number = new Date().getFullYear()
): Promise<any[]> {
  // Fetch performance data with county names and all performance metrics
  const { data, error } = await supabase
    .from('county_performance')
    .select(`
      sector_score,
      overall_score,
      governance,
      mrv,
      mitigation,
      adaptation,
      finance,
      county_id,
      counties(name)
    `)
    .eq('sector', sector)
    .eq('year', year)
    .order('sector_score', { ascending: false });

  if (error) {
    console.error('Error fetching county summary performance:', error);
    throw error;
  }
  console.log('County summary performance query result:', data);

  return (data || []).map((row: any, index: number) => ({
    name: row.counties?.name || 'Unknown',
    county_name: row.counties?.name || 'Unknown',
    score: row.sector_score || 0,
    rank: index + 1,
    governance: row.governance || 0,
    mrv: row.mrv || 0,
    mitigation: row.mitigation || 0,
    adaptation: row.adaptation || 0,
    adaptation_resilience: row.adaptation || 0,
    finance: row.finance || 0,
    overall_score: row.overall_score || 0,
  }));
}

/**
 * Get county rankings by thematic area
 * @param thematicAreaName - The name of the thematic area (e.g., "Governance & Policy Framework", "MRV", etc.)
 * @param year - The year to fetch data for (defaults to current year)
 * @returns Array of counties ranked by their performance in the specified thematic area
 *          Returns empty array if thematic area doesn't have performance data or is unknown
 */
export async function getCountyRankingsByThematicArea(
  thematicAreaName: string,
  year: number = new Date().getFullYear()
): Promise<any[]> {
  // Map thematic area names to database column names
  // Only NDC framework thematic areas have corresponding columns in county_performance
  const thematicAreaMap: Record<string, string> = {
    'Governance & Policy Framework': 'governance',
    'Governance': 'governance',
    'MRV': 'mrv',
    'Mitigation Actions': 'mitigation',
    'Mitigation': 'mitigation',
    'Adaptation & Resilience': 'adaptation',
    'Adaptation': 'adaptation',
    'Climate Finance & Investment': 'finance',
    'Finance & Technology Transfer': 'finance',
    'Finance & Resource Mobilization': 'finance',
  };

  const columnName = thematicAreaMap[thematicAreaName];
  
  // If thematic area doesn't have a corresponding column in county_performance,
  // return empty array gracefully (new thematic areas won't have performance data yet)
  if (!columnName) {
    console.warn(`Thematic area "${thematicAreaName}" doesn't have performance data in county_performance table. Returning empty rankings.`);
    return [];
  }

  // Fetch performance data for both water and waste sectors
  const { data: waterData, error: waterError } = await supabase
    .from('county_performance')
    .select(`
      ${columnName},
      county_id,
      counties(name)
    `)
    .eq('sector', 'water')
    .eq('year', year)
    .not(columnName, 'is', null)
    .order(columnName, { ascending: false });

  const { data: wasteData, error: wasteError } = await supabase
    .from('county_performance')
    .select(`
      ${columnName},
      county_id,
      counties(name)
    `)
    .eq('sector', 'waste')
    .eq('year', year)
    .not(columnName, 'is', null)
    .order(columnName, { ascending: false });

  if (waterError || wasteError) {
    console.error('Error fetching county rankings by thematic area:', waterError || wasteError);
    throw waterError || wasteError;
  }

  // Combine water and waste data by county
  const countyMap = new Map<string, { name: string; water: number | null; waste: number | null }>();

  (waterData || []).forEach((row: any) => {
    const countyName = row.counties?.name || 'Unknown';
    if (!countyMap.has(countyName)) {
      countyMap.set(countyName, { name: countyName, water: null, waste: null });
    }
    countyMap.get(countyName)!.water = row[columnName] || 0;
  });

  (wasteData || []).forEach((row: any) => {
    const countyName = row.counties?.name || 'Unknown';
    if (!countyMap.has(countyName)) {
      countyMap.set(countyName, { name: countyName, water: null, waste: null });
    }
    countyMap.get(countyName)!.waste = row[columnName] || 0;
  });

  // Convert to array, calculate average, and sort
  const rankings = Array.from(countyMap.values())
    .map((county) => {
      const water = county.water || 0;
      const waste = county.waste || 0;
      const avgScore = (water && waste) ? (water + waste) / 2 : (water || waste || 0);
      
      return {
        county: county.name,
        water: Math.round(water * 10) / 10,
        wasteMgt: Math.round(waste * 10) / 10,
        avgScore: Math.round(avgScore * 10) / 10,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore)
    .map((county, index) => ({
      ...county,
      rank: index + 1,
      performance: county.avgScore >= 75 ? 'Outstanding' :
                   county.avgScore >= 60 ? 'Satisfactory' :
                   county.avgScore >= 45 ? 'Good' :
                   county.avgScore >= 30 ? 'Average' : 'Poor',
    }));

  return rankings;
}

export async function getCountyPerformance(
  countyName: string,
  year: number = new Date().getFullYear()
): Promise<any> {
  // First get county ID
  const { data: county, error: countyError } = await supabase
    .from('counties')
    .select('id, name')
    .ilike('name', countyName)
    .single();

  if (countyError || !county) {
    throw new Error('County not found');
  }

  // Get performance data
  const { data: performance, error: perfError } = await supabase
    .from('county_performance')
    .select('*')
    .eq('county_id', county.id)
    .eq('year', year);

  if (perfError) throw perfError;

  const water = performance?.find((p: any) => p.sector === 'water') || {};
  const waste = performance?.find((p: any) => p.sector === 'waste') || {};

  return {
    county: county.name,
    year,
    overallScore: Number(
      ((water.overall_score || 0) + (waste.overall_score || 0)) /
      (water.overall_score && waste.overall_score ? 2 : 1) || 0
    ).toFixed(1),
    waterScore: Number(water.sector_score || 0).toFixed(1),
    wasteScore: Number(waste.sector_score || 0).toFixed(1),
    indicators: {
      governance: Number(
        ((water.governance || 0) + (waste.governance || 0)) /
        (water.governance && waste.governance ? 2 : 1) || 0
      ).toFixed(1),
      mrv: Number(
        ((water.mrv || 0) + (waste.mrv || 0)) /
        (water.mrv && waste.mrv ? 2 : 1) || 0
      ).toFixed(1),
      mitigation: Number(
        ((water.mitigation || 0) + (waste.mitigation || 0)) /
        (water.mitigation && waste.mitigation ? 2 : 1) || 0
      ).toFixed(1),
      adaptation: Number(
        ((water.adaptation || 0) + (waste.adaptation || 0)) /
        (water.adaptation && waste.adaptation ? 2 : 1) || 0
      ).toFixed(1),
      finance: Number(
        ((water.finance || 0) + (waste.finance || 0)) /
        (water.finance && waste.finance ? 2 : 1) || 0
      ).toFixed(1),
    },
    waterIndicators: water.indicators_json || [],
    wasteIndicators: waste.indicators_json || [],
  };
}

export async function getCountyPerformanceByCountyId(
  countyId: number,
  year: number,
  sector: 'water' | 'waste'
): Promise<CountyPerformance | null> {
  const { data, error } = await supabase
    .from('county_performance')
    .select('*')
    .eq('county_id', countyId)
    .eq('year', year)
    .eq('sector', sector)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching county performance:', error);
    throw error;
  }

  return data;
}

/**
 * Check if a county has both water and waste scores for a given year
 * and automatically update status to 'published' if both exist
 */
export async function checkAndUpdateCountyStatus(
  countyId: number,
  year: number
): Promise<void> {
  try {
    // Check if both water and waste performance records exist
    const { data: performanceData, error } = await supabase
      .from('county_performance')
      .select('sector, sector_score')
      .eq('county_id', countyId)
      .eq('year', year)
      .in('sector', ['water', 'waste']);

    if (error) {
      console.error('Error checking county performance:', error);
      return; // Don't throw, just log and continue
    }

    // Check if both sectors have data (sector_score is not null)
    const hasWater = performanceData?.some(
      (p: any) => p.sector === 'water' && p.sector_score != null
    );
    const hasWaste = performanceData?.some(
      (p: any) => p.sector === 'waste' && p.sector_score != null
    );

    // If both sectors have scores, update status to 'published'
    if (hasWater && hasWaste) {
      const { error: updateError } = await supabase
        .from('counties')
        .update({ status: 'published' })
        .eq('id', countyId);

      if (updateError) {
        console.error('Error updating county status:', updateError);
      } else {
        console.log(`County ${countyId} status updated to 'published' (both sectors complete)`);
      }
    }
  } catch (err) {
    console.error('Error in checkAndUpdateCountyStatus:', err);
    // Don't throw - this is a background operation
  }
}

export async function saveCountyPerformance(
  countyId: number,
  year: number,
  sector: 'water' | 'waste',
  performanceData: {
    overall_score: number;
    sector_score: number;
    governance: number;
    mrv: number;
    mitigation: number;
    adaptation: number;
    finance: number;
    indicators_json?: any;
  }
): Promise<void> {
  try {
    // Validate inputs
    if (!countyId || !year || !sector) {
      throw new Error('Missing required fields: countyId, year, or sector');
    }

    if (!['water', 'waste'].includes(sector)) {
      throw new Error(`Invalid sector: ${sector}. Must be 'water' or 'waste'`);
    }

    const payload = {
      county_id: countyId,
      year: Number(year),
      sector,
      overall_score: Number(performanceData.overall_score) || 0,
      sector_score: Number(performanceData.sector_score) || 0,
      governance: Number(performanceData.governance) || 0,
      mrv: Number(performanceData.mrv) || 0,
      mitigation: Number(performanceData.mitigation) || 0,
      adaptation: Number(performanceData.adaptation) || 0,
      finance: Number(performanceData.finance) || 0,
      indicators_json: performanceData.indicators_json || null,
    };

    console.log('Saving county performance:', payload);

    const { data, error } = await supabase
      .from('county_performance')
      .upsert(payload, {
        onConflict: 'county_id,year,sector'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error saving county performance:', error);
      throw error;
    }

    console.log('Successfully saved county performance:', data);

    // After successfully saving, check if both sectors are complete
    // and automatically update status to 'published' if so
    await checkAndUpdateCountyStatus(countyId, year);
  } catch (err: any) {
    console.error('Error in saveCountyPerformance:', err);
    throw err;
  }
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export interface DashboardStats {
  totalCounties: number;
  totalThematicAreas: number;
  totalPublications: number;
  countiesWithData: number;
  avgWaterScore: number;
  avgWasteScore: number;
  overallAvgScore: number;
  topCounty: {
    name: string;
    score: number;
    sector: string;
  } | null;
}

export async function getDashboardStats(year: number = new Date().getFullYear()): Promise<DashboardStats> {
  // Get counts
  const [countiesResult, thematicResult, publicationsResult] = await Promise.all([
    supabase.from('counties').select('id', { count: 'exact', head: true }),
    supabase.from('thematic_areas').select('id', { count: 'exact', head: true }),
    supabase.from('publications').select('id', { count: 'exact', head: true }),
  ]);

  // Get performance stats with county names
  const { data: performanceData, error: perfError } = await supabase
    .from('county_performance')
    .select(`
      sector,
      sector_score,
      county_id,
      counties(name)
    `)
    .eq('year', year);

  if (perfError) throw perfError;

  // Calculate averages
  const waterScores = (performanceData || [])
    .filter((p: any) => p.sector === 'water' && p.sector_score != null)
    .map((p: any) => p.sector_score);
  
  const wasteScores = (performanceData || [])
    .filter((p: any) => p.sector === 'waste' && p.sector_score != null)
    .map((p: any) => p.sector_score);

  const avgWaterScore = waterScores.length > 0
    ? waterScores.reduce((a, b) => a + b, 0) / waterScores.length
    : 0;

  const avgWasteScore = wasteScores.length > 0
    ? wasteScores.reduce((a, b) => a + b, 0) / wasteScores.length
    : 0;

  const overallAvgScore = (avgWaterScore + avgWasteScore) / (avgWaterScore && avgWasteScore ? 2 : 1);

  // Find top county
  const allScores = (performanceData || [])
    .filter((p: any) => p.sector_score != null)
    .map((p: any) => ({
      name: p.counties?.name || 'Unknown',
      score: p.sector_score,
      sector: p.sector,
    }))
    .sort((a, b) => b.score - a.score);

  const topCounty = allScores.length > 0 ? allScores[0] : null;

  // Count unique counties with data
  const countiesWithData = new Set(
    (performanceData || [])
      .filter((p: any) => p.counties?.name)
      .map((p: any) => p.counties.name)
  ).size;

  return {
    totalCounties: countiesResult.count || 0,
    totalThematicAreas: thematicResult.count || 0,
    totalPublications: publicationsResult.count || 0,
    countiesWithData,
    avgWaterScore: Math.round(avgWaterScore * 10) / 10,
    avgWasteScore: Math.round(avgWasteScore * 10) / 10,
    overallAvgScore: Math.round(overallAvgScore * 10) / 10,
    topCounty,
  };
}

// ============================================================================
// INDICATORS
// ============================================================================

export interface Indicator {
  id: number;
  sector: 'water' | 'waste';
  thematic_area: string;
  indicator_text: string;
  description?: string | null;
  weight: number;
  created_at?: string;
  updated_at?: string;
}

export async function listIndicators(): Promise<Indicator[]> {
  try {
    const { data, error } = await supabase
      .from('indicators')
      .select('*')
      .order('sector')
      .order('thematic_area')
      .order('id');

    if (error) {
      console.error('Error fetching indicators:', error);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('listIndicators failed:', err);
    throw err;
  }
}

export async function createIndicator(payload: {
  sector: 'water' | 'waste';
  thematic_area: string;
  indicator_text: string;
  description?: string;
  weight?: number;
}): Promise<Indicator> {
  const { data, error } = await supabase
    .from('indicators')
    .insert({
      sector: payload.sector,
      thematic_area: payload.thematic_area,
      indicator_text: payload.indicator_text,
      description: payload.description || null,
      weight: payload.weight || 10,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIndicator(
  id: number,
  payload: {
    sector?: 'water' | 'waste';
    thematic_area?: string;
    indicator_text?: string;
    description?: string;
    weight?: number;
  }
): Promise<Indicator> {
  const { data, error } = await supabase
    .from('indicators')
    .update({
      sector: payload.sector,
      thematic_area: payload.thematic_area,
      indicator_text: payload.indicator_text,
      description: payload.description !== undefined ? payload.description : undefined,
      weight: payload.weight,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIndicator(id: number): Promise<void> {
  const { error } = await supabase
    .from('indicators')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

