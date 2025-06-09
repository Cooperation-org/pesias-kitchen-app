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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use refs to prevent infinite loops
  const hasAttemptedAuth = useRef(false);
  const isProcessing = useRef(false);

  // Handle authentication process
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
      } catch (signError) {
        const errorMessage = signError instanceof Error ? signError.message : 'Failed to sign message. Please try again.';
        setAuthError(errorMessage);
      }
    } catch (error) {
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="https://www.pesiaskitchen.org">
                <Image
                  src="/images/Pesia-logo-black.png"
                  alt="Pesia's Kitchen Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="https://www.pesiaskitchen.org" className="text-gray-700 hover:text-[#F4cf6A] font-medium">Home</Link>
              <Link href="https://www.pesiaskitchen.org/eatschoolprogram" className="text-gray-700 hover:text-[#F4cf6A] font-medium">EAT School Program</Link>
              <Link href="https://www.pesiaskitchen.org/communityhubs" className="text-gray-700 hover:text-[#F4cf6A] font-medium">Community Programs</Link>
              <Link href="https://www.pesiaskitchen.org/zichrongroup" className="text-gray-700 hover:text-[#F4cf6A] font-medium">Zichron Program</Link>
              <Link href="https://www.pesiaskitchen.org/ourpeople" className="text-gray-700 hover:text-[#F4cf6A] font-medium">Our People</Link>
              <Link href="#initiatives" className="text-[#F4cf6A] font-medium border-b-2 border-[#F4cf6A]">EAT Initiative</Link>
            </nav>

            {/* Action Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4 cursor-pointer">
              <Link href="https://dev-goodcollective.vercel.app/collective/0xbd64264abe852413d30dbf8a3765d7b6ddb04713">
                <button className="px-4 py-1 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 font-medium">
                  DONATE
                </button>
              </Link>
              <button
                onClick={handleConnectClick}
                disabled={authLoading}
                className={`px-4 py-1 bg-[#F4cf6A] text-white  hover:bg-[#F4cf6A]/90  cursor-pointer font-medium rounded-full ${authLoading ? 'opacity-70 cursor-not-allowed ' : ''}`}
              >
                {isConnected
                  ? (authLoading ? 'Authenticating...' : 'Enter Dashboard')
                  : 'Sign in'
                }
              </button>
              {authError && (
                <p className="text-red-500 text-sm mt-2">{authError}</p>
              )}
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden fixed inset-0 bg-white z-50 transform transition-transform duration-200 ease-in-out ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
              <div className="pt-16 px-4">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-md hover:bg-gray-100"
                    aria-label="Close menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <nav className="flex flex-col space-y-4">
                  <Link href="https://www.pesiaskitchen.org" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-[#2E8B57] font-medium py-2">Home</Link>
                  <Link href="https://www.pesiaskitchen.org/eatschoolprogram" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-[#2E8B57] font-medium py-2">EAT School Program</Link>
                  <Link href="https://www.pesiaskitchen.org/communityhubs" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-[#2E8B57] font-medium py-2">Community Programs</Link>
                  <Link href="https://www.pesiaskitchen.org/zichrongroup" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-[#2E8B57] font-medium py-2">Zichron Program</Link>
                  <Link href="https://www.pesiaskitchen.org/ourpeople" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-[#2E8B57] font-medium py-2">Our People</Link>
                  <Link href="#initiatives" onClick={() => setIsMenuOpen(false)} className="text-[#2E8B57] font-medium border-b-2 border-[#2E8B57] py-2">EAT Initiative</Link>
                  <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                    <Link href="https://dev-goodcollective.vercel.app/collective/0xbd64264abe852413d30dbf8a3765d7b6ddb04713">
                      <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
                        DONATE
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleConnectClick();
                      }}
                      disabled={authLoading}
                      className={`w-full px-4 py-2 bg-[#2E8B57] text-white rounded-md hover:bg-[#2E8B57]/90 font-medium ${authLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isConnected
                        ? (authLoading ? 'Authenticating...' : 'Enter Dashboard')
                        : 'Connect Wallet'
                      }
                    </button>
                    {authError && (
                      <p className="text-red-500 text-sm mt-2">{authError}</p>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="relative bg-gradient-to-b from-[#F2D166] to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center pt-10 pb-20 md:pt-16 md:pb-24">
            <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-pesia-dark-blue leading-tight mb-6 animate-fade-in">
                Rewarding Food Security <br />
                <span className="text-[#2E8B57]">One Meal at a Time</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Join the EAT Initiative and be part of a revolutionary approach to food rescue, using blockchain rewards to fight food insecurity while building community impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Link href="/auth">
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 bg-[#2E8B57] hover:bg-[#2E8B57]/90 text-white w-full sm:w-auto">
                    Volunteer Now
                  </button>
                </Link>
                <Link href="/about">
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background h-10 px-4 py-2 border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57] hover:text-white w-full sm:w-auto">
                    Learn More
                  </button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#8fbc8f] flex items-center justify-center text-white text-xs">JK</div>
                  <div className="w-8 h-8 rounded-full bg-[#ff8c42] flex items-center justify-center text-white text-xs">ML</div>
                  <div className="w-8 h-8 rounded-full bg-[#2E8B57] flex items-center justify-center text-white text-xs">AB</div>
                </div>
                <span className="text-sm text-gray-600">Join 200+ volunteers already making an impact</span>
              </div>
            </div>
            <div className="lg:w-1/2 relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="rounded-xl overflow-hidden shadow-xl transform rotate-1">
                <Image
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Volunteers sorting food donations"
                  width={1170}
                  height={800}
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#2E8B57] flex items-center justify-center text-white font-bold">G$</div>
                  <div>
                    <p className="text-sm font-semibold">Earn rewards</p>
                    <p className="text-xs text-gray-600">with GoodDollar tokens</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="white" preserveAspectRatio="none">
            <path d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,42.7C840,32,960,32,1080,37.3C1200,43,1320,53,1380,58.7L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z" />
          </svg>
        </div>
      </div>
      {/* Hero Section */}


      {/* How It Works Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How the EAT Initiative Works</h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            We&apos;re revolutionizing food rescue by connecting volunteers and recipients through blockchain rewards
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-[#90EE90]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[#2E8B57]">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Volunteer & Rescue</h3>
              <p className="text-gray-600">
                Join food rescue operations like sorting, distribution, or verification activities
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-[#90EE90]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[#2E8B57]">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Scan & Verify</h3>
              <p className="text-gray-600">
                Scan QR codes to verify your participation and the delivery of food packages
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-[#90EE90]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[#2E8B57]">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Earn G$ Rewards</h3>
              <p className="text-gray-600">
                Receive GoodDollar cryptocurrency and NFTs as rewards for your community impact
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Events</h2>
              <p className="text-xl text-gray-600">
                Join upcoming food rescue operations and earn G$ rewards
              </p>
            </div>
            <button className="px-6 py-3 bg-[#2E8B57] text-white font-semibold rounded-lg hover:bg-[#2E8B57]/90">
              View All Events
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Event 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-[#FFA500]/20 text-[#FFA500] rounded-full text-sm font-medium">Sorting</span>
                <span className="px-3 py-1 bg-[#2E8B57]/20 text-[#2E8B57] rounded-full text-sm font-bold">G$ 15</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Food Sorting Session</h3>
              <div className="text-gray-600 mb-4">
                <p className="mb-1">📅 Jan 12, 2025</p>
                <p className="mb-1">🕐 10:00 AM - 1:00 PM</p>
                <p className="mb-1">📍 Central Kitchen, Tel Aviv</p>
              </div>
              <div className="flex items-center justify-between mt-[2rem]">
                <div className="text-gray-500 text-sm mb-4">21 People Joined</div>
                <button className="px-4 py-2 w-[fit-content] bg-[#2E8B57] text-white font-semibold rounded-lg hover:bg-[#2E8B57]/90">
                  Join Event
                </button>
              </div>
            </div>

            {/* Event 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-[#FFA500]/20 text-[#FFA500] rounded-full text-sm font-medium">Distribution</span>
                <span className="px-3 py-1 bg-[#2E8B57]/20 text-[#2E8B57] rounded-full text-sm font-bold">G$ 20</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Community Food Distribution</h3>
              <div className="text-gray-600 mb-4">
                <p className="mb-1">📅 Jan 14, 2025</p>
                <p className="mb-1">🕐 3:00 PM - 6:00 PM</p>
                <p className="mb-1">📍 Neighborhood Center, Jerusalem</p>
              </div>
              <div className="flex items-center justify-between mt-[2rem]">
                <div className="text-gray-500 text-sm mb-4">24 People Joined</div>
                <button className="px-4 py-2 w-[fit-content] bg-[#2E8B57] text-white font-semibold rounded-lg hover:bg-[#2E8B57]/90">
                  Join Event
                </button>
              </div>
            </div>

            {/* Event 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-[#FFA500]/20 text-[#FFA500] rounded-full text-sm font-medium">Pickup</span>
                <span className="px-3 py-1 bg-[#2E8B57]/20 text-[#2E8B57] rounded-full text-sm font-bold">G$ 10</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Recipient Pickup</h3>
              <div className="text-gray-600 mb-4">
                <p className="mb-1">📅 Jan 16, 2025</p>
                <p className="mb-1">🕐 9:00 AM - 12:00 PM</p>
                <p className="mb-1">📍 South Hub, Haifa</p>
              </div>
              <div className="flex items-center justify-between mt-[2rem]">
                <div className="text-gray-500 text-sm mb-4">11 People Joined</div>
                <button className="px-4 py-2 w-[fit-content] bg-[#2E8B57] text-white font-semibold rounded-lg hover:bg-[#2E8B57]/90">
                  Join Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact</h2>
          <p className="text-xl text-gray-600 mb-16">
            Together we&apos;re creating meaningful change in our communities
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-[#2E8B57] mb-2">2,500+</div>
              <div className="text-gray-600 font-medium">Meals Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2E8B57] mb-2">200+</div>
              <div className="text-gray-600 font-medium">Active Volunteers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2E8B57] mb-2">15,000</div>
              <div className="text-gray-600 font-medium">G$ Rewards Distributed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2E8B57] mb-2">500+</div>
              <div className="text-gray-600 font-medium">Food Rescue NFTs</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#2E8B57]/90 to-[#2E8B57]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join the Movement</h2>
          <p className="text-xl text-white/90 mb-8">
            Be part of a revolutionary approach to food rescue and community impact
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleConnectClick}
              disabled={authLoading}
              className={`px-8 py-4 bg-white text-[#2E8B57] font-semibold rounded-lg hover:bg-gray-50 transition-colors ${authLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isConnected
                ? (authLoading ? 'Authenticating...' : 'Volunteer Now')
                : 'Volunteer Now'
              }
            </button>
            <button className="px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Last mile with a smile</h3>
              <p className="text-gray-600 mb-6">Join us to alleviate hunger and reduce food waste</p>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Mailing Address</h4>
                <p className="text-gray-600">
                  Rehov Lochami 16<br />
                  Jerusalem 5339912<br />
                  Israel
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                <a href="mailto:pesiakitchen@gmail.com" className="text-blue-600 hover:text-blue-700">
                  pesiakitchen@gmail.com
                </a>
              </div>

              {/* Social Media */}
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.219-5.175 1.219-5.175s-.311-.623-.311-1.544c0-1.445.839-2.524 1.883-2.524.888 0 1.317.666 1.317 1.466 0 .893-.568 2.228-.861 3.467-.245 1.038.52 1.883 1.543 1.883 1.854 0 3.279-1.954 3.279-4.774 0-2.496-1.795-4.242-4.356-4.242-2.969 0-4.71 2.226-4.71 4.528 0 .897.344 1.858.775 2.378.085.103.097.194.072.299-.079.33-.254 1.037-.289 1.183-.047.188-.153.228-.353.138-1.279-.594-2.077-2.459-2.077-3.959 0-3.284 2.386-6.302 6.885-6.302 3.615 0 6.427 2.576 6.427 6.019 0 3.592-2.267 6.485-5.416 6.485-1.058 0-2.055-.549-2.394-1.272 0 0-.523 1.992-.65 2.479-.235.9-.87 2.032-1.295 2.722.976.301 2.006.461 3.07.461 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex justify-end items-start">
              <div className="text-center">
                <div className="mb-4">
                  <Image
                    src="/images/Pesia-logo-black.png"
                    alt="EAT Initiative Logo"
                    width={120}
                    height={80}
                    className="h-20 w-auto mx-auto"
                  />
                </div>
                <div className="bg-black text-white p-4 rounded-lg">
                  <div className="text-sm mb-2">VERIFY PARTICIPANT STATUS</div>
                  <div className="text-2xl font-bold tracking-wider">
                    6020855506
                  </div>
                  <div className="text-xs mt-2">BRING THEM HOME</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}