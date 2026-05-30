import amazonLogo from '../assets/amazon.png';
import microsoftLogo from '../assets/microsoft.png';

const certs = [
  { name: "Cloud Computing 101", issuer: "Amazon Web Services (AWS)", logo: amazonLogo, logoClass: "amazon-cert-logo", date: "MAY 2026" },
  { name: "Azure AI Fundamentals (AI-900)", issuer: "Microsoft", logo: microsoftLogo, logoClass: "microsoft-cert-logo", date: "JAN 2023" }
];

export default function Certifications() {
  return (
    <section id="certifications">
      <div className="container" data-aos="fade-up">
        <span className="section-label">Validations</span>
        <h2 className="title-large" style={{marginBottom: '4rem'}}>Credentials</h2>
        <div style={{display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)'}}>
          {certs.map((cert, idx) => (
            <div
              key={idx}
              className="cert-item"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2.5rem 0',
                borderBottom: '1px solid var(--border)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '2.5rem', zIndex: 1}}>
                <img
                  src={cert.logo}
                  className={`cert-logo-small ${cert.logoClass || ''}`}
                  alt=""
                  style={{
                    width: '52px',
                    height: '52px',
                    objectFit: 'contain',
                    opacity: 0.8,
                    transition: 'all 0.4s ease'
                  }}
                />
                <div style={{display: 'flex', alignItems: 'baseline', gap: '1.5rem', flexWrap: 'wrap'}}>
                  <h3 style={{fontSize: '1.4rem', margin: 0, fontWeight: '400'}}>{cert.name}</h3>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    opacity: 0.4,
                    letterSpacing: '0.05em'
                  }}>
                    [{cert.date}]
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    opacity: 0.3
                  }}>
                    {cert.issuer}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{marginTop: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.4}}>
          AWS Solutions Architect Associate & Terraform Associate — in progress
        </p>
      </div>
    </section>
  );
}
