"use client";

import React from "react";
import {
  AlignLeft,
  ArrowLeft,
  ArrowLeftIcon,
  ChevronLeft,
  MoveLeft,
  ToggleLeft,
} from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

// Utility function
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Button component
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-1 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Main Component
const Rewards = (): JSX.Element => {
  const rewardEvents = [
    { id: 1, name: "Event xyz", date: "26 Nov 2021", amount: "$321.00" },
    { id: 2, name: "Event xyz", date: "26 Nov 2021", amount: "$321.00" },
    { id: 3, name: "Event xyz", date: "26 Nov 2021", amount: "$321.00" },
  ];

  return (
    <div className=" w-full flex-1 flex justify-center bg-white">
      <div className="w-full bg-white pb-[110px] px-5  md:p-6 lg:p-8">
        {/* Header */}
        <div className="h-[43px]" />
        <ChevronLeft className="h-6 w-6 text-gray-800" />
        <div className="relative flex justify-between items-center mt-3 mb-6">
          <h1 className="text-2xl font-bold text-[#303030] absolute left-1/2 -translate-x-1/2">
            Rewards
          </h1>
        </div>

        {/* Balance Card */}
        <div className="bg-white shadow-lg rounded-xl p-4 flex flex-col items-center mb-6">
          <div className="flex items-center text-xl font-bold text-[#303030]">
            <Image
              width={5}
              height={50}
              src={require("./gg.svg")}
              className="w-6 h-6 mr-2"
              alt="coin"
            />
            $234
          </div>
          <div className="text-xs text-gray-400 mt-1">G$ earned</div>
        </div>

        {/* Rewards List */}
        <div className="bg-white border rounded-xl shadow-sm">
          {rewardEvents.map((event, index) => (
            <div
              key={event.id}
              className={`flex justify-between items-center px-4 py-3 ${
                index < rewardEvents.length - 1
                  ? "border-b border-gray-200"
                  : ""
              }`}
            >
              <div>
                <div className="text-sm font-medium text-[#555]">
                  {event.name}
                </div>
                <div className="text-xs text-gray-400">{event.date}</div>
              </div>
              <div className="text-sm font-semibold text-[#555]">
                {event.amount}
              </div>
            </div>
          ))}
        </div>

        {/* Fixed Bottom Button */}
        <div className=" mt-5 w-full flex justify-center">
          <Button className="bg-[#4CAF50] w-[263px] h-[50px] rounded-[8px] text-white text-[13px] font-bold tracking-wide shadow-none hover:bg-[#43A047]">
            REDEEM REWARDS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
