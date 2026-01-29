// const baseUrl = "http://localhost:9000";
const baseUrl = "https://api.yayasanpusakakai.org";

export interface Gallery {
  id: number;
  s3Path: string | null;
  caption: string | null;
  regionId: number | null;
  regionName: string | null;
  categories: Category[];
  region: Region | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Region {
  id: number;
  name: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  pagination?: PaginationInfo;
}

export interface PaginatedGalleriesResponse {
  data: Gallery[];
  pagination: PaginationInfo;
}

// Fetch galleries with pagination (public endpoint - no auth required)
export async function fetchGalleriesPaginated(
  page: number = 1,
  limit: number = 30,
  categoryId?: number,
  regionId?: number
): Promise<PaginatedGalleriesResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (categoryId) {
      params.append('categoryId', categoryId.toString());
    }

    if (regionId) {
      params.append('regionId', regionId.toString());
    }

    const response = await fetch(`${baseUrl}/api/galleries/paginated?${params}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch galleries: ${response.statusText}`);
    }

    const result: ApiResponse<Gallery[]> = await response.json();
    
    return {
      data: result.data,
      pagination: result.pagination || {
        page,
        limit,
        total: result.data.length,
        totalPages: 1,
        hasMore: false,
      },
    };
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }
}

// Fetch all galleries (public endpoint - no auth required)
export async function fetchGalleries(): Promise<Gallery[]> {
  try {
    const response = await fetch(`${baseUrl}/api/galleries`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch galleries: ${response.statusText}`);
    }

    const result: ApiResponse<Gallery[]> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return [];
  }
}

// Fetch all categories (public endpoint - no auth required)
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${baseUrl}/api/galleries/categories/all`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const result: ApiResponse<Category[]> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Fetch all regions (public endpoint - no auth required)
export async function fetchRegions(): Promise<Region[]> {
  try {
    const response = await fetch(`${baseUrl}/api/regions`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch regions: ${response.statusText}`);
    }

    const result: ApiResponse<{ regionId: number; regionName: string }[]> = await response.json();
    // Map backend response (regionId, regionName) to frontend format (id, name)
    return result.data.map((region) => ({
      id: region.regionId,
      name: region.regionName,
    }));
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
}