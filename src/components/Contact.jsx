import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { annotation, annotationCalloutCircle } from 'd3-svg-annotation';
import arrowSvg from '../assets/arrow.svg';

const languages = [
  { name: "English", code: "us", level: "Professional" },
  { name: "Telugu", code: "in", level: "Native" },
  { name: "Hindi", code: "in", level: "Native" },
  { name: "French", code: "fr", level: "Professional" },
  { name: "Spanish", code: "es", level: "Conversational" }
];

export default function Contact({ theme }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const svgRef = useRef(null);
  const markerRef = useRef(null);

  const updateAnnotation = () => {
    if (!mapInstanceRef.current || !svgRef.current) return;
    
    const map = mapInstanceRef.current;
    const myLocation = [78.4485, 17.4255];
    const point = map.project(myLocation);
    
    const mainColor = "#ffffff";
    const subColor = "#888888";

    const annotations = [{
      note: { label: "Banjara Hills", title: "Residence", wrap: 150 },
      dy: -60, dx: 100, x: point.x, y: point.y,
      type: annotationCalloutCircle,
      subject: { radius: 50, radiusPadding: 5 }
    }];

    const makeAnnotations = annotation()
      .editMode(false)
      .notePadding(15)
      .type(annotationCalloutCircle)
      .annotations(annotations);

    const svg = d3.select(svgRef.current);
    svg.selectAll(".annotation-group").data([0]).join("g").attr("class", "annotation-group").call(makeAnnotations);
    
    svg.selectAll(".connector, .subject").style("stroke", mainColor).style("stroke-width", "1px");
    svg.selectAll(".note-line").style("stroke", mainColor).style("opacity", "0.3");
    svg.selectAll(".annotation-note-title").style("fill", mainColor).style("font-size", "1rem");
    svg.selectAll(".annotation-note-label").style("fill", subColor).style("font-size", "0.7rem");
    
    if (markerRef.current) {
      const el = markerRef.current.getElement();
      el.style.background = "#ffffff";
      el.style.border = "2px solid #000000";
      el.style.boxShadow = "0 0 0 3px #ffffff, 0 0 10px rgba(255,255,255,0.5)";
    }
  };

  useEffect(() => {
    let map;
    let pollInterval;

    const initMap = () => {
      if (typeof window === 'undefined' || !window.mapboxgl || mapInstanceRef.current) return;
      clearInterval(pollInterval);
      window.mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

      if (!mapContainerRef.current) return;

      try {
        map = new window.mapboxgl.Map({
          container: mapContainerRef.current,
          style: theme === 'light' ? 'mapbox://styles/mapbox/light-v11' : 'mapbox://styles/mapbox/dark-v11',
          center: [78.4485, 17.4255],
          zoom: 12,
          minZoom: 5,
          maxZoom: 14,
          interactive: true,
          scrollZoom: false,
          attributionControl: false,
        });

        map.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
        mapInstanceRef.current = map;

        map.on('load', () => {
          const myLocation = [78.4485, 17.4255];
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.width = '12px'; el.style.height = '12px';
          el.style.background = '#ffffff'; el.style.borderRadius = '50%';
          el.style.border = '2px solid #000000';
          el.style.boxShadow = '0 0 0 3px #ffffff, 0 0 10px rgba(255,255,255,0.5)';

          markerRef.current = new window.mapboxgl.Marker(el).setLngLat(myLocation).addTo(map);

          map.on('move', updateAnnotation);
          updateAnnotation();
        });

        setTimeout(() => map.resize(), 1000);
      } catch (err) { console.error("Mapbox init failed:", err); }
    };

    if (window.mapboxgl) { initMap(); }
    else { pollInterval = setInterval(() => { if (window.mapboxgl) initMap(); }, 200); }

    return () => {
      clearInterval(pollInterval);
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [theme]);

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
              <a href="tel:+918374822724" style={{fontSize: '1.2rem', opacity: 0.9, textDecoration: 'none'}}>+91 8374822724</a>
            </div>
            
            <span style={{opacity: 0.2}}>|</span>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <a href="mailto:sunny.vanamala4@gmail.com" style={{fontSize: '1.2rem', opacity: 0.9, textDecoration: 'none'}}>Email</a>
              <img src={arrowSvg} className="nav-arrow" alt="" style={{width: '12px', opacity: 0.4}} />
            </div>

            <span style={{opacity: 0.2}}>|</span>

            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <a href="https://github.com/sumukhteja" target="_blank" rel="noreferrer" style={{fontSize: '1.2rem', opacity: 0.9, textDecoration: 'none'}}>GitHub</a>
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
                <div>
                  <div style={{fontSize: '1.1rem', fontWeight: '500'}}>{lang.name}</div>
                  <div style={{fontSize: '0.7rem', opacity: 0.5, fontFamily: 'var(--font-mono)'}}>{lang.level}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'flex-start'}}>
            <a 
              href="/resume.pdf" 
              download="Sumukh_Teja_Vanamala_Resume.pdf"
              className="tag" 
              style={{
                fontSize: '0.9rem', 
                padding: '12px 24px', 
                background: 'var(--text)',
                color: 'var(--bg)',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block'
              }}
            >
              Resume [PDF]
            </a>
            <p style={{fontSize: '0.8rem', opacity: 0.4, fontFamily: 'var(--font-mono)', margin: 0}}>
              Road No 1, Banjara Hills, Hyderabad
            </p>
          </div>
        </div>

        <div style={{
          width: '100%', 
          height: '400px', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          border: '1px solid var(--border)',
          position: 'relative'
        }}>
          <div id="mapbox-container" ref={mapContainerRef} style={{height: '100%', width: '100%'}}></div>
          <svg id="mapbox-overlay" ref={svgRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}></svg>
        </div>
      </div>
    </section>
  );
}
