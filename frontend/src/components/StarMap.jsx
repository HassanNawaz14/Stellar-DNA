import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const SPECTRAL_COLORS = {
  O: '#9bb0ff',
  B: '#aabfff',
  A: '#cad7ff',
  F: '#f8f7ff',
  G: '#fff4ea',
  K: '#ffd2a1',
  M: '#ffcc6f',
  default: '#cfd8ff',
}

const SKY_RADIUS = 8
const GALACTIC_TILT_RAD = (62.6 * Math.PI) / 180
const COLOR_BOOST = 2.2

function makeStarTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0.0, 'rgba(255,255,255,1.0)')
  grad.addColorStop(0.1, 'rgba(255,255,255,1.0)')
  grad.addColorStop(0.3, 'rgba(255,255,255,0.9)')
  grad.addColorStop(0.5, 'rgba(255,255,255,0.5)')
  grad.addColorStop(0.75, 'rgba(255,255,255,0.15)')
  grad.addColorStop(1.0, 'rgba(255,255,255,0.0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function magToSize(mag) {
  const raw = 4.5 - 0.6 * mag
  return Math.max(0.8, Math.min(28, raw))
}

function StarField({ stars, texture }) {
  const pointsRef = useRef(null)
  const { gl } = useThree()

  const { geometry, material } = useMemo(() => {
    const n = stars.length
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
    const sizes = new Float32Array(n)
    const tmp = new THREE.Color()

    for (let i = 0; i < n; i++) {
      const s = stars[i]
      const ra = (s.ra / 24) * Math.PI * 2
      const dec = (s.dec * Math.PI) / 180
      positions[i * 3 + 0] = SKY_RADIUS * Math.cos(dec) * Math.cos(ra)
      positions[i * 3 + 1] = SKY_RADIUS * Math.sin(dec)
      positions[i * 3 + 2] = SKY_RADIUS * Math.cos(dec) * Math.sin(ra)

      const hex = SPECTRAL_COLORS[s.spectral_class] || SPECTRAL_COLORS.default
      tmp.set(hex)
      colors[i * 3 + 0] = tmp.r
      colors[i * 3 + 1] = tmp.g
      colors[i * 3 + 2] = tmp.b

      sizes[i] = magToSize(s.magnitude ?? 5)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uDpr: { value: 1 },
      },
      vertexShader: `
        attribute float aSize;
        attribute vec3 aColor;
        uniform float uDpr;
        varying vec3 vColor;
        void main() {
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uDpr;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec3 vColor;
        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          if (tex.a < 0.005) discard;
          gl_FragColor = vec4(vColor * tex.rgb * ${COLOR_BOOST.toFixed(2)}, tex.a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return { geometry: geo, material: mat }
  }, [stars, texture])

  useEffect(() => {
    material.uniforms.uDpr.value = gl.getPixelRatio()
  }, [gl, material])

  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.02
  })

  return (
    <group rotation={[GALACTIC_TILT_RAD, 0, 0]}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  )
}

export default function StarMap({ stars = [] }) {
  const texture = useMemo(() => makeStarTexture(), [])

  return (
    <div className="sm-container">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 60 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />
        <StarField stars={stars} texture={texture} />
        <OrbitControls enableZoom enablePan enableRotate />
      </Canvas>
      <div className="sm-legend">
        <span><i style={{ background: SPECTRAL_COLORS.O }} />O</span>
        <span><i style={{ background: SPECTRAL_COLORS.B }} />B</span>
        <span><i style={{ background: SPECTRAL_COLORS.A }} />A</span>
        <span><i style={{ background: SPECTRAL_COLORS.F }} />F</span>
        <span><i style={{ background: SPECTRAL_COLORS.G }} />G</span>
        <span><i style={{ background: SPECTRAL_COLORS.K }} />K</span>
        <span><i style={{ background: SPECTRAL_COLORS.M }} />M</span>
      </div>
      <p className="sm-hint">Drag to rotate · scroll to zoom</p>
    </div>
  )
}
