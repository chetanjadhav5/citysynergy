const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"

  const variants = {
    primary: "bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-600 dark:hover:bg-sky-700",
    secondary:
      "bg-white hover:bg-gray-100 text-sky-600 border border-sky-500 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-sky-400 dark:border-sky-600",
    danger: "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700",
    ghost: "bg-transparent hover:bg-sky-50 text-sky-600 dark:hover:bg-gray-800 dark:text-sky-400",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  }

  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button

