const education = [
  {
    institution: "Vasavi College of Engineering",
    degree: "Bachelor of Engineering",
    year: "[2017 — 2021]",
    grade: "GPA: 7.61/10"
  },
  {
    institution: "Narayana Junior College",
    degree: "Intermediate / 12th",
    year: "[2015 — 2017]",
    grade: "Score: 94.4%"
  },
  {
    institution: "Narayana Olympiad School",
    degree: "SSC / 10th",
    year: "2015",
    grade: "GPA: 9.3/10"
  }
];

export default function Education() {
  return (
    <section id="education">
      <div className="container" data-aos="fade-up">
        <span className="section-label">Academics</span>
        <h2 className="title-large" style={{marginBottom: '4rem'}}>Education</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '2.4rem'}}>
          {education.map((edu, idx) => (
            <div 
              key={idx} 
              className="card-minimal education-row" 
              style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                flexWrap: 'wrap', 
                gap: '2rem',
                padding: '2.4rem 0',
                borderTop: idx === 0 ? '1px solid var(--border)' : 'none',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div style={{flex: '1.5', minWidth: '300px'}}>
                <div style={{display: 'flex', alignItems: 'baseline', flexWrap: 'nowrap', gap: '15px', marginBottom: '0.2rem'}}>
                  <h3 style={{fontSize: '2rem', margin: 0}}>{edu.institution}</h3>
                  <span style={{fontSize: '1rem', opacity: 0.3, fontWeight: '400', whiteSpace: 'nowrap'}}>{edu.year}</span>
                </div>
                <p style={{fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.5}}>{edu.degree}</p>
              </div>
              <div style={{flex: '1', minWidth: '300px', textAlign: 'right'}}>
                <p style={{fontSize: '1.2rem', lineHeight: '1.5', opacity: 0.8, margin: 0}}>{edu.grade}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
