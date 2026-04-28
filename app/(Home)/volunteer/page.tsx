"use client"
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import { donateFromPool } from '@/services/api';
import { useRouter } from 'next/navigation';

const POOL_WALLET = "0x5ca06A628Bf74b6E121d0a486C8ae2518e15cC56";
const PESIA_WALLET = "0xf8B4c7098D195D12c1336A09fDDaa9aFa11Bd097";
const REWARD_AMOUNT = 1;

type Phase = "ready" | "sending" | "confirmed";

const VolunteerThankYou = () => {
  const router = useRouter()
  const claimedAt = typeof window !== "undefined" ? localStorage.getItem("eat_volunteer_claimed") : null;
  const storedTxHash = typeof window !== "undefined" ? localStorage.getItem("eat_volunteer_txHash") : null;
  const isExpired = !claimedAt || Date.now() - Number(claimedAt) > 24 * 60 * 60 * 1000;
  const [phase, setPhase] = useState<Phase>(!isExpired ? "confirmed" : "ready");
  const [txHash, setTxHash] = useState<string | null>(!isExpired ? storedTxHash : null);

  const handleVolunteer = useCallback(async () => {
    if (phase !== "ready") return;
    setPhase("sending");
    try {
      const res = await donateFromPool(PESIA_WALLET, REWARD_AMOUNT);

      if (!res.success) {
        toast.error(res.message || "Donation failed. Please try again later.")
        setPhase("ready");
        return;
      }

      localStorage.setItem("eat_volunteer_claimed", String(Date.now()));
      if (res.donateResult?.txHash) {
        localStorage.setItem("eat_volunteer_txHash", res.donateResult.txHash);
      }
      setTxHash(res.donateResult?.txHash ?? null);
      setPhase("confirmed");

      toast.success(res.message || "Your donation has been recorded on chain.")
    } catch (e) {
      console.error(e);
      toast.error("Please check your connection and try again.")
      setPhase("ready");
    }
  }, [phase, txHash]);

  const handleBackToHome = () => {
    router.replace('/')
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-8 left-6 w-12 h-12 rounded-xl border-[3px] border-eat-green rotate-[-8deg] opacity-60" />
      <div className="absolute top-8 right-6 w-12 h-12 rounded-xl border-[3px] border-eat-purple rotate-[8deg] opacity-60" />
      <div className="absolute bottom-12 left-6 w-12 h-12 rounded-xl border-[3px] border-eat-orange rotate-[8deg] opacity-60" />
      <div className="absolute bottom-12 right-6 w-12 h-12 rounded-xl border-[3px] border-eat-blue rotate-[-8deg] opacity-60" />
      <div className="absolute top-20 left-1/4 w-2 h-2 bg-eat-yellow opacity-50" />
      <div className="absolute top-16 right-1/4 w-3 h-3 bg-eat-green opacity-40" />
      <div className="absolute bottom-28 left-1/3 w-2 h-2 bg-eat-orange opacity-50" />
      <div className="absolute bottom-24 right-1/3 w-3 h-3 bg-eat-blue opacity-40" />

      <AnimatePresence mode="wait">
        {phase === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 rounded-full gradient-warm p-1 mb-6">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <span className="text-4xl">🤝</span>
              </div>
            </div>

            <h1 className="text-3xl font-black mb-3 text-gradient-rainbow">Volunteer Now</h1>

            <p className="text-muted-foreground text-sm max-w-xs mb-3 leading-relaxed">
              By volunteering, you trigger a GoodDollar transfer from the community pool to Pesia's Kitchen — funding real meals for families in need.
            </p>

            <div className="w-full max-w-sm rounded-xl bg-muted/50 border border-border p-4 mb-6 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>📤</span>
                <span className="font-bold">From: </span>
                <span className="font-mono text-[10px]">
                  {POOL_WALLET.slice(0, 8)}...{POOL_WALLET.slice(-4)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>📥</span>
                <span className="font-bold">To: </span>
                <span className="font-mono text-[10px]">
                  {PESIA_WALLET.slice(0, 8)}...{PESIA_WALLET.slice(-4)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>💰</span>
                <span className="font-bold">Amount: </span>
                <span>{REWARD_AMOUNT.toString()} G$</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleVolunteer}
              className="gradient-rainbow rounded-full px-10 py-4 text-primary-foreground font-bold text-lg shadow-rainbow animate-pulse-glow cursor-pointer"
            >
              Volunteer Now
            </motion.button>
          </motion.div>
        )}

        {phase === "sending" && (
          <motion.div
            key="sending"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 rounded-full border-4 border-eat-orange/30 border-t-eat-orange mb-6"
            />
            <h2 className="text-2xl font-black mb-2 text-foreground">Processing Transaction...</h2>
            <p className="text-sm text-muted-foreground">Sending {REWARD_AMOUNT.toString()}G$ to Pesia's Kitchen</p>
          </motion.div>
        )}

        {phase === "confirmed" && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-28 h-28 rounded-full gradient-rainbow p-1">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <span className="text-5xl">🎉</span>
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-black mb-4 text-gradient-rainbow"
            >
              Thank You for Your Participation!
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-eat-orange font-bold mb-2"
            >
              🎉 You helped fund meals for Pesia's Kitchen!
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-muted-foreground mb-6"
            >
              EDUCATION • ACTION • TOGETHER
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="w-full max-w-sm space-y-3 mb-6"
            >
              <div className="rounded-xl bg-muted p-4">
                <p className="text-xs text-muted-foreground mb-1 font-semibold">Transaction Hash</p>
                <p className="text-xs font-mono text-foreground break-all">{txHash}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-eat-green/10 border border-eat-green/20 p-3">
                <span className="text-xs font-bold text-eat-green">
                  {REWARD_AMOUNT.toString()} G$ → Pesia's Kitchen
                </span>
                <span className="text-eat-green text-lg">✅</span>
              </div>
            </motion.div>

            <motion.a
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              href={`https://celoscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-eat-blue underline underline-offset-2 font-bold mb-8"
            >
              🔗 View on Celo Explorer
            </motion.a>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToHome}
              className="rounded-full px-6 py-3 bg-eat-blue text-primary-foreground font-bold text-sm shadow-soft"
            >
              Back to Home
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VolunteerThankYou;
