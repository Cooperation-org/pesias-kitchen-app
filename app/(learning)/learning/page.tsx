'use client';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import EducationCard from "@/components/learning/EducationCard";

const LearningPage = () => {
  const router = useRouter()

  // Handle start learning click
  const handleQuizClick = () => {
    router.push('/learning/quiz')
  }
  return (
    <section className="px-5 py-10 max-w-lg mx-auto space-y-6">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-2xl font-display font-black text-center mb-8 text-foreground"
      >
        What You'll Learn
      </motion.h2>

      <EducationCard icon="🍎" title="Food Rescue & Hunger" color="red" index={0}>
        <p>
          Every year, <strong>40% of food in the U.S. goes to waste</strong> while millions face hunger. Food rescue redirects surplus food from stores, farms, and restaurants to communities that need it.
        </p>
        <p>
          The EAT Food Rescue Program connects local partners to recover food that would otherwise be thrown away — and delivers it directly to schools and families.
        </p>
        <p>
          When you participate, you're part of a chain that <strong>reduces waste and feeds people</strong>. That's real impact.
        </p>
      </EducationCard>

      <EducationCard icon="💰" title="Financial Inclusion & UBI" color="green" index={1}>
        <p>
          <strong>Financial inclusion</strong> means making sure everyone — regardless of income — has access to basic financial tools and support.
        </p>
        <p>
          <strong>Universal Basic Income (UBI)</strong> is a model where people receive regular, no-strings-attached payments to cover basic needs. It's been tested around the world with promising results.
        </p>
        <p>
          Blockchain makes this possible at scale — sending micropayments directly to people's wallets without middlemen, fees, or delays.
        </p>
      </EducationCard>

      <EducationCard icon="🔗" title="Blockchain & Transparent Impact" color="blue" index={2}>
        <p>
          A <strong>blockchain</strong> is a digital record book that everyone can see but no one can secretly change. Every transaction is permanent and transparent.
        </p>
        <p>
          When you complete this module, your <strong>Proof of Impact</strong> gets recorded on the blockchain. This proves you learned, participated, and contributed — forever.
        </p>
        <p>
          Your action triggers a real transfer to <strong>Pesia's Kitchen</strong>, funding meals for your community. Every impact is tracked, verified, and visible.
        </p>
      </EducationCard>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="pt-6 flex justify-center"
      >
        <button
          onClick={handleQuizClick}
          className="gradient-nature rounded-full px-8 py-3.5 text-secondary-foreground font-display font-bold text-base shadow-elevated"
        >
          I'm Ready for the Quiz ✏️
        </button>
      </motion.div>
    </section>
  );
};

export default LearningPage