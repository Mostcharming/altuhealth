"use client";

import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Loading() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-blue-600 font-semibold text-xl"
        >
          <SpinnerThree />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
