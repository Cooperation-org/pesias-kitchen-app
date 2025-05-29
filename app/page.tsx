'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useAuthContext } from '@/providers/web3Provider';
import Image from 'next/image';
import Link from 'next/link';
import { getNonce, verifySignature, storeAuthData } from '@/services/authServices';

export default function LandingPage() {
  const { isConnected, address } = useAccount();
  const { redirectToDashboard, openAppKit } = useAuthContext();
  const { signMessageAsync } = useSignMessage();
  
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Use refs to prevent infinite loops
  const hasAttemptedAuth = useRef(false);
  const isProcessing = useRef(false);

  // Trigger animations on mount
  useEffect(() => {
    setIsVisible(true);
    
    // Handle scroll for navbar
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle authentication process (same as login page)
  const authenticate = async () => {
    if (isProcessing.current || !address) return;
    
    try {
      isProcessing.current = true;
      setAuthLoading(true);
      setAuthError(null);
      
      const nonceResponse = await getNonce(address);
      if (nonceResponse.error || !nonceResponse.data) {
        throw new Error(nonceResponse.error || 'Failed to get nonce');
      }
      
      const nonce = nonceResponse.data.nonce;
      const message = `Sign this message to authenticate with Pesia's Kitchen EAT Initiative: ${nonce}`;
      
      try {
        const signature = await signMessageAsync({ message });
        if (!address || !signature) {
          throw new Error("Missing wallet address or signature");
        }
        
        const authResponse = await verifySignature(address, signature);
        if (authResponse.error || !authResponse.data) {
          throw new Error(authResponse.error || 'Verification failed');
        }
        
        storeAuthData(authResponse.data.token, authResponse.data.user);
        redirectToDashboard();
      } catch (signError: unknown) {
        const errorMessage = signError instanceof Error ? signError.message : 'Failed to sign message. Please try again.';
        setAuthError(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthError(errorMessage);
    } finally {
      setAuthLoading(false);
      isProcessing.current = false;
      hasAttemptedAuth.current = true;
    }
  };

  // Effect to handle automatic authentication
  useEffect(() => {
    const checkAndAuthenticate = async () => {
      if (
        isConnected && 
        address && 
        !localStorage.getItem('token') && 
        !hasAttemptedAuth.current && 
        !isProcessing.current
      ) {
        await authenticate();
      } else if (isConnected && localStorage.getItem('token')) {
        redirectToDashboard();
      }
    };

    checkAndAuthenticate();
    return () => {
      hasAttemptedAuth.current = false;
    };
  }, [isConnected, address, redirectToDashboard]);

  // Handle connect wallet click
  const handleConnectClick = () => {
    if (isConnected) {
      hasAttemptedAuth.current = false;
      authenticate();
    } else {
      openAppKit();
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-yellow-400/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className={`transform transition-all duration-500 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`}>
              <Image
                src="/images/Pesia-logo-black.png"
                alt="Pesia's Kitchen Logo"
                width={160}
                height={45}
                className="h-10 w-auto"
                priority
              />
            </div>
            
            {/* Navigation Links */}
            <div className={`hidden md:flex items-center space-x-8 transform transition-all duration-500 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}>
              <Link href="#about" className="text-gray-800 hover:text-yellow-500 transition-colors font-medium">
                About
              </Link>
              <Link href="#features" className="text-gray-800 hover:text-yellow-500 transition-colors font-medium">
                Features
              </Link>
              <Link href="#impact" className="text-gray-800 hover:text-yellow-500 transition-colors font-medium">
                Impact
              </Link>
            </div>
            
            {/* Connect Wallet Button */}
            <div className={`transform transition-all duration-500 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}>
              <button
                onClick={handleConnectClick}
                disabled={authLoading}
                className={`group relative px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  authLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {authLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isConnected 
                  ? (authLoading ? 'Authenticating...' : 'Enter Dashboard')
                  : 'Connect Wallet'
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-yellow-300/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-tr from-yellow-500/10 to-yellow-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="text-left">
              {/* Main Headline */}
              <h1 className={`text-5xl md:text-7xl font-bold text-black mb-8 transform transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}>
                Rescuing Food,
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Feeding Hope
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className={`text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed transform transition-all duration-1000 delay-300 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                Join Pesia's Kitchen EAT Initiative in creating sustainable impact through blockchain-verified food rescue and community support.
              </p>

              {/* Auth Error Message */}
              {authError && (
                <div className="mb-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl max-w-md">
                  <p className="text-sm font-medium">{authError}</p>
                  <button 
                    onClick={() => {
                      hasAttemptedAuth.current = false; 
                      authenticate();
                    }}
                    className="text-sm font-semibold text-red-700 underline mt-2 hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              )}
              
              {/* CTA Buttons */}
              <div className={`flex flex-col sm:flex-row gap-6 transform transition-all duration-1000 delay-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <button
                  onClick={handleConnectClick}
                  disabled={authLoading}
                  className={`group relative px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-lg font-bold rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25 transform hover:scale-105 hover:-translate-y-1 ${
                    authLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <span className="relative flex items-center">
                    {authLoading && (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isConnected 
                      ? (authLoading ? 'Authenticating...' : 'Enter Dashboard')
                      : 'Start Making Impact'
                    }
                    {!authLoading && (
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </span>
                </button>
                
                <a
                  href="https://dev-goodcollective.vercel.app/collective/0xbd64264abe852413d30dbf8a3765d7b6ddb04713"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-10 py-5 bg-white text-black text-lg font-bold rounded-full border-2 border-black hover:bg-black hover:text-white transition-all duration-300 shadow-2xl transform hover:scale-105 hover:-translate-y-1"
                >
                  <span className="flex items-center">
                    Donate Now
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>

            {/* Right Column - 3D Illustration */}
            <div className={`relative transform transition-all duration-1000 delay-700 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
            }`}>
              <div className="relative w-full h-[600px] flex items-center justify-center">
                {/* 3D Scene Container */}
                <div className="relative w-96 h-96 mx-auto transform-gpu perspective-1000">
                  {/* Main 3D Food Bowl */}
                  <div 
                    className="absolute inset-0 animate-float-slow"
                    style={{
                      transform: 'rotateY(15deg) rotateX(10deg)',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Bowl Shadow */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-80 h-20 bg-gradient-to-r from-transparent via-gray-300/20 to-transparent rounded-full blur-xl"></div>
                    
                    {/* Main Bowl */}
                    <div className="relative w-80 h-80 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full shadow-2xl transform scale-90"></div>
                      <div className="absolute inset-4 bg-gradient-to-br from-white to-gray-50 rounded-full shadow-inner"></div>
                      
                      {/* Food Items - 3D positioned */}
                      <div className="absolute top-8 left-12 w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-lg animate-bounce-slow"></div>
                      <div className="absolute top-16 right-16 w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-lg animate-bounce-slow" style={{ animationDelay: '0.5s' }}></div>
                      <div className="absolute bottom-20 left-20 w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full shadow-lg animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute bottom-16 right-12 w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full shadow-lg animate-bounce-slow" style={{ animationDelay: '1.5s' }}></div>
                    </div>
                  </div>

                  {/* Floating Hearts/Icons */}
                  <div className="absolute top-0 left-0 w-8 h-8 text-yellow-500 animate-float" style={{ animationDelay: '0s' }}>
                    ❤️
                  </div>
                  <div className="absolute top-20 right-0 w-8 h-8 text-green-500 animate-float" style={{ animationDelay: '1s' }}>
                    🌱
                  </div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 text-blue-500 animate-float" style={{ animationDelay: '2s' }}>
                    🤝
                  </div>
                  <div className="absolute bottom-20 right-20 w-8 h-8 text-purple-500 animate-float" style={{ animationDelay: '3s' }}>
                    ✨
                  </div>

                  {/* Blockchain Network Visualization */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-1/4 left-3/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                  </div>
                </div>

                {/* Ambient Light Effects */}
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/10 via-transparent to-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-white to-yellow-50/30">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className="text-5xl font-bold text-black mb-6">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Blockchain-verified impact tracking with transparent community engagement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌱",
                title: "Sustainable Impact",
                description: "Every meal rescued is tracked on-chain, ensuring transparency and measurable community impact."
              },
              {
                icon: "🔗",
                title: "Blockchain Verified",
                description: "Smart contracts ensure all donations and distributions are verifiable and tamper-proof."
              },
              {
                icon: "👥",
                title: "Community Driven",
                description: "Connect volunteers, donors, and recipients in a seamless ecosystem of giving."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-yellow-100 hover:border-yellow-300 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200 + 700}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-yellow-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400">
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Meals Rescued" },
              { number: "500+", label: "Families Fed" },
              { number: "50+", label: "Partner Organizations" },
              { number: "100%", label: "Transparency" }
            ].map((stat, index) => (
              <div key={index} className="text-black">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg font-medium opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Image
                src="/images/Pesia-logo-white.png"
                alt="Pesia's Kitchen Logo"
                width={160}
                height={45}
                className="h-10 w-auto mb-4"
              />
              <p className="text-gray-400 max-w-md">
                Empowering communities through sustainable food rescue and blockchain-verified transparency.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="#about" className="block text-gray-400 hover:text-yellow-400 transition-colors">About</Link>
                <Link href="#features" className="block text-gray-400 hover:text-yellow-400 transition-colors">Features</Link>
                <Link href="#impact" className="block text-gray-400 hover:text-yellow-400 transition-colors">Impact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>hello@pesiaskitchen.org</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pesia's Kitchen EAT Initiative. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom 3D Animations */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-15px) rotate(2deg); 
          }
        }
        
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0px) rotateY(15deg) rotateX(10deg); 
          }
          50% { 
            transform: translateY(-20px) rotateY(18deg) rotateX(12deg); 
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% { 
            transform: translateY(0px) scale(1); 
          }
          50% { 
            transform: translateY(-8px) scale(1.05); 
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        
        .transform-gpu {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}