import { useState } from 'react';
import accentureLogo from '../assets/accenture-logo.png';
import flyberryLogo from '../assets/flyberry.png';
import girgitLogo from '../assets/girgit.svg';
const experiences = [
  {
    company: "Girgit Inc",
    role: "Senior Developer",
    period: "AUG 2023 — PRESENT",
    logo: girgitLogo,
    logoClass: "girgit-logo",
    summary: "Built event-driven AWS architecture, RAG pipelines and automation infrastructure end to end.",
    points: [
      "Designed and built from scratch the event-driven serverless backbone of an early-stage product on Lambda, API Gateway, DynamoDB, S3, Cognito and IAM, decoupling services with SQS queues and SNS fan-out for fault-tolerant, asynchronous processing at scale.",
      "Built RAG pipelines over a large document corpus using FAISS, Neo4j knowledge graphs and local LLMs via Ollama, with OCR and MCP servers exposing custom tools to models.",
      "Built content and data automation pipelines covering multi-source ingestion and scraping, and audio generation with TTS and STT, including low-latency live voice agents."
    ]
  },
  {
    company: "Flyberry Gourmet",
    role: "Automation Engineer (Freelance) — Python | Flask | pandas | AWS",
    period: "JUN 2023 — JUL 2023",
    logo: flyberryLogo,
    logoClass: "flyberry-logo",
    summary: "Built a full-stack PO processing tool handling ~100 purchase orders a week, cutting ~20 hours of manual data entry a week.",
    points: [
      "Flask REST API with pdfplumber extracting line items, pricing and HSN codes from PO PDFs to structured CSV, with ZIP-based bulk download and error handling for invalid files and parsing failures.",
      "Deployed the frontend on S3 with CloudFront and the backend on Lambda behind API Gateway, configuring CORS policies and environment-based API URL management."
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
      "Performed RCA on production defects across the .NET front end and Oracle data layer, delivering changes in an Agile/Scrum model and collaborating with QA and business analysts through to UAT and release.",
      "Wrote and optimized Oracle SQL queries and PL/SQL stored procedures across large policy tables, and built Excel-based reporting and reconciliation tools using VBA macros and Power Query, saving ~2 hours of manual effort daily."
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
                  {exp.logo ? (
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
