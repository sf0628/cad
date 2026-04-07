# Text_to_CAD - AI-Native Engineering Design Tool

## Vision

A cyberpunk-themed generative design playground where engineers and makers transform ideas into downloadable 3D models and documentation with minimal friction.

---

## Core Experience

### Landing Page

- **Full-screen dark cyberpunk hero** with subtle grid/scanline overlays and neon glow effects
- **Central glowing input field** for the engineering prompt (e.g., "A ventilated electronics enclosure for a Raspberry Pi")
- **Three styled dropdowns** below the input:
  - **Product Type**: Enclosure, Bracket, Mount, Connector, Handle, Custom Primitive
  - **Use Case**: Prototype, Manufacturing, Concept Art
  - **Complexity**: Low (simple geometry) / Medium (multi-feature) / High (detailed)
- **Animated "GENERATE DESIGN" CTA** with neon pulse effect

---

## Generation Flow

### Step 1: User Input

- Natural language description of the desired part
- Structured selections from dropdowns
- Optional dimension hints (e.g., "100mm x 60mm x 30mm")

### Step 2: Loading Experience

- Cyberpunk-styled progress indicator
- Streaming status updates ("Analyzing requirements...", "Generating geometry...", "Rendering preview...")
- Subtle particle/glitch animations

### Step 3: Results Display

Split-screen results page:

**Left Panel - Interactive 3D Viewer**

- Three.js-powered STL renderer
- Orbit controls (rotate, zoom, pan)
- Cyberpunk lighting (rim lights, subtle bloom)
- Grid floor with neon accents
- Dimension overlays on hover

**Right Panel - Documentation Preview**

- Rendered Markdown report
- Collapsible sections
- Copy-to-clipboard functionality

### Step 4: Downloads

- **Download STL** - Valid parametric geometry file
- **Download Report (MD)** - Full engineering documentation
- **Download Render (PNG)** - Screenshot of 3D view with styling

---

## Parametric Template System

### How It Works

1. AI analyzes the user's prompt and selects appropriate base template
2. AI extracts/infers parameters (dimensions, features, counts)
3. System generates STL using parametric geometry functions
4. Each template has configurable features (holes, vents, fillets, etc.)

### Initial Templates

- **Box Enclosure** - Configurable walls, lid type, vent patterns, mounting holes
- **L-Bracket** - Variable arm lengths, hole patterns, thickness
- **Cylinder Mount** - Inner/outer diameter, mounting tabs, height
- **Flat Plate** - Grid of holes, cutouts, edge profiles
- **Handle/Grip** - Ergonomic curve, mounting points, grip texture

---

## AI-Generated Documentation

The Markdown report includes:

- **Title & Overview** - What was generated and why
- **Design Specifications** - Exact dimensions, tolerances, wall thicknesses
- **Material Recommendations** - Based on use case (PLA for prototypes, ABS for production)
- **Manufacturing Notes** - Print orientation, support requirements, post-processing
- **Design Rationale** - Why certain decisions were made
- **Potential Improvements** - Suggested iterations

---

## Visual Design System

### Color Palette

- **Background**: Deep black (#0a0a0f) with subtle purple undertones
- **Primary Neon**: Cyan (#00f0ff)
- **Secondary Neon**: Magenta (#ff00aa)
- **Accent**: Electric purple (#9d00ff)
- **Text**: Soft white (#e0e0e8) with glow effects

### Typography

- Monospace headers for tech aesthetic
- Clean sans-serif body text
- Glowing text effects on interactive elements

### Visual Effects

- Subtle scanline overlay
- Grid background pattern
- Neon glow on hover states
- Smooth micro-animations throughout
- Particle effects on generation

---

## Technical Architecture

### Frontend

- React + TypeScript + Vite
- TailwindCSS with custom cyberpunk theme
- shadcn/ui components (styled to match aesthetic)
- React Three Fiber for 3D viewer
- Framer Motion for animations

### Backend (Lovable Cloud)

- **Edge Function: generate-design** - AI orchestration for parameters + documentation
- **Edge Function: generate-stl** - Parametric geometry generation
- Temporary file storage for downloads
- Lovable AI integration (Gemini) for prompt understanding

### AI Pipeline

1. User prompt → Lovable AI → Template selection + parameters
2. Parameters → STL generator → Binary file
3. Prompt + parameters → Lovable AI → Markdown documentation

---

## Pages & Routes

1. **/** - Landing page with hero input
2. **/generate** - Results page with 3D viewer + downloads
3. **/gallery** (future) - Showcase of example generations

---

## MVP Deliverables

1. ✅ Stunning cyberpunk landing page
2. ✅ Input form with prompt + dropdowns
3. ✅ AI-powered template selection and parameter extraction
4. ✅ Parametric STL generation (3-4 base templates)
5. ✅ Interactive Three.js 3D viewer with orbit controls
6. ✅ AI-generated Markdown engineering report
7. ✅ Download buttons for STL, MD, and PNG render
8. ✅ Loading states with cyberpunk animations
9. ✅ Responsive design (desktop-first, mobile-friendly)

---

## Future Enhancements (Post-MVP)

- More templates (gears, hinges, threaded parts)
- Parameter adjustment sliders in UI
- Save/share designs with unique URLs
- Gallery of community designs
- Export to other CAD formats
