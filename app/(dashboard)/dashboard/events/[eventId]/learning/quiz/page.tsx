'use client';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const questions = [
  {
    question: "What does food rescue do?",
    options: [
      "Throws away expired food safely",
      "Redirects surplus food to communities in need",
      "Sells discounted food online",
      "Grows food in laboratories",
    ],
    correct: 1,
  },
  {
    question: "What is Universal Basic Income (UBI)?",
    options: [
      "A government tax on all purchases",
      "Regular payments to cover basic needs, with no strings attached",
      "A loan program for small businesses",
      "An investment fund for students",
    ],
    correct: 1,
  },
  {
    question: "Why is blockchain useful for tracking impact?",
    options: [
      "It makes transactions anonymous and untraceable",
      "It stores data that is transparent and can't be secretly changed",
      "It speeds up internet connections",
      "It replaces all banks",
    ],
    correct: 1,
  },
  {
    question: "What happens when you complete this module?",
    options: [
      "You receive cryptocurrency to trade",
      "A Proof of Impact is recorded and a donation goes to Pesia's Kitchen",
      "Your school gets a cash prize",
      "You become a blockchain developer",
    ],
    correct: 1,
  },
  {
    question: "How does blockchain help financial inclusion?",
    options: [
      "By requiring bank accounts for all users",
      "By enabling direct micropayments without middlemen or high fees",
      "By increasing loan interest rates",
      "By limiting access to wealthy individuals",
    ],
    correct: 1,
  },
];

const QuizPage = () => {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handlePass = () => {
    router.push("/learning/impact");
  };

  const handleFail = () => {
    router.push("/learning"); // back to learning module
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);

    setTimeout(() => {
      const newAnswers = [...answers, idx];
      setAnswers(newAnswers);

      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
      } else {
        setShowResult(true);
        const score = newAnswers.filter((a, i) => a === questions[i].correct).length;
        // Need 80% = 4/5
        if (score >= 4) {
          setTimeout(() => handlePass(), 2000);
        }
      }
    }, 800);
  };

  const score = answers.filter((a, i) => a === questions[i].correct).length;
  const percentage = Math.round((score / questions.length) * 100);
  const passed = percentage >= 80;

  if (showResult) {
    return (
      <section className="px-5 py-10 max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl border-2 border-border bg-card p-8 text-center shadow-elevated"
        >
          <div className="text-6xl mb-4">{passed ? "🎉" : "📚"}</div>
          <h3 className="font-display font-black text-2xl mb-2 text-foreground">
            {passed ? "Amazing!" : "Keep Learning!"}
          </h3>
          <p className="text-4xl font-display font-black mb-2 text-gradient-rainbow">
            {percentage}%
          </p>
          <p className="text-muted-foreground mb-6">
            {passed
              ? "You've demonstrated real understanding of impact."
              : "You need 80% to unlock your Proof of Impact. Review the sections and try again!"}
          </p>
          {!passed && (
            <button
              onClick={handleFail}
              className="gradient-warm rounded-full px-8 py-3 text-primary-foreground font-display font-bold shadow-rainbow"
            >
              Try Again
            </button>
          )}
        </motion.div>
      </section>
    );
  }

  const q = questions[currentQ];

  return (
    <section className="px-5 py-10 max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-display font-bold text-muted-foreground">
            Question {currentQ + 1}/{questions.length}
          </span>
          <span className="text-sm font-display font-semibold text-eat-orange">
            {Math.round(((currentQ) / questions.length) * 100)}% complete
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-warm rounded-full"
            animate={{ width: `${((currentQ) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-display font-bold text-xl mb-6 text-foreground">
            {q.question}
          </h3>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === q.correct;
              let optionStyle = "border-border bg-card hover:border-primary/40";
              
              if (selected !== null) {
                if (isSelected && isCorrect) optionStyle = "border-eat-green bg-eat-green/10";
                else if (isSelected && !isCorrect) optionStyle = "border-eat-red bg-eat-red/10";
                else if (isCorrect) optionStyle = "border-eat-green/50 bg-eat-green/5";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selected !== null}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${optionStyle} disabled:cursor-default`}
                >
                  <span className="text-sm font-body text-foreground">{opt}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default QuizPage;