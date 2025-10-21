import { createContext, useContext, useState } from 'react';
import { Loader2 } from "lucide-react";

// Create the FullScreenLoader component within the same file
const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

// Create the context with default values
const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: () => {},
});

// Create the provider component
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && <FullScreenLoader />}
    </LoadingContext.Provider>
  );
};

// Create the custom hook
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};