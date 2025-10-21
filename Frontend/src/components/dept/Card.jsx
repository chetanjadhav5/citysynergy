const Card = ({ title, value, icon, children, className = "" }) => {
  if (children) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 transition-all hover:shadow-lg">
      <div className="flex items-center mb-2">
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-3">{icon}</div>
        <h3 className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300">{title}</h3>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-2">
        {value !== undefined ? value.toLocaleString() : '0'}
      </p>
    </div>
  );
};

Card.defaultProps = {
  title: "",
  value: 0,
  icon: null,
  className: "",
};

export default Card;

