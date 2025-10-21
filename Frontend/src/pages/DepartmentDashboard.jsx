import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLoading } from '../context/LoadingContext';

export default function DepartmentDashboard() {
  const [departmentData, setDepartmentData] = useState(null);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/department/data`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setDepartmentData(response.data);
      } catch (error) {
        console.error('Error fetching department data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Department Dashboard</h1>
      {departmentData && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Department Overview</h2>
          {/* Add department-specific content here */}
        </div>
      )}
    </div>
  );
} 