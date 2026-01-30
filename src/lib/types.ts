export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Region {
  id: number;
  name: string;
}

export interface Image {
  id: number;
  s3Path: string | null;
  caption: string | null;
  regionId: number | null;
  regionName: string | null;
  galleryDate: string | null;
  categories: Category[];
  region: Region | null;
  createdAt: string;
  updatedAt: string;
}

// Helper function to convert API Gallery to Image type
export function galleryToImage(gallery: Image): Image {
  return gallery;
}

// Helper function to get category IDs from gallery
export function getCategoryIds(gallery: Image): number[] {
  return gallery.categories.map((cat) => cat.id);
}