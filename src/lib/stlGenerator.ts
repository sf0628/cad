// Parametric STL Generator
// Generates valid ASCII STL files from parametric templates

import * as THREE from "three";

export interface BoxParams {
  width: number;
  height: number;
  depth: number;
  wallThickness: number;
  hasLid: boolean;
  hasVents: boolean;
  ventCount: number;
  hasMountingHoles: boolean;
  cornerRadius: number;
}

export interface BracketParams {
  armLength1: number;
  armLength2: number;
  thickness: number;
  width: number;
  holeCount: number;
  holeDiameter: number;
}

export interface CylinderMountParams {
  innerDiameter: number;
  outerDiameter: number;
  height: number;
  hasTabs: boolean;
  tabCount: number;
  tabWidth: number;
}

export interface PlateParams {
  width: number;
  height: number;
  thickness: number;
  holeGridX: number;
  holeGridY: number;
  holeDiameter: number;
  hasRoundedCorners: boolean;
}

export interface HandleParams {
  length: number;
  width: number;
  height: number;
  curveRadius: number;
  hasGripTexture: boolean;
}

export type TemplateType =
  | "enclosure"
  | "bracket"
  | "mount"
  | "plate"
  | "handle"
  | "connector";

export interface GenerationParams {
  template: TemplateType;
  box?: Partial<BoxParams>;
  bracket?: Partial<BracketParams>;
  cylinder?: Partial<CylinderMountParams>;
  plate?: Partial<PlateParams>;
  handle?: Partial<HandleParams>;
}

// --- Validation helpers ---

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" && isFinite(value) ? value : fallback;
  return Math.max(min, Math.min(max, n));
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function int(value: unknown, min: number, max: number, fallback: number): number {
  return Math.round(clamp(value, min, max, fallback));
}

function validateBoxParams(p: Partial<BoxParams> = {}): BoxParams {
  const width = clamp(p.width, 20, 500, 100);
  const height = clamp(p.height, 10, 300, 40);
  const depth = clamp(p.depth, 20, 500, 60);
  const wallThickness = clamp(
    p.wallThickness,
    1,
    Math.min(10, width / 4, height / 4, depth / 4),
    2
  );
  return {
    width,
    height,
    depth,
    wallThickness,
    hasLid: bool(p.hasLid, true),
    hasVents: bool(p.hasVents, true),
    ventCount: int(p.ventCount, 0, 20, 6),
    hasMountingHoles: bool(p.hasMountingHoles, true),
    cornerRadius: clamp(p.cornerRadius, 0, Math.min(25, width / 4, depth / 4), 3),
  };
}

function validateBracketParams(p: Partial<BracketParams> = {}): BracketParams {
  return {
    armLength1: clamp(p.armLength1, 10, 300, 60),
    armLength2: clamp(p.armLength2, 10, 300, 40),
    thickness: clamp(p.thickness, 2, 20, 5),
    width: clamp(p.width, 5, 150, 20),
    holeCount: int(p.holeCount, 0, 10, 2),
    holeDiameter: clamp(p.holeDiameter, 1, 20, 4),
  };
}

function validateCylinderParams(
  p: Partial<CylinderMountParams> = {}
): CylinderMountParams {
  const innerDiameter = clamp(p.innerDiameter, 5, 200, 20);
  const outerDiameter = clamp(
    p.outerDiameter,
    innerDiameter + 2,
    250,
    Math.max(innerDiameter + 5, 30)
  );
  return {
    innerDiameter,
    outerDiameter,
    height: clamp(p.height, 5, 200, 25),
    hasTabs: bool(p.hasTabs, true),
    tabCount: int(p.tabCount, 0, 8, 4),
    tabWidth: clamp(p.tabWidth, 3, 50, 10),
  };
}

function validatePlateParams(p: Partial<PlateParams> = {}): PlateParams {
  return {
    width: clamp(p.width, 10, 400, 100),
    height: clamp(p.height, 10, 400, 60),
    thickness: clamp(p.thickness, 1, 20, 3),
    holeGridX: int(p.holeGridX, 0, 10, 4),
    holeGridY: int(p.holeGridY, 0, 10, 3),
    holeDiameter: clamp(p.holeDiameter, 1, 20, 5),
    hasRoundedCorners: bool(p.hasRoundedCorners, true),
  };
}

function validateHandleParams(p: Partial<HandleParams> = {}): HandleParams {
  return {
    length: clamp(p.length, 30, 400, 100),
    width: clamp(p.width, 10, 100, 20),
    height: clamp(p.height, 20, 150, 40),
    curveRadius: clamp(p.curveRadius, 3, 30, 8),
    hasGripTexture: bool(p.hasGripTexture, false),
  };
}

// --- Geometry generators ---

// Hollow box enclosure: bottom + 4 walls + optional lid + corner posts
function generateBoxEnclosure(raw: Partial<BoxParams>): THREE.BufferGeometry {
  const {
    width: W,
    height: H,
    depth: D,
    wallThickness: t,
    hasLid,
    hasMountingHoles,
  } = validateBoxParams(raw);

  const pieces: THREE.BufferGeometry[] = [];

  // Bottom
  const bottom = new THREE.BoxGeometry(W, t, D);
  bottom.translate(0, -H / 2 + t / 2, 0);
  pieces.push(bottom);

  // Top lid
  if (hasLid) {
    const lid = new THREE.BoxGeometry(W, t, D);
    lid.translate(0, H / 2 - t / 2, 0);
    pieces.push(lid);
  }

  // Wall height and vertical center
  const wallH = hasLid ? H - 2 * t : H - t;
  const wallY = hasLid ? 0 : t / 2;

  // Front wall (z+)
  const front = new THREE.BoxGeometry(W, wallH, t);
  front.translate(0, wallY, D / 2 - t / 2);
  pieces.push(front);

  // Back wall (z-)
  const back = new THREE.BoxGeometry(W, wallH, t);
  back.translate(0, wallY, -D / 2 + t / 2);
  pieces.push(back);

  // Left wall (x-)
  const left = new THREE.BoxGeometry(t, wallH, D - 2 * t);
  left.translate(-W / 2 + t / 2, wallY, 0);
  pieces.push(left);

  // Right wall (x+)
  const right = new THREE.BoxGeometry(t, wallH, D - 2 * t);
  right.translate(W / 2 - t / 2, wallY, 0);
  pieces.push(right);

  // Corner mounting posts sitting on the bottom
  if (hasMountingHoles) {
    const postR = Math.min(3, t * 1.2);
    const postH = wallH;
    const inset = postR + t;
    const corners: [number, number, number][] = [
      [W / 2 - inset, wallY, D / 2 - inset],
      [-W / 2 + inset, wallY, D / 2 - inset],
      [W / 2 - inset, wallY, -D / 2 + inset],
      [-W / 2 + inset, wallY, -D / 2 + inset],
    ];
    corners.forEach(([x, y, z]) => {
      const post = new THREE.CylinderGeometry(postR, postR, postH, 8);
      post.translate(x, y, z);
      pieces.push(post);
    });
  }

  return mergeGeometries(pieces) ?? new THREE.BoxGeometry(W, H, D);
}

// L-bracket
function generateBracket(raw: Partial<BracketParams>): THREE.BufferGeometry {
  const { armLength1, armLength2, thickness, width } = validateBracketParams(raw);

  const arm1 = new THREE.BoxGeometry(armLength1, thickness, width);
  arm1.translate(armLength1 / 2, 0, 0);

  const arm2 = new THREE.BoxGeometry(thickness, armLength2, width);
  arm2.translate(0, armLength2 / 2, 0);

  return mergeGeometries([arm1, arm2]) ?? arm1;
}

// Cylinder mount with optional tabs
function generateCylinderMount(
  raw: Partial<CylinderMountParams>
): THREE.BufferGeometry {
  const { outerDiameter, height, hasTabs, tabCount, tabWidth } =
    validateCylinderParams(raw);

  const cylinder = new THREE.CylinderGeometry(
    outerDiameter / 2,
    outerDiameter / 2,
    height,
    32
  );

  if (hasTabs && tabCount > 0) {
    const tabGeometries: THREE.BufferGeometry[] = [cylinder];
    for (let i = 0; i < tabCount; i++) {
      const angle = (i / tabCount) * Math.PI * 2;
      const tab = new THREE.BoxGeometry(tabWidth, height * 0.3, outerDiameter * 0.3);
      tab.rotateY(angle);
      tab.translate(
        Math.cos(angle) * (outerDiameter / 2 + tabWidth / 2),
        -height / 2 + height * 0.15,
        Math.sin(angle) * (outerDiameter / 2 + tabWidth / 2)
      );
      tabGeometries.push(tab);
    }
    return mergeGeometries(tabGeometries) ?? cylinder;
  }

  return cylinder;
}

// Flat plate with optional rounded corners
function generatePlate(raw: Partial<PlateParams>): THREE.BufferGeometry {
  const { width, height, thickness, hasRoundedCorners } = validatePlateParams(raw);

  if (hasRoundedCorners) {
    const shape = new THREE.Shape();
    const r = Math.min(width, height) * 0.1;
    shape.moveTo(-width / 2 + r, -height / 2);
    shape.lineTo(width / 2 - r, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + r);
    shape.lineTo(width / 2, height / 2 - r);
    shape.quadraticCurveTo(width / 2, height / 2, width / 2 - r, height / 2);
    shape.lineTo(-width / 2 + r, height / 2);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - r);
    shape.lineTo(-width / 2, -height / 2 + r);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + r, -height / 2);

    const plate = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
    });
    plate.rotateX(Math.PI / 2);
    plate.translate(0, thickness / 2, 0);
    return plate;
  }

  return new THREE.BoxGeometry(width, thickness, height);
}

// Curved handle with end bases
function generateHandle(raw: Partial<HandleParams>): THREE.BufferGeometry {
  const { length, width, height, curveRadius } = validateHandleParams(raw);

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-length / 2, 0, 0),
    new THREE.Vector3(-length / 4, height * 0.7, 0),
    new THREE.Vector3(0, height, 0),
    new THREE.Vector3(length / 4, height * 0.7, 0),
    new THREE.Vector3(length / 2, 0, 0),
  ]);

  const tube = new THREE.TubeGeometry(curve, 32, curveRadius, 8, false);

  const base1 = new THREE.CylinderGeometry(
    curveRadius * 1.5,
    curveRadius * 1.5,
    width * 0.3,
    16
  );
  base1.rotateZ(Math.PI / 2);
  base1.translate(-length / 2, 0, 0);

  const base2 = new THREE.CylinderGeometry(
    curveRadius * 1.5,
    curveRadius * 1.5,
    width * 0.3,
    16
  );
  base2.rotateZ(Math.PI / 2);
  base2.translate(length / 2, 0, 0);

  return mergeGeometries([tube, base1, base2]) ?? tube;
}

// Merge multiple BufferGeometries by combining their vertex arrays
function mergeGeometries(
  geometries: THREE.BufferGeometry[]
): THREE.BufferGeometry | null {
  if (geometries.length === 0) return null;
  if (geometries.length === 1) return geometries[0];

  let totalVertices = 0;
  for (const g of geometries) {
    const pos = g.getAttribute("position");
    if (pos) totalVertices += pos.count;
  }

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);

  let offset = 0;
  for (const g of geometries) {
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    const norm = g.getAttribute("normal") as THREE.BufferAttribute;
    if (pos) {
      positions.set(pos.array as Float32Array, offset * 3);
      if (norm) normals.set(norm.array as Float32Array, offset * 3);
      offset += pos.count;
    }
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  merged.computeVertexNormals();
  return merged;
}

// Main generation function
export function generateGeometry(params: GenerationParams): THREE.BufferGeometry {
  switch (params.template) {
    case "enclosure":
      return generateBoxEnclosure(params.box ?? {});
    case "bracket":
      return generateBracket(params.bracket ?? {});
    case "mount":
      return generateCylinderMount(params.cylinder ?? {});
    case "plate":
      return generatePlate(params.plate ?? {});
    case "handle":
      return generateHandle(params.handle ?? {});
    case "connector":
      return generateBoxEnclosure(
        params.box ?? {
          width: 40,
          height: 20,
          depth: 30,
          wallThickness: 2,
          hasLid: true,
          hasMountingHoles: false,
          hasVents: false,
          ventCount: 0,
          cornerRadius: 2,
        }
      );
    default:
      return new THREE.BoxGeometry(30, 20, 15);
  }
}

// Convert geometry to ASCII STL string
export function geometryToSTL(geometry: THREE.BufferGeometry): string {
  const positions = geometry.getAttribute("position");

  if (!positions) {
    throw new Error("Geometry has no position attribute");
  }

  if (!geometry.getAttribute("normal")) {
    geometry.computeVertexNormals();
  }

  let stl = "solid ForgeAI_Design\n";

  const index = geometry.getIndex();

  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i);
      const b = index.getX(i + 1);
      const c = index.getX(i + 2);

      const v1 = new THREE.Vector3(
        positions.getX(a),
        positions.getY(a),
        positions.getZ(a)
      );
      const v2 = new THREE.Vector3(
        positions.getX(b),
        positions.getY(b),
        positions.getZ(b)
      );
      const v3 = new THREE.Vector3(
        positions.getX(c),
        positions.getY(c),
        positions.getZ(c)
      );

      const normal = v2.clone().sub(v1).cross(v3.clone().sub(v1)).normalize();

      stl += `  facet normal ${normal.x.toExponential()} ${normal.y.toExponential()} ${normal.z.toExponential()}\n`;
      stl += "    outer loop\n";
      stl += `      vertex ${v1.x.toExponential()} ${v1.y.toExponential()} ${v1.z.toExponential()}\n`;
      stl += `      vertex ${v2.x.toExponential()} ${v2.y.toExponential()} ${v2.z.toExponential()}\n`;
      stl += `      vertex ${v3.x.toExponential()} ${v3.y.toExponential()} ${v3.z.toExponential()}\n`;
      stl += "    endloop\n";
      stl += "  endfacet\n";
    }
  } else {
    for (let i = 0; i < positions.count; i += 3) {
      const v1 = new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
      const v2 = new THREE.Vector3(
        positions.getX(i + 1),
        positions.getY(i + 1),
        positions.getZ(i + 1)
      );
      const v3 = new THREE.Vector3(
        positions.getX(i + 2),
        positions.getY(i + 2),
        positions.getZ(i + 2)
      );

      const normal = v2.clone().sub(v1).cross(v3.clone().sub(v1)).normalize();

      stl += `  facet normal ${normal.x.toExponential()} ${normal.y.toExponential()} ${normal.z.toExponential()}\n`;
      stl += "    outer loop\n";
      stl += `      vertex ${v1.x.toExponential()} ${v1.y.toExponential()} ${v1.z.toExponential()}\n`;
      stl += `      vertex ${v2.x.toExponential()} ${v2.y.toExponential()} ${v2.z.toExponential()}\n`;
      stl += `      vertex ${v3.x.toExponential()} ${v3.y.toExponential()} ${v3.z.toExponential()}\n`;
      stl += "    endloop\n";
      stl += "  endfacet\n";
    }
  }

  stl += "endsolid ForgeAI_Design\n";
  return stl;
}

// Create STL Blob for download
export function createSTLBlob(geometry: THREE.BufferGeometry): Blob {
  const stlString = geometryToSTL(geometry);
  return new Blob([stlString], { type: "application/sla" });
}
