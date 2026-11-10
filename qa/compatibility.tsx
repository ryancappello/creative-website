// Local-only fixtures exercise actual error and reduced-motion paths without changing device settings.
import { createRoot } from 'react-dom/client'
import ProductExperience from '../src/ProductExperience'
import '../src/index.css'
const reduced = new URLSearchParams(location.search).has('reduced')
if (reduced) {
  const originalMedia = window.matchMedia.bind(window)
  window.matchMedia = (query: string) => {
    const media = originalMedia(query)
    if (query !== '(prefers-reduced-motion: reduce)') return media
    return new Proxy(media, { get(target, property) {
      if (property === 'matches') return true
      const value = Reflect.get(target, property, target)
      return typeof value === 'function' ? value.bind(target) : value
    } })
  }
} else {
  const original = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
    if (type === 'webgl' || type === 'webgl2') return null
    return Reflect.apply(original, this, [type, ...args])
  } as typeof original
}
createRoot(document.getElementById('root')!).render(<main style={{ maxWidth: 500, margin: '30px auto' }}><h1 style={{ fontSize: 28 }}>{reduced ? 'Reduced motion test' : 'WebGL unavailable test'}</h1><ProductExperience placement="hero" /></main>)
