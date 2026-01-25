// Parametric STL Generator
// Generates valid ASCII STL files from parametric templates

import * as THREE from 'three';

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

export type TemplateType = 'enclosure' | 'bracket' | 'mount' | 'plate' | 'handle' | 'connector';

export interface GenerationParams {
  template: TemplateType;
  box?: BoxParams;
  bracket?: BracketParams;
  cylinder?: CylinderMountParams;
  plate?: PlateParams;
  handle?: HandleParams;
}

// Generate box enclosure geometry
function generateBoxEnclosure(params: BoxParams): THREE.BufferGeometry {
  const { width, height, depth, wallThickness, hasVents, ventCount, hasMountingHoles } = params;
  
  const group = new THREE.Group();
  
  // Outer box
  const outerBox = new THREE.BoxGeometry(width, height, depth);
  const outerMesh = new THREE.Mesh(outerBox);
  group.add(outerMesh);
  
  // Inner cavity (will be subtracted in a real CSG implementation)
  // For now, we create a hollow box using multiple faces
  const geometry = new THREE.BoxGeometry(width, height, depth);
  
  // Add some detail - mounting posts at corners
  if (hasMountingHoles) {
    const postRadius = 3;
    const postHeight = height - wallThickness;
    const positions = [
      [width/2 - postRadius - wallThickness, -height/2 + postHeight/2 + wallThickness, depth/2 - postRadius - wallThickness],
      [-width/2 + postRadius + wallThickness, -height/2 + postHeight/2 + wallThickness, depth/2 - postRadius - wallThickness],
      [width/2 - postRadius - wallThickness, -height/2 + postHeight/2 + wallThickness, -depth/2 + postRadius + wallThickness],
      [-width/2 + postRadius + wallThickness, -height/2 + postHeight/2 + wallThickness, -depth/2 + postRadius + wallThickness],
    ];
    
    positions.forEach(([x, y, z]) => {
      const post = new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 8);
      post.translate(x, y, z);
    });
  }
  
  return geometry;
}

// Generate L-bracket geometry
function generateBracket(params: BracketParams): THREE.BufferGeometry {
  const { armLength1, armLength2, thickness, width, holeCount, holeDiameter } = params;
  
  // Create L-shape using box geometries
  const arm1 = new THREE.BoxGeometry(armLength1, thickness, width);
  arm1.translate(armLength1/2, 0, 0);
  
  const arm2 = new THREE.BoxGeometry(thickness, armLength2, width);
  arm2.translate(0, armLength2/2, 0);
  
  const merged = mergeGeometries([arm1, arm2]);
  return merged || arm1;
}

// Generate cylinder mount geometry
function generateCylinderMount(params: CylinderMountParams): THREE.BufferGeometry {
  const { innerDiameter, outerDiameter, height, hasTabs, tabCount, tabWidth } = params;
  
  // Main cylinder
  const cylinder = new THREE.CylinderGeometry(
    outerDiameter / 2,
    outerDiameter / 2,
    height,
    32
  );
  
  if (hasTabs && tabCount > 0) {
    const tabGeometries = [cylinder];
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
    const merged = mergeGeometries(tabGeometries);
    return merged || cylinder;
  }
  
  return cylinder;
}

// Generate flat plate geometry
function generatePlate(params: PlateParams): THREE.BufferGeometry {
  const { width, height, thickness, holeGridX, holeGridY, holeDiameter, hasRoundedCorners } = params;
  
  let plate: THREE.BufferGeometry;
  
  if (hasRoundedCorners) {
    // Use RoundedBoxGeometry-like approach
    const shape = new THREE.Shape();
    const radius = Math.min(width, height) * 0.1;
    shape.moveTo(-width/2 + radius, -height/2);
    shape.lineTo(width/2 - radius, -height/2);
    shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + radius);
    shape.lineTo(width/2, height/2 - radius);
    shape.quadraticCurveTo(width/2, height/2, width/2 - radius, height/2);
    shape.lineTo(-width/2 + radius, height/2);
    shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - radius);
    shape.lineTo(-width/2, -height/2 + radius);
    shape.quadraticCurveTo(-width/2, -height/2, -width/2 + radius, -height/2);
    
    plate = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
    });
    plate.rotateX(Math.PI / 2);
    plate.translate(0, thickness / 2, 0);
  } else {
    plate = new THREE.BoxGeometry(width, thickness, height);
  }
  
  return plate;
}

// Generate handle geometry
function generateHandle(params: HandleParams): THREE.BufferGeometry {
  const { length, width, height, curveRadius } = params;
  
  // Create curved handle shape
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-length/2, 0, 0),
    new THREE.Vector3(-length/4, height * 0.7, 0),
    new THREE.Vector3(0, height, 0),
    new THREE.Vector3(length/4, height * 0.7, 0),
    new THREE.Vector3(length/2, 0, 0),
  ]);
  
  const tubeGeometry = new THREE.TubeGeometry(curve, 32, curveRadius, 8, false);
  
  // Add mounting bases
  const base1 = new THREE.CylinderGeometry(curveRadius * 1.5, curveRadius * 1.5, width * 0.3, 16);
  base1.rotateZ(Math.PI / 2);
  base1.translate(-length/2, 0, 0);
  
  const base2 = new THREE.CylinderGeometry(curveRadius * 1.5, curveRadius * 1.5, width * 0.3, 16);
  base2.rotateZ(Math.PI / 2);
  base2.translate(length/2, 0, 0);
  
  const merged = mergeGeometries([tubeGeometry, base1, base2]);
  return merged || tubeGeometry;
}

// Helper to merge geometries
function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (geometries.length === 0) return null;
  if (geometries.length === 1) return geometries[0];
  
  // Simple merge - combine all position attributes
  let totalVertices = 0;
  geometries.forEach(g => {
    const pos = g.getAttribute('position');
    if (pos) totalVertices += pos.count;
  });
  
  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  
  let offset = 0;
  geometries.forEach(g => {
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const norm = g.getAttribute('normal') as THREE.BufferAttribute;
    
    if (pos) {
      positions.set(pos.array as Float32Array, offset * 3);
      if (norm) {
        normals.set(norm.array as Float32Array, offset * 3);
      }
      offset += pos.count;
    }
  });
  
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.computeVertexNormals();
  
  return merged;
}

// Main generation function
export function generateGeometry(params: GenerationParams): THREE.BufferGeometry {
  switch (params.template) {
    case 'enclosure':
      return generateBoxEnclosure(params.box || {
        width: 100,
        height: 40,
        depth: 60,
        wallThickness: 2,
        hasLid: true,
        hasVents: true,
        ventCount: 6,
        hasMountingHoles: true,
        cornerRadius: 3,
      });
    
    case 'bracket':
      return generateBracket(params.bracket || {
        armLength1: 60,
        armLength2: 40,
        thickness: 5,
        width: 20,
        holeCount: 2,
        holeDiameter: 4,
      });
    
    case 'mount':
      return generateCylinderMount(params.cylinder || {
        innerDiameter: 20,
        outerDiameter: 30,
        height: 25,
        hasTabs: true,
        tabCount: 4,
        tabWidth: 10,
      });
    
    case 'plate':
      return generatePlate(params.plate || {
        width: 100,
        height: 60,
        thickness: 3,
        holeGridX: 4,
        holeGridY: 3,
        holeDiameter: 5,
        hasRoundedCorners: true,
      });
    
    case 'handle':
      return generateHandle(params.handle || {
        length: 100,
        width: 20,
        height: 40,
        curveRadius: 8,
        hasGripTexture: false,
      });
    
    case 'connector':
    default:
      // Default to a simple connector piece
      return new THREE.BoxGeometry(30, 20, 15);
  }
}

// Convert geometry to STL string
export function geometryToSTL(geometry: THREE.BufferGeometry): string {
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  
  if (!positions) {
    throw new Error('Geometry has no position attribute');
  }
  
  // Ensure we have normals
  if (!normals) {
    geometry.computeVertexNormals();
  }
  
  const normalAttr = geometry.getAttribute('normal');
  
  let stl = 'solid ForgeAI_Design\n';
  
  // Process triangles
  const index = geometry.getIndex();
  
  if (index) {
    // Indexed geometry
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i);
      const b = index.getX(i + 1);
      const c = index.getX(i + 2);
      
      // Calculate face normal
      const v1 = new THREE.Vector3(positions.getX(a), positions.getY(a), positions.getZ(a));
      const v2 = new THREE.Vector3(positions.getX(b), positions.getY(b), positions.getZ(b));
      const v3 = new THREE.Vector3(positions.getX(c), positions.getY(c), positions.getZ(c));
      
      const edge1 = v2.clone().sub(v1);
      const edge2 = v3.clone().sub(v1);
      const normal = edge1.cross(edge2).normalize();
      
      stl += `  facet normal ${normal.x.toExponential()} ${normal.y.toExponential()} ${normal.z.toExponential()}\n`;
      stl += '    outer loop\n';
      stl += `      vertex ${v1.x.toExponential()} ${v1.y.toExponential()} ${v1.z.toExponential()}\n`;
      stl += `      vertex ${v2.x.toExponential()} ${v2.y.toExponential()} ${v2.z.toExponential()}\n`;
      stl += `      vertex ${v3.x.toExponential()} ${v3.y.toExponential()} ${v3.z.toExponential()}\n`;
      stl += '    endloop\n';
      stl += '  endfacet\n';
    }
  } else {
    // Non-indexed geometry
    for (let i = 0; i < positions.count; i += 3) {
      const v1 = new THREE.Vector3(positions.getX(i), positions.getY(i), positions.getZ(i));
      const v2 = new THREE.Vector3(positions.getX(i + 1), positions.getY(i + 1), positions.getZ(i + 1));
      const v3 = new THREE.Vector3(positions.getX(i + 2), positions.getY(i + 2), positions.getZ(i + 2));
      
      const edge1 = v2.clone().sub(v1);
      const edge2 = v3.clone().sub(v1);
      const normal = edge1.cross(edge2).normalize();
      
      stl += `  facet normal ${normal.x.toExponential()} ${normal.y.toExponential()} ${normal.z.toExponential()}\n`;
      stl += '    outer loop\n';
      stl += `      vertex ${v1.x.toExponential()} ${v1.y.toExponential()} ${v1.z.toExponential()}\n`;
      stl += `      vertex ${v2.x.toExponential()} ${v2.y.toExponential()} ${v2.z.toExponential()}\n`;
      stl += `      vertex ${v3.x.toExponential()} ${v3.y.toExponential()} ${v3.z.toExponential()}\n`;
      stl += '    endloop\n';
      stl += '  endfacet\n';
    }
  }
  
  stl += 'endsolid ForgeAI_Design\n';
  
  return stl;
}

// Create STL Blob for download
export function createSTLBlob(geometry: THREE.BufferGeometry): Blob {
  const stlString = geometryToSTL(geometry);
  return new Blob([stlString], { type: 'application/sla' });
}
