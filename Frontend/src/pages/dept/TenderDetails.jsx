// src/pages/TenderDetails.jsx
import { FileText } from "lucide-react"

const TenderDetails = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <FileText size={64} className="text-sky-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Tender Details</h1>
      <p className="text-gray-600 max-w-md">This page will display detailed information about a specific tender.</p>
    </div>
  )
}

export default TenderDetails

