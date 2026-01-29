# CitraPusaka - Gallery Integration

This document explains how CitraPusaka consumes galleries and categories from the NayaPusaka backend API.

## Overview

CitraPusaka is a public-facing gallery website that displays images and categories managed through the Sipusaka admin panel. The data is fetched from the NayaPusaka backend API using **server-side pagination** for optimal performance.

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   CitraPusaka   │         │   NayaPusaka    │         │     S3 Bucket   │
│   (Frontend)    │────────▶│   (Backend)     │────────▶│   (Storage)     │
│   Next.js       │         │   Express.js    │         │   AWS S3        │
│                 │         │   Pagination    │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## API Endpoints

### Galleries

#### GET All Galleries (No Pagination)
- **Endpoint**: `GET /api/galleries`
- **Auth**: Public (no auth required)
- **Use Case**: Admin panel, when all galleries are needed at once

#### GET Galleries with Pagination
- **Endpoint**: `GET /api/galleries/paginated`
- **Auth**: Public (no auth required)
- **Query Parameters**:
  - `page` (optional, default: 1) - Page number
  - `limit` (optional, default: 30) - Items per page
  - `categoryId` (optional) - Filter by category ID
- **Response**:
  ```json
  {
    "message": "Berhasil mendapatkan data galeri",
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 30,
      "total": 150,
      "totalPages": 5,
      "hasMore": true
    }
  }
  ```
- **Use Case**: Public gallery view with infinite scroll

#### GET Single Gallery
- **Endpoint**: `GET /api/galleries/:id`
- **Auth**: Public (no auth required)

### Categories

#### GET All Categories
- **Endpoint**: `GET /api/galleries/categories/all`
- **Auth**: Public (no auth required)

#### GET Single Category
- **Endpoint**: `GET /api/galleries/categories/:id`
- **Auth**: Public (no auth required)

## Data Flow with Pagination

1. **Initial Load**: CitraPusaka fetches page 1 (30 items) from `/api/galleries/paginated`
2. **User Scrolls**: Intersection Observer detects when user reaches bottom
3. **Load More**: CitraPusaka fetches next page (page 2, 3, etc.)
4. **Append Data**: New items are appended to existing list
5. **Stop Loading**: When `hasMore` is false, no more pages are fetched

### Benefits of Server-Side Pagination

- **Faster Initial Load**: Only 30 items fetched instead of all galleries
- **Reduced Bandwidth**: Only displayed content is transferred
- **Better Performance**: Less data to process on client side
- **Scalability**: Works efficiently with thousands of galleries
- **Database Optimization**: Server queries only the needed data

## Files Modified

### Backend (NayaPusaka)

1. **`nayapusaka/src/services/gallery.services.ts`**
   - Added [`selectGalleriesPaginated()`](nayapusaka/src/services/gallery.services.ts:28-73) function
   - Supports pagination with `page`, `limit`, and `categoryId` parameters
   - Returns both data and pagination metadata

2. **`nayapusaka/src/controllers/gallery.controller.ts`**
   - Added [`getGalleriesPaginated()`](nayapusaka/src/controllers/gallery.controller.ts:66-113) controller
   - Handles query parameters for pagination
   - Generates presigned S3 URLs for each gallery

3. **`nayapusaka/src/routes/gallery.router.ts`**
   - Added route: `GET /api/galleries/paginated`
   - Placed in public section (no auth required)

### Frontend (CitraPusaka)

1. **`citrapusaka/src/lib/api.ts`**
   - Added [`fetchGalleriesPaginated()`](citrapusaka/src/lib/api.ts:33-70) function
   - Accepts `page`, `limit`, and `categoryId` parameters
   - Returns both data and pagination info

2. **`citrapusaka/src/app/page.tsx`**
   - Implemented infinite scroll with Intersection Observer
   - Fetches data page by page as user scrolls
   - Resets pagination when category changes
   - Shows loading indicator and "all loaded" message

3. **Other Files** (from previous integration):
   - `citrapusaka/src/lib/types.ts` - Type definitions
   - `citrapusaka/src/components/CategoryNav.tsx` - Category navigation
   - `citrapusaka/src/components/MasonryGrid.tsx` - Masonry grid with lastImageRef
   - `citrapusaka/next.config.ts` - Image optimization config

## Configuration

### API Base URL

The API base URL is configured in `citrapusaka/src/lib/api.ts`:

```typescript
const baseUrl = "http://localhost:9000";
```

For production, update this to your production API URL:

```typescript
const baseUrl = "https://api.yayasanpusakakai.org";
```

### Pagination Settings

Default pagination settings in CitraPusaka:

```typescript
const ITEMS_PER_PAGE = 30;
```

You can adjust this value based on your needs:
- **Smaller (10-20)**: Faster initial load, more API calls
- **Larger (50-100)**: Fewer API calls, slower initial load

## Usage

### Running the Application

1. **Start the NayaPusaka backend** (port 9000):
   ```bash
   cd nayapusaka
   npm run dev
   ```

2. **Start the CitraPusaka frontend** (port 3000):
   ```bash
   cd citrapusaka
   npm run dev
   ```

3. **Access the application**:
   - CitraPusaka: http://localhost:3000
   - NayaPusaka API: http://localhost:9000

### Testing Pagination

1. Open browser DevTools → Network tab
2. Navigate to CitraPusaka
3. Scroll down to trigger infinite scroll
4. Observe API calls:
   - First call: `/api/galleries/paginated?page=1&limit=30`
   - Second call: `/api/galleries/paginated?page=2&limit=30`
   - And so on...

### Filtering by Category

When a category is selected, the API call includes the `categoryId` parameter:

```
/api/galleries/paginated?page=1&limit=30&categoryId=5
```

This filters galleries to only those in the selected category.

## Performance Optimization

### Database Queries

The pagination uses Prisma's efficient querying:
```typescript
const [galleries, total] = await Promise.all([
  prisma.gallery.findMany({
    skip,
    take: limit,
    // ...
  }),
  prisma.gallery.count({ where }),
]);
```

This fetches both data and count in parallel for optimal performance.

### Client-Side Optimization

- **Intersection Observer**: Efficient scroll detection without polling
- **Debouncing**: Prevents rapid API calls during fast scrolling
- **Caching**: Categories are cached (fetched once on mount)
- **Lazy Loading**: Only loads images as they come into view

## Error Handling

The API client includes robust error handling:

```typescript
try {
  const result = await fetchGalleriesPaginated(page, limit, categoryId);
  // Use result
} catch (error) {
  console.error('Error fetching galleries:', error);
  // Return empty data with pagination info
  return {
    data: [],
    pagination: { ... },
  };
}
```

If the API is unavailable, the application gracefully handles errors and shows empty states.

## Troubleshooting

### Images Not Loading

- Check that the NayaPusaka backend is running
- Verify S3 presigned URLs are being generated correctly
- Check browser console for CORS errors
- Ensure S3 bucket has proper CORS configuration

### Pagination Not Working

- Verify the `/api/galleries/paginated` endpoint is accessible
- Check that `hasMore` is correctly set in the response
- Ensure Intersection Observer is properly configured
- Check browser console for JavaScript errors

### Categories Not Showing

- Verify categories exist in the database
- Check the API endpoint `/api/galleries/categories/all`
- Ensure the backend is running and accessible

### Slow Loading

- Reduce `ITEMS_PER_PAGE` for faster initial load
- Check database query performance
- Ensure proper indexing on database tables
- Consider implementing Redis caching for frequently accessed data

## Future Enhancements

Potential improvements:

1. **Caching**: Implement Redis caching for gallery pages
2. **Prefetching**: Prefetch next page before user reaches bottom
3. **Virtual Scrolling**: Implement virtual scrolling for very large lists
4. **Search**: Add search functionality with pagination
5. **Filters**: Add more filtering options (date range, etc.)
6. **Image Optimization**: Add client-side image optimization
7. **Error Boundaries**: Add React error boundaries for better error handling
8. **Loading Skeletons**: Add skeleton loaders for better UX

## Related Projects

- **NayaPusaka**: Backend API (Express.js + Prisma + PostgreSQL)
- **Sipusaka**: Admin panel (Next.js + Ant Design)
- **CitraPusaka**: Public gallery (Next.js + Tailwind CSS)
- **GeoPusaka**: Geographic visualization (Next.js + Leaflet)

## API Response Examples

### Paginated Galleries Response

```json
{
  "message": "Berhasil mendapatkan data galeri",
  "data": [
    {
      "id": 1,
      "s3Path": "https://...",
      "caption": "Kegiatan anak-anak",
      "categories": [
        {
          "id": 1,
          "name": "Kegiatan Anak",
          "slug": "kegiatan-anak"
        }
      ],
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 150,
    "totalPages": 5,
    "hasMore": true
  }
}
```

### Categories Response

```json
{
  "message": "Berhasil mendapatkan data kategori",
  "data": [
    {
      "id": 1,
      "name": "Kegiatan Anak",
      "slug": "kegiatan-anak"
    }
  ]
}