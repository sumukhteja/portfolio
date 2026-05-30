import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const slides = [
  {
    label: "Identity / 01",
    title: ["Backend &", "Cloud Engineer."],
    bio: "Sumukh Teja Vanamala. Founded The Explorer, built close to 200 projects in a year — backend, cloud and AI, end to end. Ex-Accenture.",
    sec: "Open to backend and cloud roles. On-site, hybrid or remote."
  },
  {
    label: "Focus / 02",
    title: ["Builder of", "Systems."],
    bio: "RAG pipelines, local LLMs, a custom database engine, serverless AWS infrastructure, and a search engine in Rust compiled to WebAssembly.",
    sec: "I learn by building and shipping, not by reading theory."
  },
  {
    label: "Intelligence / 03",
    title: ["AI &", "Automation."],
    bio: "End-to-end AI: FAISS vector search, Neo4j knowledge graphs, Ollama local inference, OCR pipelines, live voice agents with TTS/STT.",
    sec: "Bridging raw data and actionable intelligence."
  }
];

export default function Hero() {
  return (
    <section id="hero">
      <div className="container" data-aos="fade-up">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={true}
          style={{ width: '100%', height: '100%' }}
          className="hero-swiper"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx} style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
              <div className="hero-text" style={{ width: '100%' }}>
                <span className="section-label">{slide.label}</span>
                <h1 className="title-large" style={{fontSize: 'clamp(3.5rem, 12vw, 8rem)', marginBottom: '3.5rem'}}>
                  {slide.title[0]} <br /> {slide.title[1]}
                </h1>
                
                <div style={{maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2.5rem'}}>
                  <p style={{ fontSize: '2rem', lineHeight: '1.2', fontWeight: '400' }}>
                    {slide.bio}
                  </p>
                  <p style={{ fontSize: '1.4rem', opacity: 0.6, lineHeight: '1.6', fontWeight: '300' }}>
                    {slide.sec}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="scroll-indicator">Scroll to Explore</div>
    </section>
  );
}
