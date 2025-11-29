import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  ArrowRight,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';

export function LandingPageNew() {
  const navigate = useNavigate();

  const handleEnterApp = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-white overflow-x-hidden">

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-500/20 text-white">
                E
             </div>
             <span className="text-xl font-bold tracking-tight text-white">Eval</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={handleEnterApp}
              className="bg-teal-500 hover:bg-teal-400 text-slate-900 text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:shadow-[0_0_20px_-5px_rgba(20,184,166,0.5)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] -z-10 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-teal-400 text-xs font-medium mb-8 animate-fade-in">
            <Sparkles size={12} />
            <span>AI-Powered Resume Screening</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 leading-[1.1]">
            Stop Reading <br />
            Every Single Resume.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Eval is the AI recruiting assistant that screens thousands of applicants in seconds.
            Identify top talent instantly without the burnout.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleEnterApp}
              className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-slate-900 text-lg font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)] flex items-center justify-center gap-2"
            >
              Start Screening Free
              <ArrowRight size={18} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white font-medium transition-all flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-teal-500">
                <div className="w-0 h-0 border-l-[6px] border-l-teal-500 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
              </div>
              Watch Demo
            </button>
          </div>

          {/* Hero Image / App Mockup */}
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>

            {/* Mockup Header */}
            <div className="h-10 bg-slate-800/50 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>

            {/* Mockup Content */}
            <div className="p-8 grid grid-cols-12 gap-6 opacity-80 group-hover:opacity-100 transition-opacity duration-700">
               {/* Sidebar */}
               <div className="col-span-3 space-y-4">
                  <div className="h-8 w-32 bg-slate-700/50 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-10 w-full bg-teal-500/20 border border-teal-500/30 rounded-lg"></div>
                    <div className="h-10 w-full bg-slate-800/50 rounded-lg"></div>
                    <div className="h-10 w-full bg-slate-800/50 rounded-lg"></div>
                  </div>
               </div>
               {/* Main */}
               <div className="col-span-9 space-y-6">
                  <div className="flex justify-between">
                    <div className="h-8 w-48 bg-slate-700/50 rounded-lg"></div>
                    <div className="h-8 w-24 bg-teal-500 rounded-lg shadow-[0_0_15px_rgba(20,184,166,0.4)]"></div>
                  </div>
                  {/* Table Rows */}
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-16 w-full bg-slate-800/30 border border-white/5 rounded-xl flex items-center px-4 gap-4">
                       <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                       <div className="w-32 h-4 bg-slate-700 rounded"></div>
                       <div className="flex-1"></div>
                       <div className="w-24 h-6 bg-teal-500/10 border border-teal-500/20 rounded-full flex items-center justify-center text-teal-500 text-xs font-bold">9{5-i}% Match</div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="border-y border-white/5 bg-black/20 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-medium text-slate-500 mb-8 uppercase tracking-widest">Trusted by hiring teams at</p>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40">
             <div className="text-xl font-bold font-serif">ACME Corp</div>
             <div className="text-xl font-bold italic">Globex</div>
             <div className="text-xl font-bold tracking-tighter">Soylent</div>
             <div className="text-xl font-bold font-mono">Umbrella</div>
             <div className="text-xl font-bold">Initech</div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Hiring Intelligence, <span className="text-teal-400">Democratized.</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Our two-tier engine lets you screen everyone for free, and only pay for deep AI analysis on the candidates that matter.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           <div className="bg-slate-800/30 border border-white/5 p-8 rounded-2xl hover:bg-slate-800/50 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6">
                <UploadCloud size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Batch Processing</h3>
              <p className="text-slate-400 leading-relaxed">Upload 50 resumes at once. We extract text, format data, and prepare everything for review in seconds.</p>
           </div>
           <div className="bg-slate-800/30 border border-white/5 p-8 rounded-2xl hover:bg-slate-800/50 transition-colors">
              <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Tier-1 Ranking</h3>
              <p className="text-slate-400 leading-relaxed">Get immediate keyword match scores for every applicant for free. Filter out the noise instantly.</p>
           </div>
           <div className="bg-slate-800/30 border border-white/5 p-8 rounded-2xl hover:bg-slate-800/50 transition-colors">
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Deep AI Analysis</h3>
              <p className="text-slate-400 leading-relaxed">Unlock detailed scorecards, interview guides, and risk flags for your top candidates using AI.</p>
           </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-24 px-6 bg-slate-800/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Three simple steps to transform your hiring process.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center text-teal-400 text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold mb-3">Upload Resumes</h3>
              <p className="text-slate-400">Drag and drop up to 50 resumes at once. We support PDF, DOCX, and more.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center text-teal-400 text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold mb-3">Instant Ranking</h3>
              <p className="text-slate-400">Get keyword match scores instantly. See who fits your requirements at a glance.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center text-teal-400 text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold mb-3">Deep Dive</h3>
              <p className="text-slate-400">Run AI analysis on your top picks for detailed insights and interview guides.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-24 px-6 bg-slate-900 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90 z-0"></div>
        <div className="max-w-7xl mx-auto relative z-10">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
             <div>
               <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
               <p className="text-slate-400">Start for free, scale as you hire.</p>
             </div>
             <div className="flex bg-slate-800 p-1 rounded-lg">
               <button className="px-4 py-2 bg-slate-700 rounded text-white text-sm font-medium shadow">Monthly</button>
               <button className="px-4 py-2 text-slate-400 text-sm font-medium hover:text-white">Annually</button>
             </div>
           </div>

           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Tier */}
              <div className="bg-slate-800/30 border border-white/5 rounded-3xl p-8 flex flex-col">
                 <div className="mb-4">
                   <h3 className="text-xl font-bold text-white">Starter</h3>
                   <div className="text-4xl font-bold mt-4">$0 <span className="text-lg text-slate-500 font-normal">/ month</span></div>
                 </div>
                 <p className="text-slate-400 mb-8 border-b border-white/5 pb-8">Perfect for small teams or low-volume roles.</p>
                 <ul className="space-y-4 mb-8 flex-1">
                   <li className="flex items-center gap-3 text-slate-300"><Check size={18} className="text-slate-500"/> Unlimited Roles</li>
                   <li className="flex items-center gap-3 text-slate-300"><Check size={18} className="text-slate-500"/> Unlimited Uploads</li>
                   <li className="flex items-center gap-3 text-slate-300"><Check size={18} className="text-slate-500"/> Basic Keyword Matching</li>
                   <li className="flex items-center gap-3 text-slate-300"><Check size={18} className="text-slate-500"/> 5 AI Credits / month</li>
                 </ul>
                 <button onClick={handleEnterApp} className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold transition-colors">
                   Get Started Free
                 </button>
              </div>

              {/* Pro Tier */}
              <div className="bg-slate-800/80 border border-teal-500/50 rounded-3xl p-8 flex flex-col relative shadow-[0_0_50px_-20px_rgba(20,184,166,0.2)]">
                 <div className="absolute top-0 right-0 bg-teal-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
                 <div className="mb-4">
                   <h3 className="text-xl font-bold text-white">Pro Recruiter</h3>
                   <div className="text-4xl font-bold mt-4">$49 <span className="text-lg text-slate-500 font-normal">/ month</span></div>
                 </div>
                 <p className="text-slate-400 mb-8 border-b border-white/5 pb-8">For agencies and high-growth startups.</p>
                 <ul className="space-y-4 mb-8 flex-1">
                   <li className="flex items-center gap-3 text-white"><Check size={18} className="text-teal-400"/> Everything in Starter</li>
                   <li className="flex items-center gap-3 text-white"><Check size={18} className="text-teal-400"/> 500 AI Credits / month</li>
                   <li className="flex items-center gap-3 text-white"><Check size={18} className="text-teal-400"/> Interview Guide Generation</li>
                   <li className="flex items-center gap-3 text-white"><Check size={18} className="text-teal-400"/> Export PDF Reports</li>
                 </ul>
                 <button onClick={handleEnterApp} className="w-full py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold transition-colors shadow-lg shadow-teal-500/20">
                   Start 14-Day Trial
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2 text-slate-400">
             <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-slate-300">E</div>
             <span className="font-bold">Eval - Resume Scanner</span>
           </div>
           <div className="text-slate-600 text-sm">
             © 2024 Eval Inc. All rights reserved.
           </div>
           <div className="flex gap-6 text-slate-500">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
             <a href="#" className="hover:text-white transition-colors">Twitter</a>
           </div>
        </div>
      </footer>
    </div>
  );
}
