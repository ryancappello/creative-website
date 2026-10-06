import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import Footer from './Footer'

export const SHOP = 'https://shop.merch.google/product/for-everyone-google-tee-ggoegxxx1802'
const asset = (name: string) => `${import.meta.env.BASE_URL}assets/tee/${name}.jpg`
const benefits = [
  { number: '01', title: 'Create your own thing.', copy: 'From the first sketch to the final project. Wear a little reminder that your ideas belong here.', image: 'print', alt: 'Colorful Create Design Code Build for everyone embroidery on the black tee' },
  { number: '02', title: 'Made for everyday.', copy: '100% combed ringspun cotton fine jersey. A lightweight 4.3 oz. tee for class, study sessions, and everything after.', image: 'collar', alt: 'Close-up of the Google Tee crew neckline and interior label' },
  { number: '03', title: 'A fit for everyone.', copy: 'A unisex fit and side-seamed construction. One black tee. Plenty of ways to make it yours.', image: 'front', alt: 'Full front view of the black For Everyone Google Tee' },
]
export default function App() {
  const scene = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: scene, offset: ['start start', 'end end'] })
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 8])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.08, 0.96])
  const y = useTransform(scrollYProgress, [0, 1], [20, -35])
  return <>
    <header className="nav"><a href="#home" className="wordmark"><span className="spark">✦</span> For Everyone<span className="nav-dot">.</span></a><nav aria-label="Main navigation"><a href="#details">The tee</a><a href="#story">The idea</a><a href="#get-it">Make it yours</a></nav><a href={SHOP} className="nav-shop" target="_blank" rel="noopener noreferrer">Shop Google ↗</a></header>
    <main>
      <section id="home" className="hero">
        <div className="hero-copy"><span className="eyebrow"><span className="status-dot"/> FOR THE NEXT THING YOU MAKE</span><h1>Create.<br/>Build.<br/><span>Belong.</span></h1><p>Your ideas. Your people. Your everyday tee.<br/>The For Everyone Google Tee brings a little maker energy to campus and beyond.</p><div className="hero-actions"><a className="button primary" href={SHOP} target="_blank" rel="noopener noreferrer">Get the tee — $32 ↗</a><a className="button secondary" href="#details">Explore the details ↓</a></div><div className="hero-note">FOR EVERYONE GOOGLE TEE · BLACK · UNISEX</div></div>
        <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="art-label">A LITTLE GOOGLE.<br/>A LOT OF YOU.</span><motion.img src={asset('front')} alt="Black For Everyone Google Tee with colorful chest embroidery and Google sleeve logo" initial={{opacity:0,rotate:-12,y:40}} animate={{opacity:1,rotate:-6,y:0}} transition={{duration:0.9}}/><div className="price-tag"><span>Everyday inspiration</span><strong>$32<span>.00</span></strong><small>USD · Check sizes at Google Merch Shop</small></div></div>
        <div className="hero-bottom"><span>CLASS. CODE. COFFEE. REPEAT.</span><span>SCROLL TO MAKE IT YOURS ↓</span></div>
      </section>
      <div className="ticker" aria-hidden="true">CREATE <span>✦</span> DESIGN <span>✦</span> CODE <span>✦</span> BUILD <span>✦</span> FOR EVERYONE <span>✦</span></div>
      <section ref={scene} id="details" className="scroll-scene"><div className="sticky-product"><div className="scene-heading"><span className="eyebrow">01 / THE EVERYDAY ORIGINAL</span><h2>Big ideas.<br/><span>Easy wear.</span></h2></div><motion.img style={{rotate,scale,y}} src={asset('front')} alt="For Everyone Google Tee, black unisex cotton shirt"/><span className="scene-caption">100% COTTON. 100% YOUR ENERGY.</span></div><div className="benefits">{benefits.map(b=><motion.article className="benefit" key={b.number} initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.3}} transition={{duration:0.6}}><div className="benefit-top"><span>{b.number}</span><span>FOR EVERYONE</span></div><img src={asset(b.image)} alt={b.alt} loading="lazy"/><h3>{b.title}</h3><p>{b.copy}</p></motion.article>)}</div></section>
      <section id="story" className="story"><span className="eyebrow">02 / MORE THAN A LOGO</span><h2>For the people<br/>who <span>make things.</span></h2><div className="story-bottom"><p>A group project. A side hustle. Your first line of code. Whatever you’re working on, this tee is a reminder: creating, designing, coding, and building are for everyone.</p><p>For students, college crews, and anyone with a soft spot for Google. Keep it casual. Bring your curiosity. Make something that feels like you.</p></div><div className="color-line"><i/><i/><i/><i/></div></section>
      <section id="get-it" className="final-cta"><img src={asset('print')} alt="Create Design Code Build for everyone embroidered message" loading="lazy"/><div><span className="eyebrow">03 / YOUR NEXT EVERYDAY FAVORITE</span><h2>Make it<br/><span>yours.</span></h2><p>For Everyone Google Tee<br/>Black · Unisex fit · 100% cotton</p><a className="button primary" href={SHOP} target="_blank" rel="noopener noreferrer">Shop the tee — $32 ↗</a><small>Choose your size and purchase at Google Merch Shop.<br/>Current price and availability are confirmed there.</small></div></section>
    </main><Footer/>
  </>
}
