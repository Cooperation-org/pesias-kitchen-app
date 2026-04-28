'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import type { ProcessedEvent, Participant } from '@/app/(Internal)/dashboard/events/types';
import { mapServerEventToProcessedEvent } from "@/app/(Internal)/dashboard/events/utils";
import api, { mintLearningActivityNFT, donateFromPool } from '@/services/api';
import { AxiosResponse } from 'axios'
import { useAuthContext } from '@/providers/AppProvider';
import { useUserActivities } from '@/hooks/useUserActivities';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from '@/types/api';
import { useLearningEvent } from '@/hooks/useLearningEvent';

interface ActivityResponse {
  activity: Activity;
}

type Phase = 'ready' | 'sending' | 'confirmed';

const REWARD_AMOUNT = process.env.NEXT_PUBLIC_REWARD_AMOUNT || '0'
const PESIA_WALLET = process.env.NEXT_PUBLIC_PESIA_WALLET || ''

const ImpactPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated } = useAuthContext();
  const { mutateActivities, error, isLoading } = useUserActivities(isAuthenticated);
  const { learningEvent, isLoading: learningHookLoading, error: learningHookError } = useLearningEvent();
  const [event, setEvent] = useState<ProcessedEvent | null>(null);
  const [phase, setPhase] = useState<Phase>('ready');
  const [loading, setLoading] = useState(true);
  const [activityRecorded, setActivityRecorded] = useState(false);
  const [mintedActivity, setMintedActivity] = useState<Activity | null>(null)

  const claimedAt = typeof window !== "undefined" ? localStorage.getItem("eat_impact_claimed") : null;
  const storedTxHash = typeof window !== "undefined" ? localStorage.getItem("eat_impact_txHash") : null;
  const isExpired = !claimedAt || Date.now() - Number(claimedAt) > 24 * 60 * 60 * 1000;
  const [txHash, setTxHash] = useState<string | null>(!isExpired ? storedTxHash : null);

  useEffect(() => {
    if (!eventId || !learningEvent) return;
    const processed: ProcessedEvent = mapServerEventToProcessedEvent(learningEvent);
    setEvent(processed);
    setLoading(false);
  }, [eventId, learningEvent]);

  const isVolunteerParticipant = useMemo(() => {
    if (!event || !user) return false;
    return event.participants.some(
      (p: Participant) => p._id === user.id
    );
  }, [event, user]);

  const handleGenerateImpact = useCallback(async () => {
    if (phase !== 'ready') return;
    if (!eventId || !event) return;

    setPhase('sending');

    try {
      // Logged-in volunteer participant -> mintLearningActivityNFT path
      if (isAuthenticated && isConnected && address && isVolunteerParticipant) {
        // 1) Get or create quiz QR for this event
        const quizQrRes = await api.post(`/qrquiz/quiz/${event.id}`);
        const quizQr = quizQrRes.data.qrCode;

        const activityData = {
          eventId: quizQr.event.id,
          qrCodeId: quizQr.id,
          quantity: quizQr.event.defaultQuantity || 1,
          notes: 'Completed learning module quiz',
        };

        const activityRes = await mintLearningActivityNFT(activityData) as unknown as AxiosResponse<ActivityResponse>;
        const newActivity = activityRes.data.activity;

        setMintedActivity(newActivity);

        mutateActivities(prev => {
          if (!prev) return prev;
          return [newActivity as any, ...prev];
        }, false);

        setPhase('confirmed');

        toast.success('Learning impact recorded on-chain for your wallet.');
      } else {
        // Anonymous or non-participant
        const res = await donateFromPool(PESIA_WALLET, Number(REWARD_AMOUNT))

        const txHashRes = res.donateResult?.txHash ?? null;

        setMintedActivity(prev => ({
          ...(prev ?? {} as Activity),
          txHash: txHashRes ?? null,
        }));

        localStorage.setItem("eat_impact_claimed", String(Date.now()));
        if (res.donateResult?.txHash) {
          localStorage.setItem("eat_impact_txHash", res.donateResult.txHash);
        }
        setTxHash(txHashRes);

        setPhase('confirmed');

        toast.success('Learning impact recorded. Thanks for learning!');
      }
    } catch (e: any) {
      console.error('Error generating impact proof', e);
      toast.error(e?.response?.data?.message || 'Unable to record impact. Please try again.');
      setPhase('ready');
    }
  }, [
    phase,
    eventId,
    event,
    isAuthenticated,
    isConnected,
    address,
    isVolunteerParticipant,
    mutateActivities,
  ]);

  useEffect(() => {
    if (!eventId) return;

    const loadAndRecord = async () => {
      try {
        // 1) Load event
        const processed: ProcessedEvent = mapServerEventToProcessedEvent(learningEvent);
        setEvent(processed);
        setLoading(false);

        // 2) Guard: needs wallet and participant
        if (!isConnected || !address) return;

        const participant = processed.participants.find(
          (p: Participant) =>
            p._id === user?.id
            // p.role === 'volunteer' &&
            // p.status !== 'cancelled'
        );
        if (!participant) return;

        // 3) Avoid double-recording if user refreshes
        if (activityRecorded) return;

        // 4) Get or create quiz QR, then record activity
        const quizQrRes = await api.post(`/qrquiz/quiz/${processed.id}`);
        const quizQr = quizQrRes.data.qrCode;

        const activityData = {
          eventId: quizQr.event.id,
          qrCodeId: quizQr.id,
          quantity: quizQr.event.defaultQuantity || 1,
          notes: 'Completed learning module quiz',
        }

        const activityRes = await mintLearningActivityNFT(activityData) as unknown as AxiosResponse<ActivityResponse>;
        const newActivity = activityRes.data.activity;
        setMintedActivity(newActivity)
        setActivityRecorded(true);

        // Optimistically update SWR cache
        mutateActivities(prev => {
          if (!prev) return prev;
          return [newActivity as any, ...prev]; // or push, depending on sort
        }, false);

        return newActivity
      } catch (e) {
        console.error('Error loading impact page / recording activity', e);
        // optionally toast, then redirect
      }
    };

    loadAndRecord();
  }, [eventId, isConnected, address, activityRecorded]);

  // Loading state
  if (loading || isLoading || learningHookLoading) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading impact data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || learningHookError || !event) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-4">Failed to load impact data. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="px-5 py-10 max-w-lg mx-auto -mt-18 min-h-screen flex items-center justify-center">
      <AnimatePresence mode="wait">
        {phase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border-2 border-eat-green/30 bg-eat-green/5 p-8 text-center flex flex-col items-center shadow-elevated"
          >
            <div className="w-24 h-24 rounded-full gradient-warm p-1 mb-6">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <span className="text-4xl">🏆</span>
              </div>
            </div>
            <h3 className="font-display font-black text-2xl mb-2 text-gradient-rainbow">
              You Passed!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              You've proven your understanding. Now create your Proof of Impact and fund meals at Pesia's Kitchen.
              {isAuthenticated && isVolunteerParticipant
                ? " This will also mint your on-chain proof and rewards."
                : " As a guest, your learning will be counted off-chain."}
            </p>

            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                <span className="text-xl">📜</span>
                <div>
                  <p className="text-xs font-display font-bold text-foreground">Proof of Education</p>
                  <p className="text-xs text-muted-foreground">Module completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                <span className="text-xl">🍽️</span>
                <div>
                  <p className="text-xs font-display font-bold text-foreground">Meal Funded</p>
                  <p className="text-xs text-muted-foreground">Support sent to Pesia&apos;s Kitchen</p>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateImpact}
              className="gradient-nature cursor-pointer rounded-full px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-display font-bold text-base shadow-elevated"
            >
              Generate Proof of Impact
            </motion.button>
          </motion.div>
        )}

        {phase === 'sending' && (
          <motion.div
            key="sending"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-2xl border-2 border-eat-green/30 bg-eat-green/5 p-8 text-center shadow-elevated"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-eat-green/30 border-t-eat-green mx-auto mb-6"
            />
            <h2 className="text-2xl font-display font-black mb-2 text-foreground">
              Processing your impact...
            </h2>
            <p className="text-sm text-muted-foreground">
              This may take a few seconds. Please don&apos;t close the page.
            </p>
          </motion.div>
        )}

        {phase === 'confirmed' && (
          <motion.div
            key="confirmed"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border-2 border-eat-green/30 bg-eat-green/5 p-8 text-center shadow-elevated"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-3xl mb-4"
            >
              ✅
            </motion.div>
            <h3 className="font-display font-black text-2xl mb-2 text-foreground">
              Proof of Impact Generated!
            </h3>
            <p className="text-eat-green font-display font-bold text-lg mb-4">
              Your impact has been recorded.
            </p>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                <span className="text-xl">📜</span>
                <div>
                  <p className="text-xs font-display font-bold text-foreground">Proof of Education</p>
                  <p className="text-xs text-muted-foreground">Module completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                <span className="text-xl">🍽️</span>
                <div>
                  <p className="text-xs font-display font-bold text-foreground">Meal Funded</p>
                  <p className="text-xs text-muted-foreground">Support sent to Pesia&apos;s Kitchen</p>
                </div>
              </div>
              {txHash && (
                <div className="rounded-xl bg-muted p-4 mt-4 mb-2">
                  <p className="text-xs text-muted-foreground mb-1 font-display font-semibold">Transaction Hash</p>
                  <p className="text-xs font-mono text-foreground break-all">
                    {txHash}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ImpactPage;