'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '@/components/providers/ThemeProvider'

interface PremiumBackgroundProps {
  className?: string
  variant?: 'ribbon' | 'orbs' | 'grid'
}

// Premium, classy 3D animated background using Three.js
// - Theme-aware colors
// - Subtle motion and parallax
// - Efficient: single mesh, low poly, no heavy post-processing
export default function PremiumBackground({ className, variant = 'ribbon' }: PremiumBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { resolvedTheme } = useTheme()

  // Colors derived from theme
  const { bgColor, accentColor, gradientTop, gradientBottom } = useMemo(() => {
    const isDark = resolvedTheme === 'dark'
    return {
      bgColor: new THREE.Color(isDark ? 0x0b1220 : 0xf7fafc),
      accentColor: new THREE.Color(0x14b8a6), // Tailwind primary-500 teal for both themes
      gradientTop: new THREE.Color(isDark ? 0x0b1220 : 0xebf5ff),
      gradientBottom: new THREE.Color(isDark ? 0x0f172a : 0xffffff),
    }
  }, [resolvedTheme])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(0, 0.2, 3.5)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0) // transparent to blend with page bg
    container.appendChild(renderer.domElement)

    // Gradient background via large plane with vertex colors
    const bgGeometry = new THREE.PlaneGeometry(10, 10, 1, 1)
    const bgMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: gradientTop },
        bottomColor: { value: gradientBottom },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec2 vUv;
        void main() {
          vec3 color = mix(bottomColor, topColor, smoothstep(0.0, 1.0, vUv.y));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      depthWrite: false,
    })
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial)
    bgMesh.position.z = -5
    scene.add(bgMesh)

    // Scene contents by variant
    let cleanupFns: Array<() => void> = []
    let animateVariant: (t: number) => void = () => {}

    if (variant === 'ribbon') {
      // Premium ribbon shape (noisy tube)
      const points: THREE.Vector3[] = []
      const segments = 200
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const angle = t * Math.PI * 2.0
        const radius = 0.65 + 0.15 * Math.sin(angle * 1.5)
        const x = Math.cos(angle) * radius
        const y = (t - 0.5) * 0.8 + 0.08 * Math.sin(angle * 2.0)
        const z = Math.sin(angle) * radius
        points.push(new THREE.Vector3(x, y, z))
      }
      const path = new THREE.CatmullRomCurve3(points)
      const tubeGeometry = new THREE.TubeGeometry(path, 800, 0.045, 32, false)

      const ribbonMaterial = new THREE.MeshPhysicalMaterial({
        color: accentColor,
        metalness: 0.8,
        roughness: 0.25,
        clearcoat: 1.0,
        clearcoatRoughness: 0.2,
        sheen: 1.0,
        sheenRoughness: 0.5,
        sheenColor: accentColor,
        side: THREE.DoubleSide,
        envMapIntensity: 0.6,
      })
      const ribbon = new THREE.Mesh(tubeGeometry, ribbonMaterial)
      scene.add(ribbon)

      // Subtle particles for depth
      const particleGeometry = new THREE.BufferGeometry()
      const particleCount = 350
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        positions[i3 + 0] = (Math.random() - 0.5) * 6
        positions[i3 + 1] = (Math.random() - 0.5) * 3
        positions[i3 + 2] = -1.5 - Math.random() * 2.5
        const c = new THREE.Color(bgColor).lerp(accentColor, Math.random() * 0.6)
        colors[i3 + 0] = c.r
        colors[i3 + 1] = c.g
        colors[i3 + 2] = c.b
      }
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({ size: 0.01, vertexColors: true, transparent: true, opacity: 0.9 })
      )
      scene.add(particles)

      animateVariant = (t: number) => {
        ribbon.rotation.y = t * 0.15
        ribbon.rotation.x = Math.sin(t * 0.2) * 0.1
        particles.rotation.z = t * 0.02
      }

      cleanupFns.push(() => {
        tubeGeometry.dispose()
        particleGeometry.dispose()
      })
    } else if (variant === 'orbs') {
      // Floating glossy orbs
      const group = new THREE.Group()
      scene.add(group)
      const orbCount = 8
      const geometries: THREE.SphereGeometry[] = []
      const meshes: THREE.Mesh[] = []
      for (let i = 0; i < orbCount; i++) {
        const radius = 0.18 + Math.random() * 0.12
        const geo = new THREE.SphereGeometry(radius, 48, 48)
        const hueShift = Math.random() * 0.1
        const color = new THREE.Color(accentColor).offsetHSL(hueShift, 0, 0)
        const mat = new THREE.MeshPhysicalMaterial({
          color,
          metalness: 0.6,
          roughness: 0.15,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          transmission: 0.25,
          thickness: 0.5,
          envMapIntensity: 1.0,
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(
          (Math.random() - 0.5) * 2.2,
          (Math.random() - 0.3) * 1.6,
          -0.6 - Math.random() * 0.8
        )
        meshes.push(mesh)
        geometries.push(geo)
        group.add(mesh)
      }

      animateVariant = (t: number) => {
        meshes.forEach((m, idx) => {
          const speed = 0.4 + idx * 0.03
          m.position.y += Math.sin(t * speed + idx) * 0.0009
          m.position.x += Math.cos(t * (speed * 0.8) + idx * 0.5) * 0.0007
          m.rotation.y += 0.003
        })
      }

      cleanupFns.push(() => {
        geometries.forEach(g => g.dispose())
      })
    } else if (variant === 'grid') {
      // Elegant animated grid surface
      const gridGeometry = new THREE.PlaneGeometry(6, 3, 100, 50)
      const gridMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(bgColor).lerp(accentColor, 0.1),
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      })
      const grid = new THREE.Mesh(gridGeometry, gridMaterial)
      grid.rotation.x = -Math.PI * 0.28
      grid.position.z = -1.2
      scene.add(grid)

      animateVariant = (t: number) => {
        const pos = gridGeometry.attributes.position as THREE.BufferAttribute
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i)
          const y = pos.getY(i)
          const wave = Math.sin(x * 1.2 + t * 0.8) * 0.03 + Math.cos(y * 1.4 + t * 0.6) * 0.02
          pos.setZ(i, wave)
        }
        pos.needsUpdate = true
      }

      cleanupFns.push(() => {
        gridGeometry.dispose()
      })
    }

    // Lighting that respects theme
    const ambient = new THREE.AmbientLight(bgColor, 0.6)
    scene.add(ambient)
    const mainLight = new THREE.DirectionalLight(accentColor, 0.9)
    mainLight.position.set(2.5, 1.5, 2.0)
    scene.add(mainLight)
    const rimLight = new THREE.DirectionalLight(new THREE.Color(0xffffff), 0.25)
    rimLight.position.set(-1.5, -0.5, -2.0)
    scene.add(rimLight)

    // Responsive
    const onResize = () => {
      if (!container) return
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    // Mouse parallax
    const pointer = new THREE.Vector2(0, 0)
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    }
    container.addEventListener('pointermove', onPointerMove)

    // Animate
    let raf = 0
    const clock = new THREE.Clock()
    const animate = () => {
      const t = clock.getElapsedTime()
      animateVariant(t)
      camera.position.x = pointer.x * 0.1
      camera.position.y = pointer.y * 0.05
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      container.removeEventListener('pointermove', onPointerMove)
      renderer.dispose()
      cleanupFns.forEach(fn => fn())
      ;(bgGeometry as any).dispose?.()
      container.removeChild(renderer.domElement)
    }
  }, [bgColor, accentColor, gradientTop, gradientBottom, resolvedTheme, variant])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 -z-10 overflow-hidden ${className || ''}`}
      aria-hidden="true"
    />
  )
}


