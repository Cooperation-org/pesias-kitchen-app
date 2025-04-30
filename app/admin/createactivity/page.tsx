"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateActivity = () => {
  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
      {/* Back Arrow */}
      <button
        className="rounded-full p-2 hover:bg-gray-100"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="max-w-sm mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Create Activity</h1>

        <div>
          <label className="font-semibold">Event Name</label>
          <Input placeholder="Name" className="mt-1" />
        </div>

        <div>
          <label className="font-semibold">Select Date & Time</label>
          <Input placeholder="Date" className="mt-1" />
          <Input placeholder="Time" className="mt-2" />
        </div>

        <div>
          <label className="font-semibold">Add Description</label>
          <Textarea placeholder="Description" className="mt-1" />
        </div>

        <div>
          <label className="font-semibold">Event Type</label>
          <Select>
            <SelectTrigger className="mt-1 w-full px-4 py-2 border  shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400">
              <SelectValue placeholder="Select Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="font-semibold">G$ Rewards Amount</label>
          <Input type="number" placeholder="Enter Amount" className="mt-1" />
        </div>

        <div>
          <label className="font-semibold">Location</label>
          <Select>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select Event Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hall-a">Hall A</SelectItem>
              <SelectItem value="hall-b">Hall B</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="font-semibold">QR Code Expiry Duration</label>
          <Input placeholder="Expires QR after these hours." className="mt-1" />
        </div>

        <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-2xl shadow-md mt-4">
          CREATE EVENT & GENERATE QR CODE
        </Button>
      </div>
    </div>
  );
};

export default CreateActivity;
