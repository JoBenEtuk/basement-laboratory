import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'

// eslint-disable-next-line prettier/prettier
const vertexShader =/* glsl */ `
  varying vec2 vUv;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
  }
`

// eslint-disable-next-line prettier/prettier
const fragmentShader =/* glsl */ `
  varying vec2 vUv;

  // uniform vec3 cameraPosition;
  uniform vec3 uPlanePosition;
  uniform vec2 uResolution;
  
  /* SDF stands for Signed Distance Fields */
  float sdfCircle(vec2 uv, float r, vec2 offset) {
    float x = uv.x - offset.x;
    float y = uv.y - offset.y;

    return length(vec2(x, y)) - r;
  }

  // vec2 getParallaxOffset() {

  // }

  vec3 getViewDirectionInTangentSpace() {
    vec3 viewDir = normalize(cameraPosition - uPlanePosition);
    vec3 normal = vec3(0.0, 0.0, 1.0);

    vec3 tangent = normalize(vec3(1.0, 0.0, 0.0));
    vec3 bitangent = normalize(cross(normal, tangent));

    return vec3(dot(viewDir, tangent), dot(viewDir, bitangent), dot(viewDir, normal));
  }

  void main() {
    vec2 uv = vUv;
    uv -= 0.5;

    vec3 dist = getViewDirectionInTangentSpace();
    vec3 normalizedDist = normalize(dist);

    float detphDist = 0.0;
    float detphDist1 = 0.2;

    vec2 offset = vec2(detphDist) * normalizedDist.xy;
    vec2 offset1 = vec2(detphDist1) * normalizedDist.xy;

    float shape = sdfCircle(uv, 0.25, offset);
    float shape1 = sdfCircle(uv, 0.5, offset1);

    vec3 col = vec3(1.0);

    /* Blend them together */
    col = mix(vec3(1, 0, 0), col, step(0., shape1));
    col = mix(vec3(0, 0, 1), col, step(0., shape));

    gl_FragColor = vec4(col, 1.0);
  }
`

const DepthShader = () => {
  const size = useThree((s) => s.size)

  return (
    <>
      <OrbitControls />
      <mesh>
        <planeGeometry args={[4, 4]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          side={THREE.DoubleSide}
          uniforms={{
            uPlanePosition: {
              value: new THREE.Vector3(0, 0, 0)
            },
            uResolution: { value: new THREE.Vector2(size.width, size.height) }
          }}
        />
      </mesh>
    </>
  )
}

DepthShader.Title = 'Depth Shader'

export default DepthShader