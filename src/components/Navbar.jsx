import { useState, useEffect } from 'react';

export default function Navbar() {
  const [hideName, setHideName] = useState(false);

  const navLinks = [
    { name: "Intro", href: "#hero" },
    { name: "Experience", href: "#experience" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Credentials", href: "#certifications" },
    { name: "Academics", href: "#education" },
    { name: "Connect", href: "#contact" }
  ];

  const [isHero, setIsHero] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero');
      const contactSection = document.getElementById('contact');

      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        // If the bottom of hero is above a certain point, we've left the hero section
        setIsHero(heroRect.bottom > 100);
      }

      if (contactSection) {
        const rect = contactSection.getBoundingClientRect();
        setHideName(rect.top < 200); 
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="nav-designer">
      <div className="nav-container">
        <a 
          href="#hero" 
          className="nav-logo" 
          style={{ 
            opacity: hideName ? 0 : 1, 
            visibility: hideName ? 'hidden' : 'visible',
            color: isHero ? 'var(--text)' : 'var(--text-muted)',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          Sumukh Teja Vanamala
        </a>
        <div className="nav-links-minimal">
          {navLinks.map((link, idx) => (
            <a key={idx} href={link.href} className="nav-item">
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
