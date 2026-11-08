import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PartyPopper, Sparkles, CalendarRange, Coffee, GraduationCap, FileUp, ListPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fadeUp, SPRING } from "@/lib/motion";

interface BentoEmptyStateProps {
  /**
   * "caught-up": everything for the day is done.
   * "nothing-due": nothing was due or planned for the day at all.
   */
  variant?: "caught-up" | "nothing-due";
  /** Whether the day shown is today (the wording changes for other days). */
  isToday?: boolean;
  className?: string;
}

export function BentoEmptyState({ variant = "caught-up", isToday = true, className }: BentoEmptyStateProps) {
  const caughtUp = variant === "caught-up";
  const Icon = caughtUp ? PartyPopper : Coffee;
  const day = isToday ? "today" : "this day";

  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className={cn("glass-strong rounded-2xl p-10 text-center", className)}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...SPRING, delay: 0.05 }}
        className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-success/10 mb-5"
      >
        <Icon className="h-6 w-6 text-success" />
      </motion.div>

      <h3 className="text-xl font-semibold text-foreground mb-2">
        {caughtUp ? "You're all caught up" : `Nothing due ${day}`}
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
        {caughtUp
          ? `Everything for ${day} is done. Check "Coming Up" to get ahead, or take a well-deserved break.`
          : `Nothing is due or planned for ${day}. Check "Coming Up" to get ahead, or plan something in.`}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button variant="default" size="sm" asChild className="gap-2 px-5">
          <Link to="/planner">
            <CalendarRange className="h-4 w-4" />
            Plan Ahead
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="gap-2 px-5">
          <Link to="/readings">
            <Sparkles className="h-4 w-4" />
            Catch Up on Readings
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

interface GettingStartedProps {
  onAddCourse: () => void;
  onAddAssignment: () => void;
  /** Whether at least one course exists yet (step 1 is then done). */
  hasCourses: boolean;
  className?: string;
}

/**
 * What a brand-new account sees on Today instead of "You're all caught up":
 * the three things to do first, in order. Shown until the first assignment
 * exists.
 */
export function GettingStarted({ onAddCourse, onAddAssignment, hasCourses, className }: GettingStartedProps) {
  const steps = [
    {
      icon: GraduationCap,
      title: "Add your courses",
      body: "One for each class, with a short code like CHEM 111 and a color.",
      action: hasCourses ? (
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <Link to="/courses">
            View courses
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : (
        <Button size="sm" onClick={onAddCourse}>
          Add a course
        </Button>
      ),
      done: hasCourses,
    },
    {
      icon: FileUp,
      title: "Upload a syllabus and textbook",
      body: "On a course's Materials tab. Carrel finds the readings in the syllabus and splits the textbook into chapters you can download one at a time.",
      action: hasCourses ? (
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <Link to="/courses">
            Open a course
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">Add a course first.</p>
      ),
      done: false,
    },
    {
      icon: ListPlus,
      title: "Add what's due",
      body: "Assignments, exams and quizzes. They show up here on the day they're due, and the + button adds more from anywhere on this page.",
      action: (
        <Button variant="outline" size="sm" onClick={onAddAssignment}>
          Add an assignment
        </Button>
      ),
      done: false,
    },
  ];

  return (
    <motion.section
      variants={fadeUp}
      initial="initial"
      animate="animate"
      aria-labelledby="getting-started-heading"
      className={cn("glass-strong rounded-2xl p-6 sm:p-8", className)}
    >
      <h3 id="getting-started-heading" className="text-xl font-semibold text-foreground">
        Welcome to Carrel
      </h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Three steps to get your semester in. Once something is due, this page shows what to work on each day.
      </p>
      <ol className="space-y-5">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                step.done ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
              )}
              aria-hidden="true"
            >
              {step.done ? "✓" : index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn("font-medium text-foreground", step.done && "text-muted-foreground line-through")}>
                {step.title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{step.body}</p>
              <div className="mt-2.5">{step.action}</div>
            </div>
          </li>
        ))}
      </ol>
    </motion.section>
  );
}
