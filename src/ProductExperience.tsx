import { useEffect, useRef, useState, useId } from 'react'
import type { ProductScene, ProductView } from './productScene'
import './product-experience.css'

const assetRoot = `${import.meta.env.BASE_URL}assets/smart-sort-3d/`
const views: [ProductView, string][] = [['overview', 'Overview'], ['front', 'Front'], ['side', 'Side'], ['detail', 'Compartments']]
export default function ProductExperience({ placement }: { placement: 'hero' | 'pricing' }) {
  const host = useRef<HTMLDivElement>(null)
  const controller = useRef<ProductScene | null>(null)
  const [mode, setMode] = useState<'loading' | 'ready' | 'fallback'>('loading')
  const [staticView, setStaticView] = useState(false)
  const [view, setView] = useState<ProductView>('overview')
  const [reason, setReason] = useState('')
  const [retry, setRetry] = useState(0)
  const instructions = useId()
  const caption = useId()
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const fallback = staticView || mode === 'fallback'

  useEffect(() => {
    if (!host.current || staticView) return
    const element = host.current
    let cancelled = false
    let started = false
    const abort = new AbortController()
    setMode('loading')
    const observer = new IntersectionObserver(async entries => {
      const visible = entries.some(entry => entry.isIntersecting)
      controller.current?.setVisible(visible)
      if (!visible || started) return
      started = true
      try {
        const { createProductScene } = await import('./productScene')
        if (cancelled) return
        const scene = createProductScene(element, {
          assetRoot,
          signal: abort.signal,
          onReady: () => { if (!cancelled) setMode('ready') },
          onError: (message: string) => {
            if (!cancelled) { setReason(message); setMode('fallback') }
          },
        })
        controller.current = scene
      } catch {
        if (!cancelled) { setReason('Interactive 3D is unavailable on this device.'); setMode('fallback') }
      }
    }, { rootMargin: '160px' })
    observer.observe(element)
    return () => {
      cancelled = true
      abort.abort()
      observer.disconnect()
      controller.current?.dispose()
      controller.current = null
    }
  }, [staticView, retry])

  const chooseView = (next: ProductView) => { controller.current?.setView(next); setView(next) }
  return <figure className={`product-experience product-experience--${placement} ${reducedMotion ? 'reduced-motion' : ''} ${mode === 'ready' && !fallback ? 'is-ready' : ''}`} aria-labelledby={caption}>
    <div className="product-stage">
      <div className="product-stage-label"><span className="product-live-dot" />SMART SORT / DESIGN IN 3D</div>
      <span className="product-stage-star" aria-hidden="true">✦</span>
      <div className="product-stage-ring ring-one" aria-hidden="true" />
      <div className="product-stage-ring ring-two" aria-hidden="true" />
      <div className="product-render" ref={host} hidden={fallback} />
      <img className={`product-poster ${fallback ? 'is-static' : ''}`} src={`${assetRoot}preview.png`} width="1000" height="1000" alt="Confirmed Smart Sort concept, with its lid raised over four laundry compartments" loading={placement === 'hero' ? 'eager' : 'lazy'} aria-hidden={!fallback && mode === 'ready'} />
      <div className="product-view-status" role="status" aria-live="polite">
        {fallback ? 'Static product preview' : mode === 'ready' ? 'Interactive 3D · ready to explore' : 'Preparing your 3D view…'}
      </div>
      {fallback && <p className="product-fallback-note">{staticView ? 'Showing the confirmed product image.' : `${reason} Showing the confirmed image instead.`}</p>}
      {!fallback && <div className="product-tools" role="group" aria-label="Product camera controls">
        <button type="button" disabled={mode !== 'ready'} onClick={() => controller.current?.zoom(0.84)} aria-label="Zoom in on Smart Sort">＋</button>
        <button type="button" disabled={mode !== 'ready'} onClick={() => controller.current?.zoom(1.19)} aria-label="Zoom out from Smart Sort">−</button>
        <span />
        <button type="button" disabled={mode !== 'ready'} onClick={() => chooseView('overview')} aria-label="Reset Smart Sort view">Reset ↺</button>
      </div>}
    </div>
    <div className="product-view-tabs" role="group" aria-label="Explore Smart Sort views">
      {views.map(([value, label]) => <button type="button" key={value} aria-pressed={view === value && !fallback} disabled={mode !== 'ready' || fallback} onClick={() => chooseView(value)}>{label}</button>)}
    </div>
    <figcaption id={caption} className="product-experience-caption"><span>01 / A CLOSER LOOK AT THE CONCEPT</span><button type="button" onClick={() => { if (fallback) { setStaticView(false); setReason(''); setRetry(value => value + 1) } else setStaticView(true) }}>{fallback ? 'Explore in 3D ↗' : 'View static preview'}</button></figcaption>
    <p className="product-interaction-hint" id={instructions}>{fallback ? 'Static preview · interaction unavailable in this view.' : 'Drag or swipe to rotate · Use + / − to zoom · Arrow keys to rotate'}</p>
    <p className="product-detail-caption">{!fallback && view === 'detail' ? 'Four compartments separate colors, whites, delicates, and non-washables in this design concept.' : 'Confirmed design prototype · Automatic sorting performance remains untested.'}</p>
  </figure>
}
