import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/store/useStore"
import { CheckCircle2, X } from "lucide-react"

export function ToastSystem() {
    const { toastMessage, hideToast } = useStore()

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                        className="pointer-events-auto flex items-center gap-3 rounded-lg bg-green-500 px-4 py-3 text-white shadow-soft"
                    >
                        <CheckCircle2 className="h-5 w-5 opacity-90" />
                        <p className="text-sm font-medium">{toastMessage}</p>
                        <button
                            onClick={hideToast}
                            className="ml-auto rounded-full p-1 transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                        >
                            <X className="h-4 w-4 opacity-90" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
