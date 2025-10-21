export default function SearchBar({ onSearch }) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
        rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
        bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
        placeholder-gray-500 dark:placeholder-gray-400"
      />
      <svg
        className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  )
}

