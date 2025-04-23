import { ChevronLeftIcon } from "lucide-react";
import React from "react";

const nftData = [
  {
    id: 1,
    name: "NFT 1",
    color: "#367bc6",
    date: "13-04-2025",
    event: "Event Name",
  },
  {
    id: 2,
    name: "NFT 2",
    color: "#4f3970",
    date: "13-04-2025",
    event: "Event Name",
  },
  {
    id: 3,
    name: "NFT 3",
    color: "#c69b46",
    date: "13-04-2025",
    event: "Event Name",
  },
  {
    id: 4,
    name: "NFT 4",
    color: "#fc0202",
    date: "13-04-2025",
    event: "Event Name",
  },
];

export default function NfTs() {
  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button className="p-2">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">NFTs</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {nftData.map((nft) => (
            <div key={nft.id} className="rounded-xl overflow-hidden">
              <div
                className="h-[120px] rounded-t-xl"
                style={{ backgroundColor: nft.color }}
              />
              <div className="bg-white p-4 rounded-b-xl shadow-md">
                <h3 className="font-semibold text-sm mb-2">{nft.name}</h3>
                <p className="text-xs text-gray-500 mb-1">Date: {nft.date}</p>
                <p className="text-xs text-gray-500">Event: {nft.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
