'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useAccount } from 'wagmi';
import { eventServices } from '@/services/eventServices';
import type { ProcessedEvent, Participant } from '@/app/(Internal)/dashboard/events/types';
import { mapServerEventToProcessedEvent } from "@/app/(Internal)/dashboard/events/utils";
import api, { mintLearningActivityNFT } from '@/services/api';
import { AxiosResponse } from 'axios'
import { useAuthContext } from '@/providers/web3Provider';
import { useUserActivities } from '@/hooks/useUserActivities';
import { motion } from 'framer-motion';
import { Activity } from '@/types/api';

interface ActivityResponse {
  activity: Activity;
}

const ImpactPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const { mutateActivities, error, isLoading } = useUserActivities();
  const { address, isConnected } = useAccount();
  const { user } = useAuthContext();
  const [event, setEvent] = useState<ProcessedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityRecorded, setActivityRecorded] = useState(false);
  const [mintedActivity, setMintedActivity] = useState<Activity | null>(null)

  useEffect(() => {
    if (!eventId) return;

    const loadAndRecord = async () => {
      try {
        // 1) Load event
        const response = await eventServices.getEventById(eventId as string);
        const processed: ProcessedEvent = mapServerEventToProcessedEvent(response);
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

        console.log("QUIZ QR", quizQr)

        const activityData = {
          eventId: quizQr.event.id,
          qrCodeId: quizQr.id,
          quantity: quizQr.event.defaultQuantity || 1,
          notes: 'Completed learning module quiz',
        }

        console.log("ACTIVITY DATA EVENT ID: ", activityData.eventId)

        console.log("ACTIVITY DATA: ", activityData)

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

  useEffect(() => {
    async function load() {
      if (!eventId) return;
      const response = await eventServices.getEventById(eventId);
      const processed: ProcessedEvent = mapServerEventToProcessedEvent(response);
      setEvent(processed);
      setLoading(false);
    }
    load();
  }, [eventId]);

  if (!isConnected || !address) {
    router.replace('/dashboard/events');
    return null;
  }

  if (loading || !event) return /* spinner */;

  const participant = event.participants.find(
    (p: Participant) =>
      p._id === user?.id
      // p.role === 'volunteer' &&
      // p.status !== 'cancelled'
  );

  if (!participant) {
    return <div>You must be a volunteer participant for this event to view impact.</div>;
  }

  // Loading state
  if (loading || isLoading) {
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
  if (error) {
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
    // <div className="px-5 py-10 max-w-3xl mx-auto">
    //   {/* Simple passed message */}
    //   <div className="mb-6 text-center">
    //     <h2 className="font-display font-black text-2xl text-foreground mb-2">
    //       You Passed!
    //     </h2>
    //     <p className="text-muted-foreground">
    //       Your learning for {event.title} has been recorded. Here is the impact of this event so far.
    //     </p>
    //   </div>
    // </div>
    <section className="px-5 py-10 max-w-lg mx-auto">
        <motion.div
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
                <p className="text-xs text-muted-foreground">Transfer sent to Pesia's Kitchen</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
              <span className="text-xl">🌍</span>
              <div>
                <p className="text-xs font-display font-bold text-foreground">Impact Verified</p>
                <p className="text-xs text-muted-foreground">Transparent & permanent</p>
              </div>
           </div>
          </div>
          <div className="rounded-xl bg-muted p-4 mt-4 mb-2">
            <p className="text-xs text-muted-foreground mb-1 font-display font-semibold">Transaction Hash</p>
            <p className="text-xs font-mono text-foreground break-all">
              {mintedActivity?.txHash}
            </p>
          </div>
        </motion.div>
      </section>
  );
};

export default ImpactPage;