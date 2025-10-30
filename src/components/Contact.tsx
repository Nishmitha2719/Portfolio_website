import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Github } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
          <h2 className="text-4xl md:text-5xl font-bold text-primary">Get In Touch</h2>
          <p className="text-xl text-muted-foreground">
            I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <a href="mailto:shettynishmitha134@gmail.com">
                <Mail className="w-5 h-5 mr-2" />
                Email Me
              </a>
            </Button>
            
            <Button
              asChild
              size="lg"
              variant="outline"
            >
              <a href="https://www.linkedin.com/in/nishmitha-shetty-13812831b/" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-5 h-5 mr-2" />
                LinkedIn
              </a>
            </Button>
            
            <Button
              asChild
              size="lg"
              variant="outline"
            >
              <a href="https://github.com/Nishmitha2719" target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
      
      <footer className="mt-20 pt-8 border-t border-border text-center text-muted-foreground">
        <p>© 2025 Nishmitha Shetty. All rights reserved.</p>
      </footer>
    </section>
  );
};

export default Contact;
