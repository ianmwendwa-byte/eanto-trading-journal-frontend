import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animations";

export const ComingSoon = ({ icon: Icon, title, description, features = [] }) => (
  <motion.div
    variants={staggerContainerVariants}
    initial="initial"
    animate="animate"
    className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
  >
    <motion.div
      variants={staggerItemVariants}
      className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6"
    >
      {Icon && <Icon className="h-8 w-8 text-primary" />}
    </motion.div>

    <motion.div variants={staggerItemVariants}>
      <Badge variant="outline" className="mb-4 text-primary border-primary/30">
        Coming Soon
      </Badge>
    </motion.div>

    <motion.h1
      variants={staggerItemVariants}
      className="text-3xl font-bold font-heading mb-3"
    >
      {title}
    </motion.h1>

    <motion.p
      variants={staggerItemVariants}
      className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed"
    >
      {description}
    </motion.p>

    {features.length > 0 && (
      <motion.div
        variants={staggerItemVariants}
        className="w-full max-w-sm space-y-3 mb-8"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          What's coming
        </p>
        {features.map((feature, i) => (
          <motion.div
            key={i}
            variants={staggerItemVariants}
            className="flex items-start gap-3 text-left bg-card rounded-lg p-3 border border-border"
          >
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    )}

    <motion.div variants={staggerItemVariants}>
      <Button variant="outline">
        <Bell className="mr-2 h-4 w-4" />
        Notify me when available
      </Button>
    </motion.div>
  </motion.div>
);
