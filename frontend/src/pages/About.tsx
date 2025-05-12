const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-orange-500">About SyncFlix</h1>
        
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Our Story</h2>
          <p className="text-slate-300 mb-4">
            SyncFlix was born from a simple problem: staying connected with friends when life takes us in different directions. 
            As classmates found themselves in different classes and schools, we missed the experience of listening to music together 
            and sharing reactions in real-time.
          </p>
          <p className="text-slate-300">
            What started as a solution for friends separated by school schedules has grown into a platform that connects 
            people across distances, time zones, and life circumstances. Whether you're sharing the latest hits with a friend 
            who moved away or introducing your favorite classics to new friends, SyncFlix helps you create memories together.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Our Mission</h2>
          <p className="text-slate-300">
            We believe that music and videos are meant to be shared experiences. Our mission is to recreate the magic of 
            sitting in the same room with your friends, reacting to the same beats, laughing at the same moments, 
            and creating shared memories—no matter where life takes you.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">Connect With Us</h2>
          <p className="text-slate-300 mb-4">
            We're always looking for ways to improve and would love to hear your feedback or feature requests.
            Feel free to reach out through our social media channels or email us directly.
          </p>
          <p className="text-slate-300">
            Thank you for being part of our journey!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
