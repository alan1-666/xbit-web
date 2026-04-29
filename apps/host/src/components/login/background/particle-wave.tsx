"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"
import * as THREE from "three"

interface ParticleWaveProps {
  separation?: number
  amountX?: number
  amountY?: number
  disablePointerEvents?: boolean
  containerClassName?: string
}

export function ParticleWave({
  separation = 100,
  amountX = 50,
  amountY = 50,
  disablePointerEvents = true,
  containerClassName
}: ParticleWaveProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    const width = container.clientWidth
    const height = container.clientHeight

    // 创建场景
    const scene = new THREE.Scene()

    // 创建相机 - 调整位置以获得更好的视角
    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000)
    camera.position.set(0, 400, 800)
    camera.lookAt(0, 0, 0)

    const particles: THREE.Mesh[] = []
    const geometry = new THREE.CircleGeometry(3, 16)

    for (let ix = 0; ix < amountX; ix++) {
      for (let iy = 0; iy < amountY; iy++) {
        // 使用紫色到蓝色的渐变
        const hue = 0.7 + (ix / amountX) * 0.1
        const color = new THREE.Color().setHSL(hue, 0.8, 0.6)

        const material = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        })

        const particle = new THREE.Mesh(geometry, material)
        particle.position.x = ix * separation - (amountX * separation) / 2
        particle.position.z = iy * separation - (amountY * separation) / 2
        particle.position.y = 0
        particle.rotation.x = -Math.PI / 2

        scene.add(particle)
        particles.push(particle)
      }
    }

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    let count = 0
    let animationId: number

    // 动画循环
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      let i = 0
      for (let ix = 0; ix < amountX; ix++) {
        for (let iy = 0; iy < amountY; iy++) {
          const particle = particles[i]
          // 波浪效果
          particle.position.y = Math.sin((ix + count) * 0.3) * 30 + Math.sin((iy + count) * 0.5) * 30

          // 缩放效果
          const scale = (Math.sin((ix + count) * 0.3) + 1) * 0.5 + (Math.sin((iy + count) * 0.5) + 1) * 0.5 + 0.5
          particle.scale.set(scale, scale, scale)

          // 透明度效果
          const mat = particle.material as THREE.MeshBasicMaterial
          mat.opacity = 0.4 + scale * 0.3

          i++
        }
      }

      renderer.render(scene, camera)
      count += 0.05
    }

    // 窗口大小调整
    const handleResize = () => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener("resize", handleResize)
    animate()

    // 清理
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      particles.forEach((p) => {
        ;(p.material as THREE.MeshBasicMaterial).dispose()
      })
      geometry.dispose()
      renderer.dispose()
    }
  }, [separation, amountX, amountY])

  return (
    <div
      ref={containerRef}
      className={cn('fixed bottom-0 left-0 right-0 h-[40vh]', containerClassName)}
      style={{
        pointerEvents: disablePointerEvents ? "none" : "auto",
      }}
    />
  )
}
