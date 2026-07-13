import React, { useState } from 'react'
import { PhoneIcon, XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function EmergencySOS() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all"
        whileHover={{
          scale: 1.05,
        }}
        whileTap={{
          scale: 0.95,
        }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(239, 68, 68, 0.4)',
            '0 0 0 20px rgba(239, 68, 68, 0)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <PhoneIcon className="w-7 h-7" />
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{
                  scale: 0.9,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  scale: 0.9,
                  opacity: 0,
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <PhoneIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Emergency Support
                      </h2>
                      <p className="text-sm text-gray-500">
                        Help is available 24/7
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h3 className="font-semibold text-red-900 mb-2">
                      988 Suicide & Crisis Lifeline
                    </h3>
                    <p className="text-sm text-red-700 mb-3">
                      Free, confidential support 24/7
                    </p>
                    <a
                      href="tel:988"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      Call 988
                    </a>
                  </div>

                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                    <h3 className="font-semibold text-teal-900 mb-2">
                      Crisis Text Line
                    </h3>
                    <p className="text-sm text-teal-700 mb-3">
                      Text HOME to 741741
                    </p>
                    <a
                      href="sms:741741?body=HOME"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Text Now
                    </a>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <h3 className="font-semibold text-orange-900 mb-2">
                      Emergency Services
                    </h3>
                    <p className="text-sm text-orange-700 mb-3">
                      For immediate danger
                    </p>
                    <a
                      href="tel:911"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      Call 911
                    </a>
                  </div>
                </div>

                <p className="mt-6 text-xs text-gray-500 text-center">
                  You are not alone. These services are free, confidential, and
                  available 24/7.
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default EmergencySOS
