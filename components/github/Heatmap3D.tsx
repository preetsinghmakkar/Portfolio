'use client'

import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { ContributionDay, ContributionLevel, ContributionWeek } from '@/types/github'

// ─── Color palette ────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<ContributionLevel, THREE.Color> = {
  NONE:           new THREE.Color(0x052d15),
  FIRST_QUARTILE: new THREE.Color(0x0a5226),
  SECOND_QUARTILE:new THREE.Color(0x008a3d),
  THIRD_QUARTILE: new THREE.Color(0x00c853),
  FOURTH_QUARTILE:new THREE.Color(0x00ff66),
}
const HOVER_COLOR   = new THREE.Color(0x7dffb3)
const SPACING       = 1.1
const CUBE_W        = 0.86
const MAX_HEIGHT    = 5.2

// ─── Spring easing (gentle bounce-settle) ────────────────────────────────────

function springSettle(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  const decay = Math.exp(-6 * t)
  return 1 - decay * Math.cos(t * Math.PI * 3.0)
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayEntry { weekIdx: number; dayIdx: number; data: ContributionDay }

interface TooltipData {
  x: number; y: number
  day: ContributionDay
  weekIdx: number; dayIdx: number
}

// ─── Scene (inside Canvas) ────────────────────────────────────────────────────

function HeatmapScene({
  days, maxCount, totalWeeks, onTooltip,
}: {
  days: DayEntry[]
  maxCount: number
  totalWeeks: number
  onTooltip: (t: TooltipData | null) => void
}) {
  const meshRef    = useRef<THREE.InstancedMesh>(null)
  const groupRef   = useRef<THREE.Group>(null)
  const controlsRef = useRef<any>(null)
  const lightRef   = useRef<THREE.PointLight>(null)

  const animRef        = useRef(0)
  const animDoneRef    = useRef(false)
  const hoveredRef     = useRef<number | null>(null)
  const prevHovRef     = useRef<number | null>(null)
  const lastStopRef    = useRef(Infinity)    // Infinity = animation not done yet
  const listenersRef   = useRef(false)

  const dummy    = useMemo(() => new THREE.Object3D(), [])
  const colorBuf = useMemo(() => new THREE.Color(), [])
  const count    = days.length

  const centerX = ((totalWeeks - 1) * SPACING) / 2
  const centerZ = (6 * SPACING) / 2

  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.28, metalness: 0.14, color: new THREE.Color('#ffffff'),
  }), [])

  // Initialise all cubes flat so entry animation starts from ground
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || !count) return
    days.forEach((entry, i) => {
      dummy.position.set(entry.weekIdx * SPACING, 0.025, entry.dayIdx * SPACING)
      dummy.scale.set(CUBE_W, 0.05, CUBE_W)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      colorBuf.set(LEVEL_COLORS[entry.data.contributionLevel])
      mesh.setColorAt(i, colorBuf)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [days, count, dummy, colorBuf])

  useFrame((state, delta) => {
    const mesh     = meshRef.current
    const group    = groupRef.current
    const controls = controlsRef.current
    if (!mesh || !count) return

    // ── Wire up OrbitControls interaction listeners once ──────────────────────
    if (controls && !listenersRef.current) {
      const stop = () => { lastStopRef.current = Date.now() }
      controls.addEventListener('start', stop)
      controls.addEventListener('end',   stop)
      controls.autoRotateSpeed = 0.28
      listenersRef.current = true
    }

    // ── Auto-orbit: resumes 3 s after last interaction / animation end ────────
    if (controls && listenersRef.current) {
      const idle = Date.now() - lastStopRef.current
      controls.autoRotate = animDoneRef.current && idle > 3000
    }

    // ── Accent point-light pulse ──────────────────────────────────────────────
    if (lightRef.current) {
      lightRef.current.intensity = 1.6 + Math.sin(state.clock.elapsedTime * 0.65) * 0.55
    }

    const hovNow     = hoveredRef.current
    const hovChanged = hovNow !== prevHovRef.current

    // ── Entry animation (with spring-bounce settle) ───────────────────────────
    if (!animDoneRef.current) {
      animRef.current += delta * 0.48

      const t = animRef.current
      days.forEach((entry, i) => {
        const staggerStart = (entry.weekIdx / Math.max(1, totalWeeks - 1)) * 0.88
        const prog = springSettle(Math.max(0, (t - staggerStart) / 0.72))

        const targetH = Math.max(0.05, (entry.data.contributionCount / Math.max(1, maxCount)) * MAX_HEIGHT)
        const h = Math.max(0.05, targetH * prog)

        const isHov    = hovNow === i
        const scaleXZ  = isHov ? CUBE_W * 1.1 : CUBE_W

        dummy.position.set(entry.weekIdx * SPACING, h / 2, entry.dayIdx * SPACING)
        dummy.scale.set(scaleXZ, h, scaleXZ)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)

        colorBuf.set(isHov ? HOVER_COLOR : LEVEL_COLORS[entry.data.contributionLevel])
        mesh.setColorAt(i, colorBuf)
      })

      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

      // Done when last week has fully settled
      if (t >= 0.88 + 0.72 + 0.12) {
        animDoneRef.current = true
        lastStopRef.current = Date.now()   // trigger 3-s pause before auto-orbit
      }
    } else {
      // ── Idle: subtle group sway (cheap — one matrix update) ─────────────────
      if (group) {
        const et = state.clock.elapsedTime
        group.rotation.y = Math.sin(et * 0.11) * 0.011
        group.rotation.x = Math.cos(et * 0.075) * 0.004
      }

      // ── Hover: update colors + scale only when hover changes ─────────────────
      if (hovChanged) {
        days.forEach((entry, i) => {
          const targetH = Math.max(0.05, (entry.data.contributionCount / Math.max(1, maxCount)) * MAX_HEIGHT)
          const isHov   = hovNow === i
          const scaleXZ = isHov ? CUBE_W * 1.1 : CUBE_W
          const h       = targetH * (isHov ? 1.08 : 1)

          dummy.position.set(entry.weekIdx * SPACING, targetH / 2, entry.dayIdx * SPACING)
          dummy.scale.set(scaleXZ, h, scaleXZ)
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)

          colorBuf.set(isHov ? HOVER_COLOR : LEVEL_COLORS[entry.data.contributionLevel])
          mesh.setColorAt(i, colorBuf)
        })
        mesh.instanceMatrix.needsUpdate = true
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
        prevHovRef.current = hovNow
      }
    }
  })

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.instanceId != null && days[e.instanceId]) {
      hoveredRef.current = e.instanceId
      onTooltip({
        x: e.nativeEvent.clientX, y: e.nativeEvent.clientY,
        day: days[e.instanceId].data,
        weekIdx: days[e.instanceId].weekIdx,
        dayIdx:  days[e.instanceId].dayIdx,
      })
    }
  }, [days, onTooltip])

  const handlePointerLeave = useCallback(() => {
    hoveredRef.current = null
    onTooltip(null)
  }, [onTooltip])

  return (
    <>
      {/* Atmosphere */}
      <fog attach="fog" args={['#050505', 65, 160]} />

      {/* Lighting rig */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[centerX + 15, 40, 30]} intensity={1.05} color="#ffffff" />
      {/* Rim / back-fill — subtle green tint */}
      <directionalLight position={[centerX - 30, 10, -20]} intensity={0.3} color="#003d1a" />
      {/* Pulsing accent point light */}
      <pointLight
        ref={lightRef}
        position={[centerX, 7, centerZ]}
        color="#00ff66"
        intensity={1.6}
        distance={75}
        decay={2}
      />
      {/* Soft fill from side */}
      <pointLight position={[centerX * 0.25, 4, centerZ + 8]} color="#00c853" intensity={0.45} distance={55} decay={2} />

      {/* Ground plane — absorbs stray light and adds depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.12, centerZ]}>
        <planeGeometry args={[220, 130]} />
        <meshStandardMaterial color="#020504" metalness={0.04} roughness={0.97} />
      </mesh>

      {/* Cube grid with idle sway group */}
      <group ref={groupRef}>
        {count > 0 && (
          <instancedMesh
            ref={meshRef}
            args={[geo, mat, count]}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          />
        )}
      </group>

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        minDistance={18}
        maxDistance={95}
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={Math.PI / 2.4}
        target={[centerX, 0, centerZ]}
        dampingFactor={0.07}
        enableDamping
        autoRotateSpeed={0.28}
      />
    </>
  )
}

// ─── Enhanced tooltip ─────────────────────────────────────────────────────────

const LEVEL_LABEL: Record<string, string> = {
  NONE:           'No Activity',
  FIRST_QUARTILE: 'Level 1 — Low',
  SECOND_QUARTILE:'Level 2 — Moderate',
  THIRD_QUARTILE: 'Level 3 — High',
  FOURTH_QUARTILE:'Level 4 — Very High',
}
const LEVEL_BARS: Record<string, string> = {
  NONE:           '░░░░░',
  FIRST_QUARTILE: '█░░░░',
  SECOND_QUARTILE:'██░░░',
  THIRD_QUARTILE: '████░',
  FOURTH_QUARTILE:'█████',
}
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function HoverTooltip({ t }: { t: TooltipData }) {
  const date = new Date(t.day.date + 'T00:00:00')
  const dayName = DAY_NAMES[date.getDay()]
  const monthName = date.toLocaleDateString('en-US', { month: 'long' })
  const fullDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div
      className="pointer-events-none fixed z-[9999] rounded-lg border border-accent/35 bg-[#060d07]/96 px-3.5 py-3 shadow-[0_0_28px_rgba(0,255,102,0.2)] backdrop-blur-sm"
      style={{ left: t.x + 14, top: t.y - 100 }}
    >
      <p className="font-mono text-[12px] font-bold text-white mb-0.5">{fullDate}</p>
      <p className="font-mono text-[11px] text-accent font-semibold">
        {t.day.contributionCount} contribution{t.day.contributionCount !== 1 ? 's' : ''}
      </p>
      <div className="mt-2 space-y-1 border-t border-white/8 pt-2">
        <div className="flex justify-between gap-6">
          <span className="font-mono text-[9px] tracking-widest text-[#6b7280]">DAY</span>
          <span className="font-mono text-[9px] text-[#9ca3af]">{dayName}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="font-mono text-[9px] tracking-widest text-[#6b7280]">MONTH</span>
          <span className="font-mono text-[9px] text-[#9ca3af]">{monthName}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="font-mono text-[9px] tracking-widest text-[#6b7280]">LEVEL</span>
          <span className="font-mono text-[9px] text-accent">{LEVEL_LABEL[t.day.contributionLevel]}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="font-mono text-[9px] tracking-widest text-[#6b7280]">INTENSITY</span>
          <span className="font-mono text-[9px] text-accent tracking-tight">{LEVEL_BARS[t.day.contributionLevel]}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Heatmap3D({ weeks }: { weeks: ContributionWeek[] }) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const days = useMemo<DayEntry[]>(() =>
    weeks.flatMap((week, wi) =>
      week.contributionDays.map((day, di) => ({ weekIdx: wi, dayIdx: di, data: day }))
    ), [weeks])

  const maxCount  = useMemo(() => Math.max(1, ...days.map(d => d.data.contributionCount)), [days])
  const totalWeeks = weeks.length || 52
  const centerX  = ((totalWeeks - 1) * SPACING) / 2
  const centerZ  = (6 * SPACING) / 2

  const camZ  = isMobile ? centerZ + 30 : centerZ + 24
  const camY  = isMobile ? 30 : 26
  const fov   = isMobile ? 60 : 50

  const PALETTE = ['#052d15', '#0a5226', '#008a3d', '#00c853', '#00ff66']

  return (
    <div className="relative w-full h-[340px] sm:h-[380px] lg:h-[440px]">
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10 rounded-b-xl"
        style={{ background: 'radial-gradient(ellipse at 50% 65%, transparent 45%, rgba(5,5,5,0.55) 100%)' }}
      />

      <Canvas
        camera={{ position: [centerX, camY, camZ], fov, near: 0.1, far: 600 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <HeatmapScene
          days={days}
          maxCount={maxCount}
          totalWeeks={totalWeeks}
          onTooltip={setTooltip}
        />
      </Canvas>

      {tooltip && <HoverTooltip t={tooltip} />}

      {/* Legend */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-20">
        <span className="font-mono text-[9px] tracking-widest text-[#4b5563]">LESS</span>
        {PALETTE.map(c => (
          <div key={c} className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
        ))}
        <span className="font-mono text-[9px] tracking-widest text-[#4b5563]">MORE</span>
      </div>

      {/* Interaction hint */}
      <p className="absolute bottom-3 left-4 font-mono text-[9px] tracking-widest text-[#4b5563] z-20">
        {isMobile ? 'SWIPE TO ROTATE · PINCH TO ZOOM' : 'DRAG TO ROTATE · SCROLL TO ZOOM'}
      </p>
    </div>
  )
}
