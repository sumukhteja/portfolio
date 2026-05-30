import { useState } from 'react';
import accentureLogo from '../assets/accenture-logo.png';
import flyberryLogo from '../assets/flyberry.png';
import ExplorerLogo from './ExplorerLogo';
const experiences = [
  {
    company: "The Explorer",
    role: "Founder",
    period: "JUN 2025 — PRESENT",
    logo: null,
    logoClass: "",
    explorerLogo: true,
    summary: "Built the AI layer, backend infrastructure, automation pipelines, and interactive data visualisations end to end.",
    points: [
      "Built RAG pipelines over a large document corpus using FAISS, Neo4j knowledge graphs and local LLMs via Ollama, with OCR to extract text from PDFs and scans, and MCP servers that expose custom tools to models.",
      "Built a custom page-based database engine tuned for high-concurrency retrieval, a Protocol Buffers service on FastAPI, JWT auth, and lower-level work in Go and C.",
      "Built content and data automation pipelines covering multi-source ingestion and scraping, audio generation with TTS and STT including low-latency live voice agents, and programmatic document generation with LaTeX.",
      "Built interactive data visualisations using D3.js, Leaflet, Mapbox, Cesium and TopoJSON — choropleths, knowledge graphs, scrollytelling and custom relief-map rendering.",
      "Shipped across web apps, Electron desktop tools, mobile via Capacitor, Chrome extensions and browser-based interactive experiences."
    ]
  },
  {
    company: "Flyberry Gourmet",
    role: "Automation Engineer — Python | Flask | pandas | Cloudflare | Railway",
    period: "SEP 2025 — OCT 2025",
    logo: flyberryLogo,
    logoClass: "flyberry-logo",
    summary: "Built a full-stack Purchase Order processing tool that automates extraction of line items, pricing, delivery locations and HSN codes from PO PDFs.",
    points: [
      "Developed a Flask REST API with endpoints for PDF upload, table extraction using pdfplumber, structured CSV generation, and ZIP-based bulk download, with error handling for invalid files and parsing failures.",
      "Deployed a decoupled architecture with the frontend on Cloudflare Pages and backend on Railway, configuring CORS policies, gunicorn serving, and environment-based API URL management for production readiness.",
      "Replaced manual data entry for the procurement team, saving hours of effort per week."
    ]
  },
  {
    company: "Accenture",
    role: "Software Engineering Associate — .NET | C# | Oracle SQL | VBA",
    period: "JAN 2022 — APR 2023",
    logo: accentureLogo,
    logoClass: "accenture-logo",
    summary: "Maintained and enhanced a C#/.NET Framework WinForms desktop application supporting policy and claims workflows for a Fortune 500 specialty insurer.",
    points: [
      "Wrote and optimized Oracle SQL queries and PL/SQL stored procedures, tuning data retrieval across large policy tables to improve performance.",
      "Built Excel-based reporting and reconciliation tools using VBA macros and Power Query, automating data extraction and transformation to cut manual effort.",
      "Performed RCA on production defects across the .NET front end and Oracle data layer, resolving recurring incidents via ServiceNow, documented using Jira.",
      "Delivered changes in an Agile/Scrum model, collaborating with QA and business analysts to translate requirements through to UAT and release."
    ]
  }
];

export default function Experience() {
  const [expanded, setExpanded] = useState(null);

  const toggle = (idx) => {
    setExpanded(expanded === idx ? null : idx);
  };

  return (
    <section id="experience">
      <div className="container" data-aos="fade-up">
        <span className="section-label">Journey</span>
        <h2 className="title-large" style={{marginBottom: '4rem'}}>Past Experience</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {experiences.map((exp, idx) => (
            <div
              key={idx}
              onClick={() => toggle(idx)}
              className={`experience-card interactive-exp-card ${expanded === idx ? 'expanded' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden',
                padding: '2rem 0',
                borderTop: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                  {exp.explorerLogo ? (
                    <ExplorerLogo size={40} />
                  ) : exp.logo ? (
                    <img
                      src={exp.logo}
                      className={`exp-inline-logo ${exp.logoClass || ''}`}
                      alt=""
                      style={{
                        height: '40px',
                        width: 'auto',
                        objectFit: 'contain',
                        opacity: 0.9
                      }}
                    />
                  ) : null}
                  <div>
                    <h3 style={{fontSize: '2rem', marginBottom: '0.2rem'}}>{exp.company}</h3>
                    <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.5}}>{exp.role} / {exp.period}</p>
                  </div>
                </div>
                <div style={{
                  fontSize: '1.2rem',
                  opacity: 0.3,
                  transform: expanded === idx ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 0.5s ease'
                }}>
                  +
                </div>
              </div>

              <p style={{fontSize: '1.2rem', lineHeight: '1.4', opacity: 0.9, position: 'relative', zIndex: 1, margin: 0, fontWeight: '500'}}>
                {exp.summary}
              </p>

              <div
                className="exp-details-wrapper"
                style={{
                  maxHeight: expanded === idx ? '600px' : '0',
                  opacity: expanded === idx ? 1 : 0,
                  marginTop: expanded === idx ? '1.5rem' : '0',
                  overflow: 'hidden',
                  transition: 'all 0.8s cubic-bezier(0.2, 1, 0.2, 1)'
                }}
              >
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {exp.points.map((point, i) => (
                    <li key={i} style={{fontSize: '1rem', lineHeight: '1.4', opacity: 0.6, display: 'flex', gap: '1rem'}}>
                      <span style={{opacity: 0.3}}>—</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {!expanded && (
                <div className="exp-hint" style={{fontSize: '0.6rem', fontFamily: 'var(--font-mono)', opacity: 0.2, marginTop: '0.5rem'}}>
                  CLICK TO VIEW DETAILS
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
