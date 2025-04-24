import { Scan, CircleDollarSign } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="w-full   px-10 p-5 space-y-6">
      {/* Stats Cards */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex  gap-4 justify-between">
          {/* Activities Created Card */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-50 rounded-md">
              <Scan className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">43</h2>
              <p className="text-sm text-gray-400">Activities created</p>
            </div>
          </div>

          {/* G$ Rewarded Card */}
          <div className="flex items-center gap-3 ">
            <div className="flex   items-center justify-center w-10 h-10 bg-blue-50 rounded-md">
              <CircleDollarSign className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">$234</h2>
              <p className="text-sm text-gray-400">G$ rewarded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Receipts */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Recent Receipts</h3>
          <Link href="#" className="text-blue-500 text-sm font-medium">
            See all
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="space-y-4">
            {receipts.map((receipt, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2"
              >
                <div>
                  <p className="font-medium text-gray-800">{receipt.name}</p>
                  <p className="text-sm text-gray-400">
                    {receipt.event} - {receipt.date}
                  </p>
                </div>
                <p className="font-medium">${receipt.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const receipts = [
  {
    name: "User Name",
    event: "Event xyz",
    date: "26 Nov 2021",
    amount: "321.00",
  },
  {
    name: "User Name",
    event: "Event xyz",
    date: "26 Nov 2021",
    amount: "321.00",
  },
  {
    name: "User Name",
    event: "Event xyz",
    date: "26 Nov 2021",
    amount: "321.00",
  },
  {
    name: "User Name",
    event: "Event xyz",
    date: "26 Nov 2021",
    amount: "321.00",
  },
];
