import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const SPECTRAL_COLORS = {
  O: '#9bb0ff',
  B: '#aabfff',
  A: '#cad7ff',
  F: '#f8f7ff',
  G: '#fff4e8',
  K: '#ffd2a1',
  M: '#ffcc6f',
  default: '#cfd8ff',
}

function raDecToVec3(raHours, decDeg, radius) {
  const ra = (raHours / 24) * Math.PI * 2
  const dec = (decDeg * Math.PI) / 180
  const x = radius * Math.cos(dec) * Math.cos(ra)
  const y = radius * Math.sin(dec)
  const z = radius * Math.cos(dec) * Math.sin(ra)
  return [x, y, z]
}

function StarPoint({ star, radius }) {
  const color = SPECTRAL_COLORS[star.spectral_class] || SPECTRAL_COLORS.default
  const mag = star.magnitude ?? 5
  const size = Math.max(0.015, Math.min(0.25, 0.25 - mag * 0.025))
  const pos = useMemo(
    () => raDecToVec3(star.ra, star.dec, radius),
    [star.ra, star.dec, radius],
  )
  return (
    <mesh position={pos}>
      <sphereGeometry args={[size, 6, 6]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function RotatingSky({ stars, radius }) {
  const ref = useRef(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02
  })
  return (
    <group ref={ref}>
      {stars.map((s, i) => (
        <StarPoint key={`${s.name || 's'}-${i}`} star={s} radius={radius} />
      ))}
    </group>
  )
}

function SkyDome({ radius }) {
  return (
    <mesh>
      <sphereGeometry args={[radius * 1.5, 32, 32]} />
      <meshBasicMaterial
        color="#05060f"
        side={THREE.BackSide}
        transparent
        opacity={0.95}
      />
    </mesh>
  )
}

export default function StarMap({ stars = [] }) {
  const RADIUS = 8
  return (
    <div className="star-map">
      <Canvas camera={{ position: [0, 0, 14], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <SkyDome radius={RADIUS} />
        <RotatingSky stars={stars} radius={RADIUS} />
        <OrbitControls enableZoom enablePan enableRotate />
      </Canvas>
      <div className="star-map-legend">
        <span><i style={{ background: SPECTRAL_COLORS.O }} />O</span>
        <span><i style={{ background: SPECTRAL_COLORS.B }} />B</span>
        <span><i style={{ background: SPECTRAL_COLORS.A }} />A</span>
        <span><i style={{ background: SPECTRAL_COLORS.F }} />F</span>
        <span><i style={{ background: SPECTRAL_COLORS.G }} />G</span>
        <span><i style={{ background: SPECTRAL_COLORS.K }} />K</span>
        <span><i style={{ background: SPECTRAL_COLORS.M }} />M</span>
      </div>
      <p className="star-map-hint">Drag to rotate · scroll to zoom</p>
    </div>
  )
}
