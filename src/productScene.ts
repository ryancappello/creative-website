import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

export type ProductView = 'overview' | 'front' | 'side' | 'detail'
export interface ProductScene {
  setVisible: (visible: boolean) => void
  setView: (view: ProductView) => void
  zoom: (factor: number) => void
  dispose: () => void
}
interface Options { assetRoot: string; signal: AbortSignal; onReady: () => void; onError: (message: string) => void }
interface Manifest {
  schemaVersion: string
  modelName: string
  dimensions: { units: string; size: number[] }
  camera: { position: number[]; target: number[] }
  integrity: { algorithm: string; model: string }
  lighting: string
  background: string
}
export function createProductScene(host: HTMLDivElement, options: Options): ProductScene {
  const { signal } = options
  const canvas = document.createElement('canvas')
  // Use the same fallback for unsupported WebGL, context loss and asset errors.
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true })
  if (!context) throw new Error('WebGL 2 is unavailable')
  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1.5 : 1.75))
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  canvas.tabIndex = 0
  canvas.setAttribute('role', 'img')
  canvas.setAttribute('aria-label', 'Interactive Smart Sort product model. Drag or swipe to rotate, use arrow keys to turn, or use the camera buttons below.')
  host.appendChild(canvas)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 50)
  camera.position.set(2, 1.8, 3)
  const controls = new OrbitControls(camera, canvas)
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  canvas.dataset.motion = motion.matches ? 'reduced' : 'standard'
  controls.enableDamping = !motion.matches
  controls.dampingFactor = 0.09
  controls.enablePan = false
  controls.enableZoom = false // Page scroll remains available; explicit controls handle zoom.
  controls.minPolarAngle = Math.PI * 0.13
  controls.maxPolarAngle = Math.PI * 0.68
  controls.rotateSpeed = 0.65
  canvas.style.touchAction = 'pan-y'
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }
  const ambient = new THREE.HemisphereLight(0xe4f4ee, 0x273a3f, 1.5)
  scene.add(ambient)
  const key = new THREE.DirectionalLight(0xfff7e8, 2.5)
  key.position.set(3, 5, 4)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.left = key.shadow.camera.bottom = -2
  key.shadow.camera.right = key.shadow.camera.top = 2
  key.shadow.normalBias = 0.015
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xd8f1c0, 1.5)
  rim.position.set(-3, 2, -2)
  scene.add(rim)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, 0.02)
  scene.environment = environment.texture
  room.dispose()
  pmrem.dispose()
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.3 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  let disposed = false, visible = true, dirty = true, loaded = false
  let currentView: ProductView = 'overview'
  let bounds = new THREE.Box3()
  const center = new THREE.Vector3()
  const size = new THREE.Vector3(1, 1.6, 0.7)
  let manifest: Manifest | undefined
  let transition: { start: number; from: THREE.Vector3; to: THREE.Vector3; targetFrom: THREE.Vector3; targetTo: THREE.Vector3 } | null = null
  const invalidate = () => { dirty = true }
  controls.addEventListener('change', invalidate)
  controls.addEventListener('start', () => { transition = null })
  const setView = (view: ProductView, animate = true) => {
    if (!loaded) return
    currentView = view
    const target = center.clone()
    let direction = new THREE.Vector3(0.75, 0.5, 1)
    if (manifest?.camera) direction.fromArray(manifest.camera.position).sub(new THREE.Vector3().fromArray(manifest.camera.target)).normalize()
    if (view === 'front') direction.set(0, 0.12, 1)
    if (view === 'side') direction.set(1, 0.18, 0.02)
    if (view === 'detail') { direction.set(0.2, 1.15, 1); target.y = bounds.min.y + size.y * 0.60 }
    const vertical = THREE.MathUtils.degToRad(camera.fov)
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect)
    // Fit the full rotated footprint as well as height on narrow screens.
    const footprint = Math.hypot(size.x, size.z)
    const distance = Math.max(size.y / (2 * Math.tan(vertical / 2)), footprint / (2 * Math.tan(horizontal / 2))) * (view === 'detail' ? 0.94 : 1.16)
    const position = target.clone().add(direction.normalize().multiplyScalar(distance))
    controls.minDistance = distance * 0.6
    controls.maxDistance = distance * 1.6
    if (animate && !motion.matches) {
      transition = { start: performance.now(), from: camera.position.clone(), to: position, targetFrom: controls.target.clone(), targetTo: target }
    } else {
      transition = null
      camera.position.copy(position)
      controls.target.copy(target)
      controls.update()
    }
    invalidate()
  }
  const resize = () => {
    const width = host.clientWidth, height = host.clientHeight
    if (!width || !height || disposed) return
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    setView(currentView, false)
    invalidate()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  resize()
  const onMotion = () => { canvas.dataset.motion = motion.matches ? 'reduced' : 'standard'; controls.enableDamping = !motion.matches; if (motion.matches && transition) { camera.position.copy(transition.to); controls.target.copy(transition.targetTo); transition = null; controls.update() } invalidate() }
  motion.addEventListener('change', onMotion)
  const onKey = (event: KeyboardEvent) => {
    if (!loaded) return
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault()
      transition = null
      const offset = camera.position.clone().sub(controls.target)
      const spherical = new THREE.Spherical().setFromVector3(offset)
      if (event.key === 'ArrowLeft') spherical.theta -= 0.12
      if (event.key === 'ArrowRight') spherical.theta += 0.12
      if (event.key === 'ArrowUp') spherical.phi -= 0.1
      if (event.key === 'ArrowDown') spherical.phi += 0.1
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle)
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical))
      controls.update(); invalidate()
    }
  }
  canvas.addEventListener('keydown', onKey)
  const onLost = (event: Event) => { event.preventDefault(); renderer.setAnimationLoop(null); options.onError('The 3D graphics connection was interrupted.') }
  canvas.addEventListener('webglcontextlost', onLost)
  const onVisibility = () => { if (!document.hidden) invalidate() }
  document.addEventListener('visibilitychange', onVisibility)
  renderer.setAnimationLoop(time => {
    if (disposed || !visible || document.hidden) return
    if (transition) {
      const t = Math.min(1, (time - transition.start) / 500)
      const eased = 1 - Math.pow(1 - t, 3)
      camera.position.lerpVectors(transition.from, transition.to, eased)
      controls.target.lerpVectors(transition.targetFrom, transition.targetTo, eased)
      dirty = true
      if (t === 1) transition = null
    }
    const changed = controls.update()
    if (dirty || changed) { renderer.render(scene, camera); dirty = false }
  })
  async function load() {
    try {
      const [manifestResponse, modelResponse] = await Promise.all([
        fetch(options.assetRoot + 'model-manifest.json', { signal }),
        fetch(options.assetRoot + 'model.glb', { signal }),
      ])
      if (!manifestResponse.ok || !modelResponse.ok) throw new Error('asset response')
      manifest = await manifestResponse.json() as Manifest
      if (manifest.schemaVersion !== '1.0.0' || manifest.dimensions.units !== 'm') throw new Error('unsupported model metadata')
      const bytes = await modelResponse.arrayBuffer()
      const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))
      const hash = Array.from(digest, n => n.toString(16).padStart(2, '0')).join('')
      if (manifest.integrity.algorithm !== 'SHA-256' || hash !== manifest.integrity.model) throw new Error('checksum mismatch')
      if (disposed || signal.aborted) return
      const gltf = await new GLTFLoader().parseAsync(bytes, '')
      if (disposed || signal.aborted) { disposeObject(gltf.scene); return }
      let meshes = 0
      gltf.scene.traverse(object => {
        if (object instanceof THREE.Mesh) { object.castShadow = object.receiveShadow = true; meshes++ }
      })
      if (!meshes) throw new Error('no geometry')
      scene.add(gltf.scene)
      bounds = new THREE.Box3().setFromObject(gltf.scene)
      if (bounds.isEmpty()) throw new Error('empty model')
      bounds.getCenter(center); bounds.getSize(size)
      floor.position.y = bounds.min.y - 0.008
      // The confirmed model remains unchanged; only its display camera and lighting adapt to the brand.
      ambient.intensity = manifest.lighting === 'Evening' ? 1 : 1.5
      loaded = true
      setView('overview', false)
      renderer.render(scene, camera)
      options.onReady()
    } catch {
      if (!disposed && !signal.aborted) options.onError('Interactive 3D could not be loaded.')
    }
  }
  void load()
  function disposeObject(object: THREE.Object3D) {
    object.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach(material => {
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose()
          material.dispose()
        })
      }
    })
  }
  return {
    setVisible(value) { visible = value; invalidate() },
    setView(view) { setView(view) },
    zoom(factor) {
      if (!loaded) return
      transition = null
      const offset = camera.position.clone().sub(controls.target)
      const distance = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance)
      camera.position.copy(controls.target).add(offset.setLength(distance))
      controls.update(); invalidate()
    },
    dispose() {
      disposed = true
      observer.disconnect()
      renderer.setAnimationLoop(null)
      controls.removeEventListener('change', invalidate)
      controls.dispose()
      canvas.removeEventListener('keydown', onKey)
      canvas.removeEventListener('webglcontextlost', onLost)
      motion.removeEventListener('change', onMotion)
      document.removeEventListener('visibilitychange', onVisibility)
      disposeObject(scene)
      environment.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}
