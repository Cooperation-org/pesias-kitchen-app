'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useAccount } from 'wagmi';
import EventImpactModal from '@/components/EventImpactModal';
import { eventServices } from '@/services/eventServices';
import type { ProcessedEvent, Participant } from '@/app/(dashboard)/dashboard/events/types';
import { mapServerEventToProcessedEvent } from "@/app/(dashboard)/dashboard/events/utils";
import api, { recordActivity } from '@/services/api';
import { AxiosResponse } from 'axios'

interface ActivityResponse {
  activity: {
    _id: string;
    id: string;
    type: string;
    rewardAmount: number;
    description?: string;
  };
}

const ImpactPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [event, setEvent] = useState<ProcessedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityRecorded, setActivityRecorded] = useState(false);

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
            p.walletAddress.toLowerCase() === address.toLowerCase() &&
            p.role === 'volunteer' &&
            p.status !== 'cancelled'
        );
        if (!participant) return;

        // 3) Avoid double-recording if user refreshes
        if (activityRecorded) return;

        // 4) Get or create quiz QR, then record activity
        const quizQrRes = await api.post(`/qrquiz/${processed.id}`);
        const quizQr = quizQrRes.data.qrCode;

        const activityData = {
          eventId: quizQr.event.id,
          qrCodeId: quizQr.id,
          quantity: quizQr.event.defaultQuantity || 1,
          notes: 'Completed learning module quiz',
        }

        await recordActivity(activityData) as unknown as AxiosResponse<ActivityResponse>;

        setActivityRecorded(true);
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
      p.walletAddress.toLowerCase() === address.toLowerCase() &&
      p.role === 'volunteer' &&
      p.status !== 'cancelled'
  );

  if (!participant) {
    return <div>You must be a volunteer participant for this event to view impact.</div>;
  }

  return (
    <div className="px-5 py-10 max-w-3xl mx-auto">
      {/* Simple passed message */}
      <div className="mb-6 text-center">
        <h2 className="font-display font-black text-2xl text-foreground mb-2">
          You Passed!
        </h2>
        <p className="text-muted-foreground">
          Your learning for {event.title} has been recorded. Here is the impact of this event so far.
        </p>
      </div>

      <EventImpactModal
        isOpen={true}
        eventId={event.id}
        eventTitle={event.title}
        onClose={() => router.push('/dashboard/events')}
      />
    </div>
  );
};

export default ImpactPage;