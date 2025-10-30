import profilePhoto from "@/assets/profile-photo.jpg";

const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="relative animate-in fade-in slide-in-from-left duration-700">
            <img
              src={profilePhoto}
              alt="Nishmitha Shetty"
              className="rounded-2xl shadow-2xl w-full object-cover"
            />
          </div>
          
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-primary">About Me</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I have a strong foundation in programming languages such as Python, C, C++, and Java, 
              and recently I had the opportunity to work on an internship project in image generation 
              using generative AI, which gave me practical exposure to how AI can be applied creatively 
              to solve real-world problems.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I'm passionate about building full-stack applications using the MERN stack and Next.js, 
              creating seamless user experiences from frontend to backend.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
