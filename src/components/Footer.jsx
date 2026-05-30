export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      padding: '100px 0 60px',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4rem'
    }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
          lineHeight: '1.2',
          margin: '0',
          letterSpacing: '-0.02em',
          opacity: 0.8
        }}>
          "Systems are the canvas. <br /> Logic is the brush."
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
          marginTop: '6rem'
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            opacity: 0.4
          }}>
            © {currentYear} SUMUKH TEJA VANAMALA. <br /> ALL RIGHTS RESERVED.
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: 0.2
          }}>
            BUILT WITH VITE & REACT
          </span>
        </div>
      </div>
    </footer>
  );
}
