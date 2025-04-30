/* eslint-disable @next/next/no-img-element */
"use client"; // Add this line at the top of your file

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";

function App() {
  const [activity, setActivity] = useState({
    name: "Activity name",
    date: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setActivity((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 flex items-center justify-between">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
      </header>

      <div className="px-4 pt-2 pb-6">
        <input
          type="text"
          name="name"
          value={activity.name}
          onChange={handleChange}
          className="text-2xl font-bold w-full border-none focus:outline-none focus:ring-0 p-0 mb-4"
          placeholder="Activity name"
        />

        <div className="space-y-2">
          <div>
            <label className="text-gray-500 text-sm">Date</label>
          </div>

          <div>
            <label className="text-gray-500 text-sm">Description</label>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <button
          onClick={() => console.log("Download recipient QR")}
          className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors duration-200 active:scale-98 transform shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-50">
            {/* Add the recipient QR image */}
            <img
              src="/scan.png" // Replace this with the actual path to your recipient QR image
              alt="Recipient QR Code"
              className="h-6 w-6 object-contain"
            />
          </div>
          <span className="font-bold text-gray-800">
            Download QR Code of Recipient
          </span>
        </button>

        <button
          onClick={() => console.log("Download volunteers QR")}
          className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors duration-200 active:scale-98 transform shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-50">
            {/* Add the volunteers QR image */}
            <img
              src="/scan.png" // Replace this with the actual path to your volunteers QR image
              alt="Volunteers QR Code"
              className="h-6 w-6 object-contain"
            />
          </div>
          <span className="font-bold text-gray-800">
            Download QR Code of Volunteers
          </span>
        </button>

        <button
          onClick={() => console.log("Share event")}
          className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors duration-200 active:scale-98 transform shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50">
            {/* Add the Share Event image */}
            <img
              src="/share.png" // Replace this with the actual path to your share event image
              alt="Share Event"
              className="h-6 w-6 object-contain"
            />
          </div>
          <span className="font-bold text-gray-800">Share Event</span>
        </button>
      </div>
    </div>
  );
}

export default App;
