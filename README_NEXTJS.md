# Next.js Migration - Setup Instructions

## Environment Variables

Next.js uses `NEXT_PUBLIC_` prefix for client-side environment variables (instead of `VITE_`).

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
```

**Note:** The Supabase client has been updated to support both `VITE_` and `NEXT_PUBLIC_` prefixes during migration, but you should use `NEXT_PUBLIC_` for Next.js.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000` (Next.js default port).

## Building for Production

```bash
npm run build
npm start
```

## Migration Notes

- All routes have been migrated to Next.js App Router
- All components preserved with minimal changes
- Only routing and navigation patterns changed
- Visual design and functionality remain 100% identical

See `MIGRATION.md` for detailed migration information.
