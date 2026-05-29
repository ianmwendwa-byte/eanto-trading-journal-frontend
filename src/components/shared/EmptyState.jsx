import { motion } from "framer-motion";

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    {Icon && (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4"
      >
        <Icon className="h-6 w-6 text-muted-foreground" />
      </motion.div>
    )}
    <motion.h3
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="text-sm font-medium mb-1"
    >
      {title}
    </motion.h3>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-sm text-muted-foreground max-w-sm mb-4"
    >
      {description}
    </motion.p>
    {action && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {action}
      </motion.div>
    )}
  </motion.div>
);
