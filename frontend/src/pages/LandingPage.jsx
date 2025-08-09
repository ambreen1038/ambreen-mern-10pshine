import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

import {
  FileText, Search, Shield, Smartphone, Users, Star, ArrowRight, StickyNote,
} from 'lucide-react';

// Constants for maintainability
const STATS = [
  ['10K+', 'Active Users'],
  ['1M+', 'Notes Created'],
  ['99.9%', 'Uptime']
];

const MOCK_NOTES = [
  ['Meeting Notes', 'Discussed project timeline...', 'blue'],
  ['Ideas for App', 'New features to implement...', 'green'],
  ['Shopping List', 'Groceries needed...', 'purple'],
];

const FEATURES = [
  { 
    icon: FileText, 
    title: 'Rich Text Editor', 
    description: 'Create, edit, and organize your notes with a powerful editor.' 
  },
  { 
    icon: Search, 
    title: 'Powerful Search', 
    description: 'Find any note instantly using smart filters and keywords.' 
  },
  { 
    icon: Shield, 
    title: 'Secure & Private', 
    description: 'All your data is encrypted and stored securely.' 
  },
  { 
    icon: Smartphone, 
    title: 'Mobile Responsive', 
    description: 'Use your notes on the go with full mobile support.' 
  },
  { 
    icon: Users, 
    title: 'Easy Sharing', 
    description: 'Collaborate and share notes with your team.' 
  },
  { 
    icon: Star, 
    title: 'Favorites & Tags', 
    description: 'Organize using tags and mark important notes as favorites.' 
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
       <Navbar />
      {/* ========== HERO SECTION ========== */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Your thoughts,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                beautifully organized
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
              Capture ideas, organize thoughts, and boost your productivity.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={user ? '/dashboard' : '/signup'}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              {!user && (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Sign In
                </Link>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 text-center">
              {STATS.map(([stat, label], i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </div>

{/* Mockup Container with Video */}
<div className="relative lg:pl-8">
  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-indigo-500 to-blue-600 rounded-3xl blur-3xl rotate-6 opacity-50" />

  <div className="relative bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-2xl p-4 backdrop-blur-xl hover:scale-105 transition duration-300 ring-2 ring-offset-2 ring-purple-500/40">
    <video
      className="rounded-2xl w-full h-auto object-cover shadow-xl"
      src="/landd.mp4"
      autoPlay
      loop
      muted
      playsInline
      aria-label="Note-taking demo animation"
    >
      Your browser does not support the video tag.
    </video>
  </div>
</div>


        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="bg-white dark:bg-gray-800 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powerful features designed to make note-taking effortless.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, description }, idx) => (
              <FeatureCard 
                key={idx}
                Icon={Icon}
                title={title}
                description={description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 lg:py-32">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to transform your note-taking?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have already discovered organized thinking.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
              >
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold rounded-lg transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">NoteVerse</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} NoteVerse. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ========== COMPONENTS ==========

function NotePreview({ title, content, color }) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/30',
    green: 'bg-green-50 dark:bg-green-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/30',
  };

  return (
    <div
      className={`${colorMap[color]} p-4 rounded-lg shadow-md animate-floating`}
    >
      <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-[1.6]">{content}</p>
    </div>
  );
}


function FeatureCard({ Icon, title, description }) {
  return (
    <div className="group bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 border border-gray-100 dark:border-gray-600 hover:shadow-lg transition transform hover:-translate-y-2">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </p>
    </div>
  );
}