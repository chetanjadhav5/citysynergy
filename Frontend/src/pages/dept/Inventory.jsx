// src/pages/dept/Inventory.jsx
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Share2,
  Trash2,
  RefreshCcw,
  Package,
  BarChart3,
  Clock,
  Users,
  FileText,
  LayoutGrid,
  List,
  Info,
  History,
  ArrowLeft,
} from "lucide-react";
import Button from "../../components/dept/Button";
import Modal from "../../components/dept/Modal";
import DeptPermissionButton from "../../components/dept/DeptPermissionButton";
import DeptPermissionGuard from "../../components/dept/DeptPermissionGuard";
import apiClient from "../../utils/apiClient";
import { useToast } from "../../context/ToastContext";
import { useLoading } from "../../context/LoadingContext";
import { useViewMode } from "../../hooks/useViewMode";
import CustomCategoryDropdown from "../../components/common/CustomCategoryDropdown";

// Feature IDs for permissions
const INVENTORY_FEATURES = {
  VIEW: "FEAT_INVENTORY",
  CREATE: "FEAT_INVENTORY",
  SHARE: "FEAT_INVENTORY",
  DELETE: "FEAT_INVENTORY",
  MANAGE_REQUESTS: "FEAT_INVENTORY",
};

const Inventory = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setLoading } = useLoading();

  const [searchQuery, setSearchQuery] = useState("");
  // const [viewMode, setViewMode] = useState("table")
  const initialViewMode = useViewMode();
  const [viewMode, setViewMode] = useState(initialViewMode);

  const [filterType, setFilterType] = useState("all"); // all, shared, full, borrowed, lent
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [originPosition, setOriginPosition] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [lentItems, setLentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatingItem, setCreatingItem] = useState(false);
  const [sharingItem, setSharingItem] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [returningItems, setReturningItems] = useState({});
  const [deletingItem, setDeletingItem] = useState(false);

  const refreshInventory = async () => {
    setRefreshing(true);
    try {
      let endpoint = "/inventory";
  
      if (filterType === "borrowed") {
        endpoint = "/inventory/borrowed";
      } else if (filterType === "lent") {
        endpoint = "/inventory/lent";
      }
  
      const response = await apiClient.get(endpoint);
  
      if (response.data.success) {
        if (filterType === "borrowed") {
          setBorrowedItems(response.data.data);
        } else if (filterType === "lent") {
          setLentItems(response.data.data);
        } else {
          setInventoryItems(response.data.data);
        }
        showToast("Resources refreshed successfully", "success");
      } else {
        showToast("Error fetching inventory data", "error");
      }
    } catch (error) {
      console.error("Error refreshing inventory:", error);
      showToast("Failed to refresh inventory", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // Form state for creating new resource
  const [newItem, setNewItem] = useState({
    itemName: "",
    itemCategory: "",
    itemDescription: "",
    isSharable: false,
    totalItems: 1,
  });

  // Available categories for new items
  const categories = [
    "Construction Equipment",
    "Safety Equipment",
    "Measurement Tools",
    "Office Supplies",
    "Vehicles",
  ];



  // Fetch inventory data based on filter type
  useEffect(() => {
    const fetchInventoryData = async () => {
      setIsLoading(true);
      try {
        let endpoint = "/inventory";
  
        if (filterType === "borrowed") {
          endpoint = "/inventory/borrowed";
        } else if (filterType === "lent") {
          endpoint = "/inventory/lent";
        }
  
        const response = await apiClient.get(endpoint);
  
        if (response.data.success) {
          if (filterType === "borrowed") {
            setBorrowedItems(response.data.data);
          } else if (filterType === "lent") {
            setLentItems(response.data.data);
          } else {
            setInventoryItems(response.data.data);
          }
        } else {
          showToast("Error fetching inventory data", "error");
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
        showToast("Failed to load inventory data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    const fetchPendingRequests = async () => {
      try {
        const response = await apiClient.get("/inventory/requests");
        if (response.data.success) {
          const pendingCount = response.data.data.filter(
            req => req.requestStatus === "pending"
          ).length;
          setPendingRequests(pendingCount);
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };
    
    fetchPendingRequests();
    fetchInventoryData();
  }, [filterType, showToast]);

  // Filter inventory items based on search and filter type
  const getFilteredItems = () => {
    let items = [];

    if (filterType === "borrowed") {
      items = borrowedItems;
    } else if (filterType === "lent") {
      items = lentItems;
    } else {
      items = inventoryItems;
    }

    return items.filter((item) => {
      const matchesSearch =
        item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemId?.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterType === "all") return matchesSearch;
      if (filterType === "shared") return matchesSearch && item.isSharable;
      if (filterType === "full")
        return matchesSearch && item.availableItems === item.totalItems;
      if (filterType === "borrowed") return matchesSearch;
      if (filterType === "lent") return matchesSearch;

      return matchesSearch;
    });
  };

  const filteredItems = getFilteredItems();

  // Calculate inventory stats
  const totalItems = inventoryItems.reduce(
    (sum, item) => sum + (parseInt(item.totalItems) || 0),
    0
  );
  const availableItems = inventoryItems.reduce(
    (sum, item) => sum + (parseInt(item.availableItems) || 0),
    0
  );
  // Fix the shared items calculation - count items that are sharable
  const sharedItems = inventoryItems.filter(item => item.isSharable).length;
  
  // Calculate pending requests - this will be updated when we fetch requests
  const [pendingRequests, setPendingRequests] = useState(0);// This would be fetched from the API in a real implementation

  const handleCreateItem = async (e) => {
    e.preventDefault();
    setCreatingItem(true);

    try {
      const response = await apiClient.post("/inventory", newItem);
      if (response.data.success) {
        showToast("Resource created successfully", "success");
        setIsCreateModalOpen(false);
        setNewItem({
          itemName: "",
          itemCategory: "",
          itemDescription: "",
          isSharable: false,
          totalItems: 1,
        });
        refreshInventory();
      } else {
        showToast("Failed to create resource", "error");
      }
    } catch (error) {
      console.error("Error creating item:", error);
      showToast("Failed to create resource", "error");
    } finally {
      setCreatingItem(false);
    }
  };

  const handleShareItem = (item, event) => {
    // Get the button's position for the animation
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const originPosition = {
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2,
    };

    setSelectedItem(item);
    setRequestQuantity(1);
    setIsShareModalOpen(true);
    setOriginPosition(originPosition);
  };

  const handleInfoItem = (item, event) => {
    setSelectedItem(item);
    setIsInfoModalOpen(true);
  };

  const handleSubmitShare = async () => {
    try {
      setSharingItem(true)
      const response = await apiClient.post(`inventory/${selectedItem.itemId}/share`, {
        quantity: requestQuantity,
      })

      // Update the items list with the new data
      setInventoryItems((prevItems) =>
        prevItems.map((item) =>
          item.itemId === response.data.data.itemId ? response.data.data : item,
        ),
      )

      // Close the modal and show success message
      setIsShareModalOpen(false)
      setSelectedItem(null)
      setRequestQuantity(1)
      showToast("Resource shared successfully", "success")
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error")
    } finally {
      setSharingItem(false)
    }
  }

  const handleReturnItem = async (item) => {
    setReturningItems(prev => ({ ...prev, [item.itemId]: true }));
    try {
      const response = await apiClient.post(
        `/inventory/${item.itemId}/return`,
        {
          quantity: item.borrowedQuantity,
        }
      );

      if (response.data.success) {
        showToast(
          response.data.message || "Item returned successfully",
          "success"
        );
        
        // Immediately fetch fresh borrowed items data
        try {
          const borrowedResponse = await apiClient.get("/inventory/borrowed");
          if (borrowedResponse.data.success) {
            setBorrowedItems(borrowedResponse.data.data);
          } else {
            showToast("Failed to refresh borrowed items", "error");
          }
        } catch (error) {
          console.error("Error refreshing borrowed items:", error);
          showToast("Failed to refresh borrowed items", "error");
        }
      } else {
        showToast("Failed to return item", "error");
      }
    } catch (error) {
      console.error("Error returning item:", error);
      showToast("Failed to return item", "error");
    } finally {
      setReturningItems(prev => ({ ...prev, [item.itemId]: false }));
    }
  };

  const handleDeleteItem = async (item) => {
    // Use a modal instead of window.confirm
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${item.itemName}?`
    );
    if (!confirmDelete) return;

    setDeletingItem(true);
    try {
      const response = await apiClient.put(`/inventory/${item.itemId}`);

      if (response.data.success) {
        showToast("Resource deleted successfully", "success");
        await refreshInventory(); // Refresh inventory after deletion
      } else {
        showToast("Failed to delete resource", "error");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      showToast("Failed to delete resource", "error");
    } finally {
      setDeletingItem(false);
    }
  };

  return (
    <DeptPermissionGuard
      featureId={INVENTORY_FEATURES.VIEW}
      permissionType="read"
      fallback={
        <div className="p-6 text-center">
          You don't have permission to view inventory.
        </div>
      }
    >
      <div className="max-w-auto mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <Package className="mr-2 h-6 w-6 text-blue-500" />
              Inventory Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage department resources and equipment
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DeptPermissionButton
              featureId={INVENTORY_FEATURES.MANAGE_REQUESTS}
              onClick={() => navigate("/dashboard/dept/inventory/requests")}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>{" "}
              {pendingRequests > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5">
                  {pendingRequests}
                </span>
              )}
            </DeptPermissionButton>
            <Button
              onClick={() => navigate("/dashboard/dept/inventory/ask")}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Ask Resource</span>
              <span className="sm:hidden">Ask</span>
            </Button>
            <Button
              onClick={() => navigate("/dashboard/dept/inventory/history")}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">History</span>
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={refreshInventory}
                variant="outline"
                className="flex items-center gap-2"
                disabled={refreshing}
              >
                <RefreshCcw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
            <DeptPermissionButton
              featureId={INVENTORY_FEATURES.CREATE}
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Resource</span>
              <span className="sm:hidden">Add</span>
            </DeptPermissionButton>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4  gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Resources
              </div>
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {totalItems}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Items in inventory
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Available
              </div>
              <BarChart3 className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
              {availableItems}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Ready for use
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Shared Resources
              </div>
              <Share2 className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {sharedItems}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Available for sharing
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Pending Requests
              </div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
              {pendingRequests}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Awaiting response
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-4 border-b dark:border-gray-700 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  filterType === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("shared")}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  filterType === "shared"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Shared
              </button>
              <button
                onClick={() => setFilterType("full")}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  filterType === "full"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Full
              </button>
              <button
                onClick={() => setFilterType("borrowed")}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  filterType === "borrowed"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Borrowed
              </button>
              <button
                onClick={() => setFilterType("lent")}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  filterType === "lent"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Lent
              </button>
              <div className="flex gap-2">
                <Button
                  onClick={refreshInventory}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={refreshing}
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search inventory..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 flex-1 ${
                    viewMode === "table"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <List size={20} className="mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-2 flex-1 ${
                    viewMode === "card"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <LayoutGrid size={20} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">
                Loading inventory data...
              </p>
            </div>
          ) : (
            <>
              {viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">
                          Item ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Available
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {filterType === "borrowed"
                            ? "Borrowed From"
                            : filterType === "lent"
                            ? "Lent To"
                            : "Sharable"}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredItems.map((item) => (
                        <tr
                          key={item.itemId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {item.itemId}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Updated{" "}
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm hidden sm:table-cell text-gray-500 dark:text-gray-300">
                            {item.itemName}
                          </td>
                          <td className="px-6 py-4 text-sm hidden sm:table-cell text-gray-500 dark:text-gray-300">
                            {item.itemCategory}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                            {item.availableItems}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                            {item.totalItems}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {filterType === "borrowed" ? (
                              <span className="text-sm text-gray-500 dark:text-gray-300">
                                {item.borrowedFromDepartment?.deptName ||
                                  "Unknown"}
                              </span>
                            ) : filterType === "lent" ? (
                              <span className="text-sm text-gray-500 dark:text-gray-300">
                                {item.department?.deptName || "Unknown"}
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-1 text-xs rounded-md ${
                                  item.isSharable
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                                }`}
                              >
                                {item.isSharable ? "Yes" : "No"}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(event) => handleInfoItem(item, event)}
                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                              >
                                <Info className="h-4 w-4" />
                              </button>

                              {filterType === "borrowed" ? (
                                <DeptPermissionButton
                                  featureId={INVENTORY_FEATURES.SHARE}
                                  onClick={() => handleReturnItem(item)}
                                  disabled={returningItems[item.itemId]}
                                  className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                                >
                                  {returningItems[item.itemId] ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                                  ) : (
                                    <ArrowLeft className="h-4 w-4" />
                                  )}
                                </DeptPermissionButton>
                              ) : (
                                filterType !== "lent" &&
                                item.isSharable && (
                                  <DeptPermissionButton
                                    featureId={INVENTORY_FEATURES.SHARE}
                                    onClick={(event) =>
                                      handleShareItem(item, event)
                                    }
                                    className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </DeptPermissionButton>
                                )
                              )}

                              {filterType !== "borrowed" &&
                                filterType !== "lent" && (
                                  <DeptPermissionButton
                                    featureId={INVENTORY_FEATURES.DELETE}
                                    onClick={() => handleDeleteItem(item)}
                                    disabled={deletingItem}
                                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                  >
                                    {deletingItem ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </DeptPermissionButton>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.itemId}
                      className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg dark:text-white">
                              {item.itemName}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-md mt-1 inline-block">
                              {item.itemId}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(event) => handleInfoItem(item, event)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                              <Info className="h-4 w-4" />
                            </button>

                            {filterType === "borrowed" ? (
                              <DeptPermissionButton
                                featureId={INVENTORY_FEATURES.SHARE}
                                onClick={() => handleReturnItem(item)}
                                disabled={returningItems[item.itemId]}
                                className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                              >
                                {returningItems[item.itemId] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                                ) : (
                                  <ArrowLeft className="h-4 w-4" />
                                )}
                              </DeptPermissionButton>
                            ) : (
                              filterType !== "lent" &&
                              item.isSharable && (
                                <DeptPermissionButton
                                  featureId={INVENTORY_FEATURES.SHARE}
                                  variant="ghost"
                                  onClick={(event) =>
                                    handleShareItem(item, event)
                                  }
                                  className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                                >
                                  <Share2 className="h-4 w-4" />
                                </DeptPermissionButton>
                              )
                            )}

                            {filterType !== "borrowed" &&
                              filterType !== "lent" && (
                                <DeptPermissionButton
                                  featureId={INVENTORY_FEATURES.DELETE}
                                  variant="ghost"
                                  onClick={() => handleDeleteItem(item)}
                                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </DeptPermissionButton>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-sm mb-4 text-gray-600 dark:text-gray-300">
                          {item.itemCategory}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Available
                            </div>
                            <div className="font-medium text-blue-600 dark:text-blue-400">
                              {item.availableItems}
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Total
                            </div>
                            <div className="font-medium text-gray-600 dark:text-gray-300">
                              {item.totalItems}
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                            {filterType === "borrowed" ? (
                              <>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  From
                                </div>
                                <div className="font-medium text-gray-600 dark:text-gray-300 text-xs">
                                  {item.borrowedFromDepartment?.deptName ||
                                    "Unknown"}
                                </div>
                              </>
                            ) : filterType === "lent" ? (
                              <>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  To
                                </div>
                                <div className="font-medium text-gray-600 dark:text-gray-300 text-xs">
                                  {item.department?.deptName || "Unknown"}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Sharable
                                </div>
                                <div
                                  className={`font-medium ${
                                    item.isSharable
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-gray-600 dark:text-gray-300"
                                  }`}
                                >
                                  {item.isSharable ? "Yes" : "No"}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <div>Dept: {item.deptId}</div>
                          <div>
                            Updated:{" "}
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredItems.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <RefreshCcw className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-lg font-medium dark:text-gray-300">
                      No items found
                    </p>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}

              <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <div>
                  Showing {filteredItems.length} of{" "}
                  {filterType === "borrowed"
                    ? borrowedItems.length
                    : filterType === "lent"
                    ? lentItems.length
                    : inventoryItems.length}{" "}
                  items
                </div>
                <div className="flex gap-2">
                  <button
                    disabled
                    className="px-3 py-1 rounded border bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button className="px-3 py-1 rounded border bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    1
                  </button>
                  <button className="px-3 py-1 rounded border hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

{/* Create Resource Modal */}
<Modal
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  title="Create New Resource"
>
  <form onSubmit={handleCreateItem} className="space-y-4">
    <div>
      <label
        htmlFor="itemName"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Item Name*
      </label>
      <input
        type="text"
        id="itemName"
        value={newItem.itemName}
        onChange={(e) =>
          setNewItem({ ...newItem, itemName: e.target.value })
        }
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        required
      />
    </div>

    <div>
      <label
        id="itemCategory-label"
        htmlFor="itemCategory"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Category*
      </label>
      <CustomCategoryDropdown
        id="itemCategory"
        options={categories}
        value={newItem.itemCategory}
        onChange={(e) =>
          setNewItem({ ...newItem, itemCategory: e.target.value })
        }
        placeholder="Select Category"
        required={true}
      />
    </div>

    <div>
      <label
        htmlFor="itemDescription"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Description
      </label>
      <textarea
        id="itemDescription"
        value={newItem.itemDescription}
        onChange={(e) =>
          setNewItem({ ...newItem, itemDescription: e.target.value })
        }
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        rows={3}
      />
    </div>

    <div>
      <label
        htmlFor="totalItems"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Total Items*
      </label>
      <input
        type="number"
        id="totalItems"
        min="1"
        value={newItem.totalItems}
        onChange={(e) =>
          setNewItem({
            ...newItem,
            totalItems: Number.parseInt(e.target.value),
          })
        }
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        required
      />
    </div>

    <div className="flex items-center">
      <input
        type="checkbox"
        id="isSharable"
        checked={newItem.isSharable}
        onChange={(e) =>
          setNewItem({ ...newItem, isSharable: e.target.checked })
        }
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label
        htmlFor="isSharable"
        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
      >
        Available for sharing with other departments
      </label>
    </div>

    <div className="flex justify-end space-x-3 pt-4">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsCreateModalOpen(false)}
        disabled={creatingItem}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={creatingItem || !newItem.itemName.trim() || !newItem.itemCategory}
        className="flex items-center gap-2"
      >
        {creatingItem ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            Creating...
          </>
        ) : (
          "Create Resource"
        )}
      </Button>
    </div>
  </form>
</Modal>

        {/* Share Resource Modal */}
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share Resource"
          originPosition={originPosition}
        >
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {selectedItem.itemName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedItem.itemCategory}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                    {selectedItem.itemId}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Available
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedItem.availableItems} of {selectedItem.totalItems}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Department
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedItem.deptId}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="requestQuantity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Quantity to Share
                </label>
                <input
                  type="number"
                  id="requestQuantity"
                  min="1"
                  max={selectedItem.availableItems}
                  value={requestQuantity}
                  onChange={(e) =>
                    setRequestQuantity(Number.parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum available: {selectedItem.availableItems}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsShareModalOpen(false)}
                  disabled={sharingItem}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitShare}
                  disabled={
                    sharingItem ||
                    requestQuantity < 1 ||
                    requestQuantity > selectedItem.availableItems
                  }
                  className="flex items-center gap-2"
                >
                  {sharingItem ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Share Resource
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Item Info Modal */}
        <Modal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          title="Resource Information"
        >
          {selectedItem && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-gray-900/50 backdrop-blur-sm p-6 -mx-6 -mt-6 border-b border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {selectedItem.itemName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {selectedItem.itemId}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        selectedItem.isSharable 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                      }`}>
                        {selectedItem.isSharable ? "Sharable" : "Not Sharable"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-6 px-1">
                {/* Category & Description */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Category</h4>
                    <p className="text-base text-white bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      {selectedItem.itemCategory}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                    <p className="text-base text-white bg-gray-800/50 p-3 rounded-lg border border-gray-700 min-h-[60px]">
                      {selectedItem.itemDescription || "No description available"}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-400">Available</h4>
                      <span className="text-lg font-semibold text-blue-400">{selectedItem.availableItems}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(selectedItem.availableItems / selectedItem.totalItems) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-400">Total</h4>
                      <span className="text-lg font-semibold text-white">{selectedItem.totalItems}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gray-500 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>

                {/* Department Info */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Department</h4>
                      <p className="text-base font-medium text-white">{selectedItem.deptId}</p>
                    </div>
                    {selectedItem.isBorrowed && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Borrowed From</h4>
                        <p className="text-base font-medium text-white">
                          {selectedItem.borrowedFromDepartment?.deptName || "Unknown"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex items-center justify-between text-sm text-gray-400 pt-2">
                  <div>
                    Created: {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    Updated: {new Date(selectedItem.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-gray-700">
                <Button 
                  type="button" 
                  onClick={() => setIsInfoModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DeptPermissionGuard>
  );
};

export default Inventory;
