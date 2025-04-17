"use client"
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import QRGenerator from '@/components/QRGenerator';
import { qrService } from '@/src/services/api'; // Import the API service

// Helper function to generate a unique ID
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const CreateQRPage: React.FC = () => {
  const router = useRouter();
  const [eventType, setEventType] = useState<string>('food-sorting');
  const [rewardAmount, setRewardAmount] = useState<number>(5);
  const [location, setLocation] = useState<string>('');
  const [qrValue, setQrValue] = useState<string>('');
  const [qrGenerated, setQrGenerated] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Generate QR code data
  // Inside your generateQRCode function in the QR generator page
const generateQRCode = async () => {
  if (!location) {
    alert('Please enter a location');
    return;
  }
  
  setIsLoading(true);
  setError('');
  
  try {
    // First, create an activity record (or use an existing one)
    const activityData = {
      title: `${eventType} at ${location}`,
      description: `Activity for ${eventType}`,
      location: location,
      date: new Date(),
      status: 'active',
      // Add other required fields for your Activity model
    };
    
    // Create the activity
    const activityResponse = await activityService.createActivity(activityData);
    
    if (activityResponse.data && activityResponse.data.success) {
      const activityId = activityResponse.data.data._id;
      
      // Now generate QR code for this activity
      const qrResponse = await qrService.generateQR(activityId);
      
      if (qrResponse.data && qrResponse.data.success) {
        // Set the QR value from the response
        const generatedQRData = qrResponse.data.data;
        setQrValue(JSON.stringify(generatedQRData));
        setQrGenerated(true);
      } else {
        setError(qrResponse.data?.message || 'Failed to generate QR code');
      }
    } else {
      setError(activityResponse.data?.message || 'Failed to create activity');
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    setError(`An error occurred: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  // Function to download QR code as PNG (unchanged from your original code)
  const downloadQR = () => {
    const canvas = document.getElementById('qr-download-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const svg = document.querySelector('.qr-code-container svg') as SVGElement;
    if (!svg) return;
    
    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    
    const DOMURL = window.URL || window.webkitURL || window;
    const img = new Image();
    const svgUrl = DOMURL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Draw to canvas
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(svgUrl);
        
        // Trigger download
        const imgURI = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = imgURI;
        a.download = `qr-code-${eventType}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };
    
    img.src = svgUrl;
  };

  return (
    <>
      <Head>
        <title>Create QR Code | Pesia's Kitchen Admin</title>
        <meta name="description" content="Create QR codes for volunteer activities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center">
          <button 
            className="text-gray-700 mr-4 text-xl font-medium"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            ←
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Create QR Code</h1>
        </div>
        
        <div className="max-w-md mx-auto p-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {!qrGenerated ? (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">QR Code Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    id="eventType"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  >
                    <option value="food-sorting">Food Sorting</option>
                    <option value="food-distribution">Food Distribution</option>
                    <option value="food-pickup">Food Pickup</option>
                    <option value="food-rescue">Food Rescue</option>
                    <option value="community-event">Community Event</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="rewardAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    G$ Reward Amount
                  </label>
                  <input
                    type="number"
                    id="rewardAmount"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Tel Aviv Distribution Center"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-blue-500 text-sm font-medium flex items-center"
                    disabled={isLoading}
                  >
                    {showAdvanced ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Hide Advanced Options
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Show Advanced Options
                      </>
                    )}
                  </button>
                </div>
                
                {showAdvanced && (
                  <div className="pt-2">
                    <label htmlFor="expiryHours" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Time (hours)
                    </label>
                    <input
                      type="number"
                      id="expiryHours"
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(Number(e.target.value))}
                      min={1}
                      max={168}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      QR code will expire after {expiryHours} hours
                    </p>
                  </div>
                )}
                
                <button
                  onClick={generateQRCode}
                  className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 px-4 rounded-md font-medium transition-colors mt-4 flex justify-center items-center`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate QR Code'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Your QR Code</h2>
              
              <div className="flex flex-col items-center justify-center mb-6">
                <QRGenerator
                  value={qrValue}
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                  logoUrl="/logo.png" // Optional: Add your logo
                />
                <p className="mt-2 text-sm text-gray-500">
                  {eventType.replace('-', ' ')} | {location}
                </p>
                <p className="text-sm text-gray-500">
                  Reward: {rewardAmount} G$
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={downloadQR}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md font-medium hover:bg-green-600 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => setQrGenerated(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Create Another
                </button>
              </div>
              
              {/* Hidden canvas for downloading QR as PNG */}
              <canvas id="qr-download-canvas" style={{ display: 'none' }}></canvas>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default CreateQRPage;