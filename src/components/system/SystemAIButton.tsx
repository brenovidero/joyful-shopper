import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemAIChat } from './SystemAIChat';

export function SystemAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg shadow-primary/30 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border border-primary/50"
          size="icon"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Bot className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        
        {/* Pulsing ring effect */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/50 pointer-events-none"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <SystemAIChat key="system-ai-chat" onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
