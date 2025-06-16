// "use client"
// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { CheckCircleIcon } from '@heroicons/react/24/outline';

// export default function CustodialScanPage() {
//   const [phone, setPhone] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [qrData, setQrData] = useState<any>(null);
//   const [success, setSuccess] = useState(false);
//   const [userInfo, setUserInfo] = useState<any>(null);
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   useEffect(() => {
//     const data = searchParams.get('data');
//     if (data) {
//       try {
//         const decoded = JSON.parse(decodeURIComponent(data));
//         setQrData(decoded);
//       } catch (error) {
//         console.error('Invalid QR data');
//       }
//     }
//   }, [searchParams]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch('/api/proxy/custodial-scan', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           identifier: phone,
//           identifierType: 'phone',
//           qrData: qrData
//         })
//       });

//       const result = await response.json();
      
//       if (result.success) {
//         setSuccess(true);
//         setUserInfo(result);
//       } else {
//         alert(`Error: ${result.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('Network error:', error);
//       alert('Error processing request. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleContinueToApp = () => {
//     router.push('/dashboard');
//   };

//   const handleBackToHome = () => {
//     window.location.href = 'https://pesiaskitchen.org';
//   };

//   if (!qrData) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading event details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (success) {
//     return (
//       <div className="min-h-screen bg-white p-4">
//         <div className="max-w-md mx-auto mt-8">
//           {/* Success Icon */}
//           <div className="flex justify-center mb-6">
//             <div className="bg-green-100 rounded-full p-4">
//               <CheckCircleIcon className="w-16 h-16 text-green-500" />
//             </div>
//           </div>

//           {/* Success Message */}
//           <h1 className="text-2xl font-bold text-center mb-4">Thank You!</h1>
//           <p className="text-center text-gray-600 mb-8">
//             You have successfully joined the event. Your contribution to fighting food waste is making a difference!
//           </p>

//           {/* Event Details */}
//           <div className="bg-gray-50 p-4 rounded-lg mb-6">
//             <h3 className="font-semibold mb-2">Event Details:</h3>
//             <p className="text-sm text-gray-600">Type: {qrData.type}</p>
//             {userInfo.eventTitle && (
//               <p className="text-sm text-gray-600">Event: {userInfo.eventTitle}</p>
//             )}
//             <p className="text-sm text-gray-600">Your Phone: {phone}</p>
//           </div>

//           {/* Action Buttons */}
//           <div className="space-y-3">
//             <button
//               onClick={handleContinueToApp}
//               className="w-full bg-yellow-400 text-black p-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
//             >
//               Continue to Your Activities
//             </button>
            
//             <button
//               onClick={handleBackToHome}
//               className="w-full bg-white text-gray-700 border border-gray-300 p-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
//             >
//               Back to PESIA's Kitchen
//             </button>
//           </div>

//           {/* Additional Info */}
//           <div className="mt-8 p-4 bg-blue-50 rounded-lg">
//             <p className="text-sm text-blue-800">
//               <strong>What's next?</strong> You can view all your activities, track your impact, 
//               and earn rewards in your dashboard. Keep making a difference!
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white p-4">
//       <div className="max-w-md mx-auto mt-8">
//         {/* PESIA's Logo/Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">PESIA's Kitchen</h1>
//           <p className="text-gray-600 mt-2">Fighting Food Waste Together</p>
//         </div>

//         <h2 className="text-2xl font-bold mb-4">Join Event</h2>
        
//         <div className="bg-gray-50 p-4 rounded-lg mb-6">
//           <p className="text-sm text-gray-600">Event Type: <span className="font-semibold">{qrData.type}</span></p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Enter your phone number
//             </label>
//             <input
//               type="tel"
//               placeholder="+254712345678"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
//               required
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               We'll use this to create your account and track your impact
//             </p>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-yellow-400 text-black p-3 rounded-lg font-medium hover:bg-yellow-500 disabled:opacity-50 transition-colors"
//           >
//             {loading ? (
//               <span className="flex items-center justify-center">
//                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Processing...
//               </span>
//             ) : (
//               'Create Account & Join'
//             )}
//           </button>
//         </form>

//         {/* Info Section */}
//         <div className="mt-8 text-center">
//           <p className="text-sm text-gray-500">
//             By joining, you agree to help reduce food waste and make a positive impact in your community
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client"
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CustodialScanPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data));
        
        // Fix invalid eventId by truncating to 24 characters if needed
        if (decoded.eventId && decoded.eventId.length > 24) {
          decoded.eventId = decoded.eventId.substring(0, 24);
          console.log('Fixed eventId:', decoded.eventId);
        }
        
        setQrData(decoded);
      } catch (error) {
        console.error('Invalid QR data');
      }
    }
  }, [searchParams]);

  // Function to store JWT token and handle successful login
  const handleSuccessfulLogin = (result: any) => {
    if (result.token) {
      // Store the JWT token and user data
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      console.log('User logged in successfully:', result.user);
      
      // Set success state with user info
      setSuccess(true);
      setUserInfo(result);
      
      // Auto-redirect to activities after 3 seconds
      setTimeout(() => {
        router.push('/activities');
      }, 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/proxy/custodial-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: phone,
          identifierType: 'phone',
          qrData: qrData
        })
      });

      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        // Handle successful login automatically
        handleSuccessfulLogin(result);
      } else {
        alert(`Error: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Error processing request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToApp = () => {
    router.push('/activities');
  };

  const handleBackToHome = () => {
    window.location.href = 'https://pesiaskitchen.org';
  };

  if (!qrData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-md mx-auto mt-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircleIcon className="w-16 h-16 text-green-500" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-center mb-4">Welcome!</h1>
          <p className="text-center text-gray-600 mb-2">
            {userInfo?.isNewUser ? 'Your account has been created successfully!' : 'Welcome back!'}
          </p>
          <p className="text-center text-gray-600 mb-8">
            You're now logged in and your activity has been recorded. Your contribution to fighting food waste is making a difference!
          </p>

          {/* Event Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Event Details:</h3>
            <p className="text-sm text-gray-600">Type: {qrData.type}</p>
            {userInfo?.eventTitle && (
              <p className="text-sm text-gray-600">Event: {userInfo.eventTitle}</p>
            )}
            <p className="text-sm text-gray-600">Your Phone: {phone}</p>
            {userInfo?.walletAddress && (
              <p className="text-sm text-gray-600">Wallet: {userInfo.walletAddress.substring(0, 10)}...</p>
            )}
          </div>

          {/* User Info */}
          {userInfo && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2 text-blue-800">Account Status:</h3>
              <p className="text-sm text-blue-700">
                {userInfo.isNewUser ? '🎉 New account created!' : '👋 Existing user logged in'}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {userInfo.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContinueToApp}
              className="w-full bg-yellow-400 text-black p-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
            >
              View Your Activities
            </button>
            
            <button
              onClick={handleBackToHome}
              className="w-full bg-white text-gray-700 border border-gray-300 p-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to PESIA's Kitchen
            </button>
          </div>

          {/* Auto-redirect notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Automatically redirecting to your activities in 3 seconds...
            </p>
            <div className="mt-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto"></div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What's next?</strong> View all your activities, track your impact, 
              and earn rewards in your activities dashboard. Keep making a difference!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto mt-8">
        {/* PESIA's Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PESIA's Kitchen</h1>
          <p className="text-gray-600 mt-2">Fighting Food Waste Together</p>
        </div>

        <h2 className="text-2xl font-bold mb-4">Join Event</h2>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">Event Type: <span className="font-semibold">{qrData.type}</span></p>
          {qrData.eventId && (
            <p className="text-sm text-gray-500 mt-1">Event ID: {qrData.eventId}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter your phone number
            </label>
            <input
              type="tel"
              placeholder="+254712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll use this to create your account and track your impact
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black p-3 rounded-lg font-medium hover:bg-yellow-500 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Create Account & Join'
            )}
          </button>
        </form>

        {/* Info Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By joining, you agree to help reduce food waste and make a positive impact in your community
          </p>
        </div>
      </div>
    </div>
  );
}