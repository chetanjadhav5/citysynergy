"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { X } from "lucide-react"

export default function SlideOver({ open, onClose, title, children }) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 " onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 transition-opacity backdrop-blur-sm" />
        </Transition.Child>

                {/* Custom scrollbar styles */}
      <style jsx global>{`
        /* For Webkit browsers like Chrome/Safari/Edge */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5); /* gray-400 with opacity */
          border-radius: 20px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.7); /* gray-500 with opacity */
        }
        
        /* For dark mode */
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5); /* gray-600 with opacity */
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.7); /* gray-500 with opacity */
        }
        
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .dark .custom-scrollbar {
          scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
        }
      `}</style>

        <div className="fixed inset-0 overflow-hidden  custom-scrollbar">
          <div className="absolute inset-0 overflow-hidden custom-scrollbar">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 custom-scrollbar">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl custom-scrollbar">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-800 shadow-xl custom-scrollbar">
                    <div className="px-4 sm:px-6 py-6 border-b border-gray-200 dark:border-gray-700 custom-scrollbar">
                      <div className="flex items-center justify-between custom-scrollbar" >
                        <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white custom-scrollbar">
                          {title}
                        </Dialog.Title>
                        <button
                          type="button"
                          className="rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                          onClick={onClose}
                        >
                          <span className="sr-only">Close panel</span>
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="relative flex-1 px-4 sm:px-6">{children}</div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

