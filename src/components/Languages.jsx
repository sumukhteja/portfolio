export default function Languages() {
  const languages = [
    { name: "Telugu", code: "in" },
    { name: "English", code: "us" },
    { name: "Hindi", code: "in" },
    { name: "French", code: "fr" }
  ];

  const getFlagUrl = (code) => `https://raw.githubusercontent.com/coolbutuseless/flagon/master/inst/svg/${code}.svg`;

  return (
    <section id="languages">
      <div className="container">
        <span className="section-label">Dialogue</span>
        <h2 className="title-large" style={{marginBottom: '4rem'}}>Languages</h2>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '2rem'}}>
          {languages.map((lang, idx) => (
            <div key={idx} className="card-minimal" style={{flex: '1', minWidth: '150px', paddingTop: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
                <img 
                  src={getFlagUrl(lang.code)} 
                  alt={`${lang.name} flag`} 
                  style={{
                    width: '40px', 
                    height: 'auto', 
                    borderRadius: '2px',
                    filter: 'grayscale(0.2) contrast(1.1)', // Slightly muted to match the designer feel
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} 
                />
                <h3 style={{fontSize: '1.2rem', margin: 0}}>{lang.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
