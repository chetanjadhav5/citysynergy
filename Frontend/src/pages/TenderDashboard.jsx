import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useLoading } from "../context/LoadingContext";

export const TenderDashboard = () => {
  const [tenders, setTenders] = useState([]);
  const [error, setError] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterColumns, setFilterColumns] = useState([
    "Tender_ID",
    "local_area_name",
    "Tender_By_Department",
    "Tender_By_Classification",
    "Tender_Status",
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tendersPerPage] = useState(10);
  const [pincode, setPincode] = useState("");
  const [clashResult, setClashResult] = useState(null);
  const { setIsLoading } = useLoading(); 


  const loadAllTenders = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/tender/tenders`
      );
      setTenders(response.data);
    } catch (err) {
      setError("Failed to load tenders", err);
    }finally{
      setIsLoading(false);
    }
  };

  const handleCheckClashes = async () => {
    if (!pincode) {
      setError("Please enter a pincode");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await axios.post(
        "https://citysynergybackendpython.onrender.com/check_clashes",
        {
          pincode,
        }
      );

      if (response.data && response.data.clashes) {
        const sortedClashes = [...response.data.clashes].sort((a, b) => {
          const priorityOrder = { High: 1, Medium: 2, Low: 3 };
          return priorityOrder[a.Priorities] - priorityOrder[b.Priorities];
        });
        setClashResult({ ...response.data, clashes: sortedClashes });
      } else {
        setClashResult(response.data);
      }
    } catch (err) {
      setError("Failed to check clashes", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchAndFilter = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.post(
        "https://citysynergybackend-jw8z.onrender.com/tender/tenders/filter",
        {
          search_by: searchBy,
          search_term: searchTerm,
          filter_columns: filterColumns,
        }
      );
      setTenders(response.data);
    } catch (err) {
      setError("Search and filter failed", err);
    }finally {
      setIsLoading(false);
     }
  };

  useEffect(() => {
    loadAllTenders();
  }, []);

  const toggleFilterColumn = (column) => {
    if (filterColumns.length === 5 && !filterColumns.includes(column)) {
      return;
    }
    setFilterColumns((prevFilters) =>
      prevFilters.includes(column)
        ? prevFilters.filter((filter) => filter !== column)
        : [...prevFilters, column]
    );
  };

  const indexOfLastTender = currentPage * tendersPerPage;
  const indexOfFirstTender = indexOfLastTender - tendersPerPage;
  const currentTenders = tenders.slice(indexOfFirstTender, indexOfLastTender);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto p-3 md:p-5 bg-gray-100 min-h-screen">
      <motion.h1
        className="text-xl md:text-3xl font-semibold text-center text-blue-600 mb-3 md:mb-5"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        Tender Dashboard
      </motion.h1>

      {error && (
        <motion.p
          className="text-red-500 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.p>
      )}

      <motion.div
        className="flex flex-col lg:flex-row gap-3"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ staggerChildren: 0.2 }}
      >
        <motion.div
          className="w-full lg:w-2/3"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          {/* Search & Filter Section */}
          <motion.div
            className="bg-white p-3 md:p-5 rounded-md shadow-md mb-5"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-lg md:text-2xl font-semibold mb-3">
              Search & Filter Tenders
            </h2>

            <div className="flex flex-col space-y-3">
              <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                <select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  className="border p-2 rounded-md w-full"
                >
                  <option value="">Select Search By</option>
                  <option value="Tender_ID">Tender ID</option>
                  <option value="local_area_name">local_area_name</option>
                  <option value="area_name">area_name</option>
                  <option value="city">city</option>
                  <option value="state">state</option>

                  <option value="Tender_By_Department">Department</option>
                  <option value="Tender_By_Classification">
                    Classification
                  </option>
                  <option value="Tender_Status">Status</option>
                </select>
                <input
                  type="text"
                  placeholder="Search Term"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border p-2 rounded-md w-full"
                />
              </div>
              <div className="relative bg-white border p-2 rounded-md">
                <p className="mb-1 font-semibold">Filter Columns:</p>
                <div className="max-h-40 overflow-y-scroll">
                  {[
                    "Tender_ID",
                    "Tender_By_Department",
                    "Tender_By_Classification",
                    "Sanction_Date",
                    "Completion_Date",
                    "Sanction_Amount",
                    "Total_Duration_Days",
                    "Priorities",
                    "Cancel_Accept_Tenders",
                    "Reason_for_Decision",
                    "Tender_Status",
                    "Reason_for_Status",
                    "Completed_Pending",
                    "Tender_Acquired_By_Agency",                   
                    "state",
                    "local_area_name",
                    "area_name",
                    "city",
                    "pincode",
                  ].map((column) => (
                    <div key={column} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filterColumns.includes(column)}
                        onChange={() => toggleFilterColumn(column)}
                        className="form-checkbox"
                      />
                      <label>{column.replace(/_/g, " ")}</label>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-gray-500 text-sm">
                  You can select up to 5 columns to display in the table.
                </p>
              </div>
            </div>
            <button
              onClick={handleSearchAndFilter}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mt-3 w-full md:w-auto"
            >
              Search & Filter
            </button>
          </motion.div>

          <motion.div
            className="bg-white p-3 md:p-5 rounded-md shadow-md mb-5"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-lg md:text-2xl font-semibold mb-3">
              Tenders List
            </h2>

            <div className="overflow-x-auto">
              <table className="table-auto w-full text-left">
                <thead>
                  <tr>
                    {filterColumns.map((column) => (
                      <th
                        key={column}
                        className="px-2 md:px-4 py-2 text-xs md:text-sm"
                      >
                        {column.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentTenders.map((tender) => (
                    <tr key={tender.Tender_ID}>
                      {filterColumns.map((column) => (
                        <td
                          key={`${tender.Tender_ID}-${column}`}
                          className="border px-2 md:px-4 py-2 text-xs md:text-sm"
                        >
                          {tender[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 text-xs md:text-sm"
              >
                Previous
              </button>
              <span className="text-xs md:text-base">Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={indexOfLastTender >= tenders.length}
                className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 text-xs md:text-sm"
              >
                Next
              </button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-white p-3 md:p-5 rounded-md shadow-md w-full lg:w-1/3"
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-lg md:text-2xl font-semibold mb-3">
            Check Clashes
          </h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <input
              type="text"
              placeholder="Enter Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="border p-2 rounded-md w-full"
            />
            <button
              onClick={handleCheckClashes}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 w-full md:w-auto"
            >
              Check Clashes
            </button>
          </div>

          {clashResult && clashResult.clashes_by_local_area && (
            <div className="bg-white p-3 md:p-5 rounded-md shadow-md mt-5">
              <h3 className="text-lg md:text-2xl font-semibold mb-3">
                Clash Results by Local Area
              </h3>

              {Object.keys(clashResult.clashes_by_local_area).map(
                (localArea) => {
                  const tenders = clashResult.clashes_by_local_area[localArea];

                  // Deduplicate tenders
                  const uniqueTenders = tenders.reduce((acc, tender) => {
                    const exists = acc.find(
                      (t) => t.tender_id === tender.tender_id
                    );
                    if (!exists) acc.push(tender);
                    return acc;
                  }, []);

                  return (
                    <div key={localArea} className="mb-5">
                      <h4 className="text-md md:text-lg font-semibold mb-3 text-blue-500">
                         {localArea}
                      </h4>
                      {uniqueTenders.length > 0 ? (
                        <div>
                          <div className="overflow-x-auto mb-5">
                            <table className="table-auto w-full text-left">
                              <thead>
                                <tr>
                                  <th className="px-2 md:px-4 py-2 text-xs md:text-sm">
                                    Tender ID
                                  </th>
                                  <th className="px-2 md:px-4 py-2 text-xs md:text-sm">
                                    Clashing Tender ID
                                  </th>
                                  <th className="px-2 md:px-4 py-2 text-xs md:text-sm">
                                    Department
                                  </th>
                                  <th className="px-2 md:px-4 py-2 text-xs md:text-sm">
                                    Clashing Department
                                  </th>
                                  <th className="px-2 md:px-4 py-2 text-xs md:text-sm">
                                    Start Date
                                  </th>
                                  <th className="px-2 md:px-4 py-2 text-xs md:text-sm">
                                    End Date
                                  </th>
                                  <th className="px-2 md:px-4 py-2 text-xs md:text-sm">
                                    Overlap Days
                                  </th>
                                  <th className="px-2 md:px-4 py-2 text-xs md:text-sm">
                                    Priority Issue
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {tenders
                                  .sort(
                                    (a, b) =>
                                      b.overlap_days - a.overlap_days ||
                                      a.priority_issue - b.priority_issue
                                  )
                                  .map((clash, index) => (
                                    <tr key={index}>
                                      <td className="border px-2 md:px-4 py-2 text-xs md:text-sm">
                                        {clash.tender_id}
                                      </td>
                                      <td className="border px-2 md:px-4 py-2 text-xs md:text-sm">
                                        {clash.clashing_tender_id}
                                      </td>
                                      <td className="border px-2 md:px-4 py-2 text-xs md:text-sm">
                                        {clash.department}
                                      </td>
                                      <td className="border px-2 md:px-4 py-2 text-xs md:text-sm">
                                        {clash.clashing_department}
                                      </td>
                                      <td className="border px-2 md:px-4 py-2 text-xs md:text-sm">
                                        {new Date(
                                          clash.tender_start_date
                                        ).toLocaleDateString()}
                                      </td>
                                      <td className="border px-2 md:px-4 py-2 text-xs md:text-sm">
                                        {new Date(
                                          clash.tender_end_date
                                        ).toLocaleDateString()}
                                      </td>
                                      <td className="border px-2 md:px-4 py-2 text-xs md:text-sm">
                                        {clash.overlap_days}
                                      </td>
                                      <td className="border px-2 md:px-4 py-2 text-xs md:text-sm">
                                        {clash.priority_issue ? "Yes" : "No"}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Horizontal Timeline */}
                          <div className="mt-5">
                            <h4 className="text-md md:text-lg font-semibold mb-3">
                            Suggested  Reordered Timeline
                            </h4>
                            <div className="flex items-center justify-center overflow-x-auto">
                              {(() => {
                                // Extract the tender order from suggestions for the current local area
                                const suggestion = clashResult.suggestions.find(
                                  (s) => s.includes(localArea)
                                );
                                const tenderOrder = suggestion
                                  ? suggestion.match(/TND\d+/g) // Extract tender IDs (e.g., TND001, TND002)
                                  : [];

                                return tenderOrder.map((tenderId, i) => (
                                  <div
                                    key={i}
                                    className="flex flex-col items-center mx-5 relative"
                                  >
                                    <div className="bg-blue-500 text-white text-xs md:text-sm font-semibold w-8 h-8 md:w-16 md:h-10 rounded-full flex items-center justify-center">
                                      {tenderId}
                                    </div>
                             
                                    {i !== tenderOrder.length - 1 && (
                                      <div className="absolute top-4 left-full h-1 w-16 bg-gray-300" />
                                    )}
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No clashes detected for this area.
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TenderDashboard;
