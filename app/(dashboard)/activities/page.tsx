import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";

export default function ActivitiesPage() {
  return (
    <div className="w-full bg-white min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="#" className="p-2">
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Activities</h1>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {/* Activity Card 1 */}
        <div className="border border-gray-200 rounded-lg p-4 flex items-start">
          <div className="w-12 h-12 rounded-full bg-gray-100 mr-4 flex-shrink-0"></div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Activity name</h3>
            <p className="text-gray-500 text-sm mb-3">Description</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm border border-yellow-400 text-yellow-500 rounded-md hover:bg-yellow-50">
                Interested
              </button>
              <button className="px-4 py-2 text-sm bg-yellow-400 text-white rounded-md flex items-center gap-1 hover:bg-yellow-500">
                <span>Share Event</span>
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Activity Card 2 */}
        <div className="border border-gray-200 rounded-lg p-4 flex items-start">
          <div className="w-12 h-12 rounded-full bg-gray-100 mr-4 flex-shrink-0"></div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Activity name</h3>
            <p className="text-gray-500 text-sm mb-3">Description</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm border border-yellow-400 text-yellow-500 rounded-md hover:bg-yellow-50">
                Interested
              </button>
              <button className="px-4 py-2 text-sm bg-yellow-400 text-white rounded-md flex items-center gap-1 hover:bg-yellow-500">
                <span>Share Event</span>
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Activity Card 3 */}
        <div className="border border-gray-200 rounded-lg p-4 flex items-start">
          <div className="w-12 h-12 rounded-full bg-gray-100 mr-4 flex-shrink-0"></div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Activity name</h3>
            <p className="text-gray-500 text-sm mb-3">Description</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm border border-yellow-400 text-yellow-500 rounded-md hover:bg-yellow-50">
                Interested
              </button>
              <button className="px-4 py-2 text-sm bg-yellow-400 text-white rounded-md flex items-center gap-1 hover:bg-yellow-500">
                <span>Share Event</span>
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Activity Card 4 */}
        <div className="border border-gray-200 rounded-lg p-4 flex items-start">
          <div className="w-12 h-12 rounded-full bg-gray-100 mr-4 flex-shrink-0"></div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Activity name</h3>
            <p className="text-gray-500 text-sm mb-3">Description</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm border border-yellow-400 text-yellow-500 rounded-md hover:bg-yellow-50">
                Interested
              </button>
              <button className="px-4 py-2 text-sm bg-yellow-400 text-white rounded-md flex items-center gap-1 hover:bg-yellow-500">
                <span>Share Event</span>
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
