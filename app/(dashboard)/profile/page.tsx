import { Mail, Edit2, User, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function UserProfile() {
  return (
    <div className="w-full  p-4 md:p-6 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="#" className="p-2">
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </Link>
          {/* <h1 className='text-3xl font-bold text-gray-800'>Activities</h1> */}
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden relative">
            <Image
              src={require("./person.png")}
              alt="Profile picture"
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-1">
            <User className="w-3 h-3 text-white" />
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-lg">Boris Stweart</h2>
          <div className="flex items-center text-gray-500 text-sm">
            <Mail className="w-3 h-3 mr-1" />
            <span>happy203@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Personal Details Card */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Personal Details</h3>
          <button className="text-gray-500 hover:text-gray-700">
            <Edit2 className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-500 text-sm">Boris Stweart</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">happy203@gmail.com</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">+12 34123 ******</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Country</p>
          </div>
        </div>
      </div>

      {/* Helpful Links Card */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <h3 className="font-medium text-lg mb-4">Helpful Links</h3>

        <div className="space-y-4">
          <Link
            href="#"
            className="block text-gray-500 text-sm hover:text-gray-700"
          >
            Contact support
          </Link>

          <Link
            href="#"
            className="block text-gray-500 text-sm hover:text-gray-700"
          >
            Privacy Policy
          </Link>

          <Link
            href="#"
            className="block text-gray-500 text-sm hover:text-gray-700"
          >
            Terms and conditions
          </Link>
        </div>
      </div>

      {/* Logout Button */}
      <button className="w-full mb-10 bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-3 rounded-lg transition-colors">
        LOGOUT
      </button>
    </div>
  );
}
