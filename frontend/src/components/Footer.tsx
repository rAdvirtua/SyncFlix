import { Github, Instagram, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-slate-300 py-6 border-t border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-orange-500 font-bold text-xl">SyncFlix</Link>
            <p className="text-sm mt-1">Harmonize your watching experience</p>
          </div>
          
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="https://github.com/neelsouhrid" target="_blank" rel="noopener noreferrer" 
               className="hover:text-orange-500 transition-colors">
              <Github size={20} />
            </a>
            <a href="https://www.linkedin.com/in/souhrid-pal/" target="_blank" rel="noopener noreferrer" 
               className="hover:text-orange-500 transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="https://instagram.com/neel_souhrid" target="_blank" rel="noopener noreferrer" 
               className="hover:text-orange-500 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="mailto:neelsouhrid@gmail.com" target="_blank" rel="noopener noreferrer" 
               className="hover:text-orange-500 transition-colors">
              <Mail size={20} />
            </a>
          </div>
          
          <div className="text-sm text-center md:text-right">
            <p className="mb-1"><Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link></p>
            <p>&copy; 2025 SyncFlix. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
