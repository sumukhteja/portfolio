import { useEffect, useRef, useState } from 'react';
import india from '@svg-maps/india';
import arrowSvg from '../assets/arrow.svg';

const languages = [
  { name: "English", code: "us" },
  { name: "Hindi", code: "in" },
  { name: "Telugu", code: "in" },
  { name: "French", code: "fr" }
];

// Approximate Hyderabad position within the @svg-maps/india viewBox (0 0 612 696),
// derived from the Telangana path's bounding box + its lat/lng position within the state.
const MARKER = { x: 219, y: 467 };
const ZOOM_SCALE = 4.5;
const VIEWBOX_CENTER = { x: 306, y: 348 };
const ZOOM_TRANSFORM = `translate(${VIEWBOX_CENTER.x - ZOOM_SCALE * MARKER.x}, ${VIEWBOX_CENTER.y - ZOOM_SCALE * MARKER.y}) scale(${ZOOM_SCALE})`;

export default function Contact({ theme }) {
  const [zoomed, setZoomed] = useState(false);
  const mapWrapRef = useRef(null);

  useEffect(() => {
    const el = mapWrapRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setZoomed(true);
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mainColor = theme === 'light' ? '#000000' : '#ffffff';
  const markerRing = theme === 'light' ? '#ffffff' : '#000000';
  const stateFill = theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)';
  const stateStroke = theme === 'light' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.25)';
  const highlightFill = theme === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.14)';

  return (
    <section id="contact">
      <div className="container" data-aos="fade-up">
        <div style={{marginBottom: '5rem'}}>
          <span className="section-label">Connect</span>
          <h2 id="contact-title" className="title-large" style={{marginBottom: '2rem'}}>Connect with me</h2>

          <div style={{display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', marginTop: '2rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span style={{fontSize: '1.5rem', opacity: 1, fontWeight: '600'}}>Sumukh Teja Vanamala</span>
            </div>

            <span style={{opacity: 0.2}}>|</span>

            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <a href="mailto:sumukh.teja.vanamala@outlook.com" style={{fontSize: '1.2rem', opacity: 0.9, textDecoration: 'none'}}>Email</a>
              <img src={arrowSvg} className="nav-arrow" alt="" style={{width: '12px', opacity: 0.4}} />
            </div>

            <span style={{opacity: 0.2}}>|</span>

            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <a href="https://github.com/sumukhteja" target="_blank" rel="noreferrer" style={{fontSize: '1.2rem', opacity: 0.9, textDecoration: 'none'}}>GitHub</a>
              <img src={arrowSvg} className="nav-arrow" alt="" style={{width: '12px', opacity: 0.4}} />
            </div>

            <span style={{opacity: 0.2}}>|</span>

            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <a href="https://linkedin.com/in/sumukhteja" target="_blank" rel="noreferrer" style={{fontSize: '1.2rem', opacity: 0.9, textDecoration: 'none'}}>LinkedIn</a>
              <img src={arrowSvg} className="nav-arrow" alt="" style={{width: '12px', opacity: 0.4}} />
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '3rem', maxWidth: '1000px'}}>
            {languages.map((lang, idx) => (
              <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                <img
                  src={`https://flagcdn.com/${lang.code}.svg`}
                  alt={lang.name}
                  style={{width: '32px', height: '22px', borderRadius: '3px', objectFit: 'cover', opacity: 0.8}}
                />
                <div style={{fontSize: '1.1rem', fontWeight: '500'}}>{lang.name}</div>
              </div>
            ))}
          </div>

          <div style={{marginTop: '4rem'}}>
            <p style={{fontSize: '0.8rem', opacity: 0.4, fontFamily: 'var(--font-mono)', margin: 0}}>
              Road No 1, Banjara Hills, Hyderabad
            </p>
          </div>
        </div>

        <div
          ref={mapWrapRef}
          style={{
            width: '100%',
            height: 'clamp(280px, 45vh, 400px)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            position: 'relative'
          }}
        >
          <svg viewBox={india.viewBox} style={{ width: '100%', height: '100%' }}>
            <g
              transform={zoomed ? ZOOM_TRANSFORM : 'translate(0, 0) scale(1)'}
              style={{ transition: 'transform 3s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {india.locations.map((loc) => (
                <path
                  key={loc.id}
                  d={loc.path}
                  fill={loc.id === 'tg' ? highlightFill : stateFill}
                  stroke={stateStroke}
                  strokeWidth={0.75}
                />
              ))}
              <circle
                cx={MARKER.x}
                cy={MARKER.y}
                r={zoomed ? 2 : 4}
                fill={mainColor}
                stroke={markerRing}
                strokeWidth={1}
                style={{ transition: 'r 1s ease 2s' }}
              />
            </g>
          </svg>
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            opacity: 0.4,
            letterSpacing: '0.05em'
          }}>
            HYDERABAD, TELANGANA
          </div>
        </div>
      </div>
    </section>
  );
}
