# Application Architecture - Layer-by-Layer Breakdown

This document explains how each layer of the CAD/3D Design Generation application works.

## Overview

This is a React-based web application that generates 3D designs (STL files) from user descriptions using AI and parametric geometry generation. The application follows a layered architecture with clear separation of concerns.

---

## Layer 1: Entry Point & Application Bootstrap

### Files
- `src/main.tsx` - React application entry point
- `src/App.tsx` - Root component with routing and providers

### How It Works

**main.tsx:**
- Mounts the React application to the DOM root element
- Imports global CSS styles
- Minimal entry point that delegates to `App.tsx`

**App.tsx:**
- **QueryClientProvider**: Wraps the app with React Query for data fetching and caching
- **TooltipProvider**: Provides tooltip context for UI components
- **BrowserRouter**: Sets up client-side routing
- **Routes**: Defines three routes:
  - `/` → `Index` page (landing/generation form)
  - `/generate` → `Generate` page (3D preview and results)
  - `*` → `NotFound` page (catch-all)

### Data Flow
```
User → Browser → main.tsx → App.tsx → Router → Page Component
```

---

## Layer 2: Presentation Layer (UI Components)

### Structure
```
src/components/
├── ui/              # shadcn/ui base components (buttons, inputs, etc.)
├── HeroSection.tsx   # Landing page with form
├── ModelViewer.tsx   # 3D canvas viewer
├── DocumentationPanel.tsx  # Markdown documentation display
├── DownloadPanel.tsx  # File download controls
└── [Other components]
```

### Key Components

#### HeroSection.tsx
**Purpose**: Landing page with design input form

**How it works:**
1. Collects user input:
   - Text prompt (design description)
   - Product type (enclosure, bracket, mount, etc.)
   - Use case (prototype, manufacturing, concept)
   - Complexity level (low, medium, high)
2. Validates input (ensures prompt is not empty)
3. Navigates to `/generate` with form data in React Router state
4. Uses Framer Motion for animations
5. Custom "cyberpunk" styled components (CyberInput, CyberSelect, CyberButton)

**Data Flow:**
```
User Input → Form State → Validation → Navigation with State
```

#### ModelViewer.tsx
**Purpose**: 3D visualization of generated geometry

**How it works:**
1. Uses **React Three Fiber** (`@react-three/fiber`) - React renderer for Three.js
2. Uses **@react-three/drei** for helpers (OrbitControls, Grid, etc.)
3. Renders geometry as a mesh with:
   - Standard material (metallic, semi-rough)
   - Edge lines overlay (cyan wireframe)
   - Automatic rotation animation
4. Interactive controls:
   - OrbitControls: drag to rotate, scroll to zoom, shift+drag to pan
5. Custom lighting setup (ambient + directional + point lights with neon colors)
6. Grid floor for spatial reference

**Rendering Pipeline:**
```
THREE.BufferGeometry → Mesh → Material → Scene → Camera → Canvas
```

#### DocumentationPanel.tsx
**Purpose**: Displays engineering documentation

**How it works:**
1. Receives markdown string as prop
2. Uses `react-markdown` to render markdown to HTML
3. Styled with Tailwind prose classes
4. Copy-to-clipboard functionality
5. Loading skeleton state while generating

#### DownloadPanel.tsx
**Purpose**: Provides download buttons for generated files

**How it works:**
1. Creates Blob URLs for:
   - STL file (3D model)
   - Markdown file (documentation)
   - PNG image (canvas render capture)
2. Triggers browser download via temporary `<a>` element
3. Cleans up Blob URLs after download

---

## Layer 3: Page Components (Route Handlers)

### Files
- `src/pages/Index.tsx` - Landing page
- `src/pages/Generate.tsx` - Generation workflow page
- `src/pages/NotFound.tsx` - 404 handler

### Index.tsx
**Purpose**: Simple wrapper that renders HeroSection

### Generate.tsx
**Purpose**: Orchestrates the entire design generation workflow

**How it works:**

1. **Initialization:**
   - Reads form data from React Router location state
   - Redirects to home if no form data exists

2. **Generation Pipeline (useEffect hook):**
   ```
   Step 1: Analyze with AI (10% progress)
   ├─ Calls Supabase Edge Function 'generate-design'
   ├─ Sends: prompt, productType, useCase, complexity
   └─ Returns: template, params, documentation
   
   Step 2: Select Template (30% progress)
   ├─ Uses AI-selected template or falls back to productType
   └─ Merges AI params with defaults
   
   Step 3: Generate Geometry (50% progress)
   ├─ Calls generateGeometry() from stlGenerator.ts
   ├─ Creates THREE.BufferGeometry
   └─ Stores in component state
   
   Step 4: Create STL Blob (70% progress)
   ├─ Converts geometry to STL string
   └─ Creates Blob for download
   
   Step 5: Documentation (70% progress)
   ├─ Uses AI-generated docs or fallback generator
   └─ Stores markdown string
   
   Step 6: Render Preview (90% progress)
   └─ Geometry ready for ModelViewer
   
   Step 7: Complete (100% progress)
   └─ All assets ready
   ```

3. **Error Handling:**
   - Falls back to local generation if AI fails
   - Uses default parameters if AI response is invalid
   - Shows toast notifications for errors

4. **State Management:**
   - `isGenerating`: Boolean flag for loading state
   - `status`: Current step description
   - `progress`: 0-100 progress value
   - `geometry`: THREE.BufferGeometry for 3D viewer
   - `stlBlob`: Blob for STL download
   - `markdown`: Documentation string
   - `generationParams`: Parameters used for generation

5. **User Actions:**
   - Regenerate: Reloads page to restart generation
   - Capture Render: Exports canvas as PNG

**Data Flow:**
```
Form Data → AI Analysis → Template Selection → Geometry Generation → STL Export → UI Display
```

---

## Layer 4: Business Logic Layer

### Files
- `src/lib/stlGenerator.ts` - Parametric geometry generation

### stlGenerator.ts
**Purpose**: Generates 3D geometries and converts them to STL format

**How it works:**

1. **Template System:**
   - Supports 6 template types: `enclosure`, `bracket`, `mount`, `plate`, `handle`, `connector`
   - Each template has specific parameter interface

2. **Geometry Generation Functions:**
   - `generateBoxEnclosure()`: Creates hollow box with optional mounting posts
   - `generateBracket()`: Creates L-shaped bracket with holes
   - `generateCylinderMount()`: Creates cylindrical mount with optional tabs
   - `generatePlate()`: Creates flat plate with optional rounded corners and hole grid
   - `generateHandle()`: Creates curved handle with mounting bases
   - Default: Simple box for connector type

3. **Geometry Merging:**
   - `mergeGeometries()`: Combines multiple BufferGeometries into one
   - Merges position and normal attributes
   - Computes vertex normals for proper lighting

4. **STL Export:**
   - `geometryToSTL()`: Converts THREE.BufferGeometry to ASCII STL format
   - Processes indexed or non-indexed geometries
   - Calculates face normals from vertex positions
   - Outputs valid STL file format:
     ```
     solid ForgeAI_Design
       facet normal x y z
         outer loop
           vertex x y z
           vertex x y z
           vertex x y z
         endloop
       endfacet
       ...
     endsolid ForgeAI_Design
     ```
   - `createSTLBlob()`: Wraps STL string in Blob for download

5. **Main Function:**
   - `generateGeometry()`: Router function that selects template and calls appropriate generator
   - Uses default parameters if not provided
   - Returns THREE.BufferGeometry ready for rendering

**Limitations:**
- No true CSG (Constructive Solid Geometry) - can't subtract inner cavities properly
- Simple geometry merging (doesn't handle complex boolean operations)
- Mounting holes are represented as posts, not actual holes

---

## Layer 5: Integration Layer (Backend Services)

### Files
- `src/integrations/supabase/client.ts` - Supabase client
- `supabase/functions/generate-design/index.ts` - Edge function

### Supabase Client (client.ts)
**Purpose**: Provides authenticated Supabase client instance

**How it works:**
1. Reads environment variables:
   - `VITE_SUPABASE_URL`: Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Public API key
2. Creates Supabase client with:
   - LocalStorage for auth persistence
   - Auto token refresh
   - TypeScript types from `types.ts`

**Usage:**
```typescript
import { supabase } from '@/integrations/supabase/client';
const { data, error } = await supabase.functions.invoke('function-name', { body: {...} });
```

### Edge Function (generate-design/index.ts)
**Purpose**: AI-powered design analysis and template selection

**How it works:**

1. **Request Handling:**
   - Handles CORS preflight (OPTIONS requests)
   - Parses JSON body: `{ prompt, productType, useCase, complexity }`

2. **AI Integration:**
   - Uses Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`)
   - Model: `google/gemini-3-flash-preview`
   - System prompt instructs AI to return JSON with:
     - `template`: One of the 6 template types
     - `params`: Template-specific parameters
     - `documentation`: Markdown engineering report
   - User prompt includes all form data

3. **Response Processing:**
   - Extracts JSON from AI response (handles code blocks or raw JSON)
   - Falls back to using content as documentation if JSON parsing fails
   - Returns structured response:
     ```json
     {
       "template": "enclosure",
       "params": { ... },
       "documentation": "# Design Report\n..."
     }
     ```

4. **Error Handling:**
   - Returns 500 error with message if AI call fails
   - Logs errors to console

**Environment:**
- Runs on Deno runtime (Supabase Edge Functions)
- Requires `LOVABLE_API_KEY` environment variable

**Data Flow:**
```
Frontend → Supabase Client → Edge Function → AI Gateway → Response Parsing → Frontend
```

---

## Layer 6: Styling & Theming

### Files
- `src/index.css` - Global styles
- `tailwind.config.ts` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

### How It Works

1. **Tailwind CSS:**
   - Utility-first CSS framework
   - Custom theme with cyberpunk aesthetic:
     - Neon colors (cyan, magenta, purple)
     - Dark backgrounds
     - Grid patterns
     - Scanline effects
   - Custom animations (neon-glow, neon-pulse)

2. **shadcn/ui:**
   - Component library built on Radix UI primitives
   - Accessible, customizable components
   - Located in `src/components/ui/`

3. **Framer Motion:**
   - Animation library for React
   - Used for page transitions and component animations

4. **Custom Components:**
   - CyberButton, CyberInput, CyberSelect: Custom styled components with cyberpunk theme
   - ParticleField: Animated background effect

---

## Layer 7: Build & Development Tools

### Files
- `vite.config.ts` - Vite build configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

### Vite Configuration
**Purpose**: Modern build tool and dev server

**Features:**
- React plugin with SWC (fast compilation)
- Path alias: `@` → `./src`
- Dev server on port 8080
- HMR (Hot Module Replacement) for fast development
- Component tagger plugin (Lovable) in development mode

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Production build
- `npm run preview`: Preview production build
- `npm test`: Run tests (Vitest)

---

## Data Flow Summary

### Complete User Journey

```
1. User lands on Index page
   ↓
2. Fills out form in HeroSection
   ↓
3. Clicks "Generate Design"
   ↓
4. Navigates to /generate with form data
   ↓
5. Generate page starts workflow:
   a. Calls Supabase Edge Function
      ↓
   b. Edge Function calls AI Gateway
      ↓
   c. AI returns template + params + docs
      ↓
   d. Frontend calls generateGeometry()
      ↓
   e. Creates THREE.BufferGeometry
      ↓
   f. Converts to STL Blob
      ↓
   g. Displays in ModelViewer
      ↓
   h. Shows documentation in panel
      ↓
   i. Enables download buttons
```

### State Management

- **Local Component State**: React useState hooks
- **Route State**: React Router location state
- **Global State**: React Query (though not heavily used currently)
- **No Redux/Zustand**: Simple state management is sufficient

---

## Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 18 | Component-based UI |
| Routing | React Router v6 | Client-side routing |
| 3D Rendering | Three.js + React Three Fiber | 3D visualization |
| Styling | Tailwind CSS | Utility-first styling |
| Components | shadcn/ui + Radix UI | Accessible UI primitives |
| Animations | Framer Motion | Smooth transitions |
| Backend | Supabase Edge Functions | Serverless functions |
| AI | Lovable AI Gateway | Design analysis |
| Build Tool | Vite | Fast dev server & bundler |
| Type Safety | TypeScript | Type checking |
| Testing | Vitest | Unit testing |

---

## Architecture Patterns

1. **Component Composition**: Small, reusable components
2. **Separation of Concerns**: UI, business logic, and integrations separated
3. **Progressive Enhancement**: Works without AI (fallback generation)
4. **Error Boundaries**: Graceful degradation on errors
5. **Type Safety**: Full TypeScript coverage
6. **Serverless**: Edge functions for backend logic

---

## Future Improvements

1. **True CSG**: Implement proper boolean operations for geometry
2. **Database**: Store generated designs in Supabase
3. **User Accounts**: Authentication for saving designs
4. **Design History**: View and regenerate previous designs
5. **Advanced Templates**: More parametric options
6. **Real-time Collaboration**: Share designs with others
7. **Export Formats**: Support OBJ, PLY, etc.
