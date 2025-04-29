import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="w-full px-10 p-5 space-y-6">
      {/* Scan Image Section */}
      <div
        className="relative"
        style={{
          width: "80%", // Increased size, use percentage for responsiveness
          maxWidth: "500px", // Optional: maximum size for large screens
          height: "150px", // Increased height
          margin: "0 auto 20px", // Centers the div horizontally
        }}
      >
        <img
          src="/scan.png" // Ensure the image has no background
          alt="Scan Icon"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain", // Ensures the image maintains aspect ratio
          }}
        />
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
