import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const sections = document.querySelectorAll('section');
    const options = {
      root: null,
      threshold: 0.15,
    };

    const sectionNames = {
      hero: 'Identity',
      skills: 'Skills',
      projects: 'Projects',
      experience: 'Experience',
      certifications: 'Credentials',
      education: 'Academics',
      contact: 'Connect'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'hero' || id === 'contact') {
            document.title = 'Sumukh Teja Vanamala';
          } else if (sectionNames[id]) {
            document.title = `Sumukh Teja Vanamala | ${sectionNames[id]}`;
          }
        }
      });
    }, options);

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="portfolio-root">
      <Navbar />
      <ScrollToTop />
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? 'light' : 'dark'}
      </button>

      <main>
        <Hero />
        <Experience />
        <Skills />
        <Projects />
        <Certifications />
        <Education />
        <Contact theme={theme} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
