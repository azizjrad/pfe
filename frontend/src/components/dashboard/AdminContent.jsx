import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ConfirmationModal from "../modals/ConfirmationModal";
import ReservationDetailsModal from "../modals/ReservationDetailsModal";
import ResolveReportModal from "../modals/ResolveReportModal";
import Pagination from "../features/Pagination";
import { ROLES } from "../../constants/roles";
import { REPORT_STATUS } from "../../constants/statuses";
const AdminContent = ({
  activeTab,
  statisticsSubTab,
  setStatisticsSubTab,
  platformStats,
  agencies,
  users,
  reports,
  loading,
  trashedReports,
  reportsView,
  reportsFilter,
  setReportsView,
  setReportsFilter,
  contactMessages,
  setHistoryModal,
  financialStats,
  user,
  onDeleteAgency,
  onEditAgency,
  onSuspendAgency,
  onDeleteUser,
  onEditUser,
  onSuspendUser,
  onViewUserDetails,
  onViewAgencyDetails,
  onResolveReport,
  onDismissReport,
  onDeleteReport,
  onRestoreReport,
  onPermanentDeleteReport,
  onMarkMessageRead,
  onDeleteContactMessage,
  onViewReportDetails,
}) => {
  const { t } = useTranslation();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Resolve/Dismiss modal state
  const [resolveModal, setResolveModal] = useState({
    isOpen: false,
    type: null,
    report: null,
  });

  // Permanent delete confirmation modal state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    report: null,
  });
  const [messageDetailsModal, setMessageDetailsModal] = useState({
    isOpen: false,
    message: null,
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getStatusColor = (status) =>
    status === "active"
      ? "bg-green-100 text-green-600"
      : "bg-red-100 text-red-600";
  const getRoleBadge = (role) => {
    const badges = {
      [ROLES.SUPER_ADMIN]: "bg-purple-100 text-purple-600",
      [ROLES.AGENCY_ADMIN]: "bg-blue-100 text-blue-600",
      [ROLES.CLIENT]: "bg-gray-100 text-gray-600",
    };
    return badges[role] || "bg-gray-100 text-gray-600";
  };

  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          {t("dashboard.overviewTitle")}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("dashboard.agencyPerformance")}
            </h3>
            <div className="space-y-3">
              {agencies.slice(0, 3).map((agency) => (
                <div
                  key={agency.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">{agency.name}</p>
                    <p className="text-sm text-gray-500">
                      {t("dashboard.vehiclesCount", { count: agency.vehicles })}
                    </p>
                  </div>
                  <p className="font-bold text-primary-600">
                    {(agency.revenue ?? 0).toLocaleString()} DT
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("dashboard.recentActivity")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {t("dashboard.newAgencyCreated")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("dashboard.timeAgo2Days")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {t("dashboard.newUsers", { count: 15 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("dashboard.today")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {t("dashboard.reservationsProcessed", { count: 45 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("dashboard.today")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "agencies") {
    const totalPages = Math.ceil((agencies || []).length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAgencies = (agencies || []).slice(startIndex, endIndex);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {t("dashboard.manageAgencies")}
          </h2>
          <button
            onClick={() =>
              onEditAgency({
                id: null,
                name: "",
                address: "",
                phone: "",
                email: "",
                location: "",
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("dashboard.addAgency")}
          </button>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {paginatedAgencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer"
              onClick={async () => await onViewAgencyDetails(agency)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{agency.name}</p>
                  <p className="text-sm text-gray-500">
                    {agency.location || "—"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agency.status)}`}
                >
                  {agency.status === "active"
                    ? t("dashboard.active")
                    : t("dashboard.inactive")}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span>
                  {t("dashboard.vehiclesCount", { count: agency.vehicles })}
                </span>
                <span className="font-medium text-primary-600">
                  {(agency.revenue ?? 0).toLocaleString()} DT
                </span>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAgency(agency);
                  }}
                  className="flex-1 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                >
                  {t("dashboard.edit")}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSuspendAgency && onSuspendAgency(agency);
                  }}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg ${agency.status === "inactive" ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-orange-600 bg-orange-50 hover:bg-orange-100"}`}
                >
                  {agency.status === "inactive"
                    ? t("dashboard.unblock")
                    : t("dashboard.block")}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAgency(agency.id);
                  }}
                  className="flex-1 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  {t("dashboard.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.agency")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.location")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.vehicles")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.revenue")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.status")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAgencies.map((agency) => (
                <tr
                  key={agency.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={async () => await onViewAgencyDetails(agency)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {agency.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {agency.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {agency.vehicles}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                    {(agency.revenue ?? 0).toLocaleString()} DT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agency.status)}`}
                    >
                      {agency.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAgency(agency);
                      }}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSuspendAgency && onSuspendAgency(agency);
                      }}
                      className={`mr-3 ${agency.status === "inactive" ? "text-green-600 hover:text-green-900" : "text-orange-600 hover:text-orange-900"}`}
                    >
                      {agency.status === "inactive" ? "Débloquer" : "Bloquer"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAgency(agency.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            itemsPerPage={itemsPerPage}
            totalItems={(agencies || []).length}
          />
        )}
      </div>
    );
  }

  if (activeTab === "users") {
    // Filter out super_admin users - only show agency_admin and client
    const filteredUsers = (users || []).filter(
      (user) => user.role !== ROLES.SUPER_ADMIN,
    );
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {t("dashboard.manageUsers")}
          </h2>
          <button
            onClick={() =>
              onEditUser({
                id: null,
                name: "",
                email: "",
                phone: "",
                role: ROLES.CLIENT,
                agency_id: null,
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("dashboard.addUser")}
          </button>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {paginatedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer"
              onClick={() => onViewUserDetails && onViewUserDetails(user)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}
                >
                  {user.role === ROLES.CLIENT
                    ? t("dashboard.client")
                    : user.role === ROLES.AGENCY_ADMIN
                      ? t("dashboard.agencyAdmin")
                      : t("dashboard.superAdmin")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                {user.agency && <span>{user.agency}</span>}
                <span>
                  {t("dashboard.registeredOn", { date: user.registeredAt })}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditUser(user);
                  }}
                  className="flex-1 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                >
                  {t("dashboard.edit")}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSuspendUser && onSuspendUser(user);
                  }}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg ${user.is_suspended ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-orange-600 bg-orange-50 hover:bg-orange-100"}`}
                >
                  {user.is_suspended
                    ? t("dashboard.unblock")
                    : t("dashboard.block")}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.user")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.role")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.agency")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.registeredOnHeader")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onViewUserDetails && onViewUserDetails(user)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}
                    >
                      {user.role === ROLES.CLIENT
                        ? "Client"
                        : user.role === ROLES.AGENCY_ADMIN
                          ? "Admin Agence"
                          : "Super Admin"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.agency || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.registeredAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditUser(user);
                      }}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSuspendUser && onSuspendUser(user);
                      }}
                      className={`${user.is_suspended ? "text-green-600 hover:text-green-900" : "text-orange-600 hover:text-orange-900"}`}
                    >
                      {user.is_suspended ? "Débloquer" : "Bloquer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            itemsPerPage={itemsPerPage}
            totalItems={filteredUsers.length}
          />
        )}
      </div>
    );
  }

  if (activeTab === "messages") {
    const formatMessageDate = (dateValue) => {
      if (!dateValue) return "-";
      return new Date(dateValue).toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    };

    const unreadCount = (contactMessages || []).filter(
      (message) => !message.is_read,
    ).length;
    const totalPages = Math.ceil((contactMessages || []).length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMessages = (contactMessages || []).slice(
      startIndex,
      endIndex,
    );

    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("dashboard.contactMessages")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("dashboard.contactMessagesCount", {
              count: contactMessages.length,
              unread: unreadCount,
            })}
          </p>
        </div>

        {paginatedMessages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
            {t("dashboard.noMessages")}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="md:hidden space-y-3">
              {paginatedMessages.map((message) => (
                <div
                  key={message.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {message.name}
                      </h3>
                      <p className="text-sm text-gray-500">{message.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        message.is_read
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {message.is_read ? "Lu" : "Non lu"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-700">Sujet:</span>{" "}
                      {message.subject}
                    </p>
                    <p className="text-gray-500 line-clamp-3">
                      {message.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatMessageDate(message.created_at)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() =>
                        setMessageDetailsModal({ isOpen: true, message })
                      }
                      className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Voir détails
                    </button>
                    {!message.is_read && (
                      <button
                        onClick={() => onMarkMessageRead(message.id)}
                        className="flex-1 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100"
                      >
                        Marquer lu
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteContactMessage(message.id)}
                      className="flex-1 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Expéditeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sujet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedMessages.map((message) => (
                    <tr
                      key={message.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        setMessageDetailsModal({ isOpen: true, message })
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {message.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {message.email}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-gray-700 max-w-[280px] truncate"
                        title={message.subject}
                      >
                        {message.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatMessageDate(message.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            message.is_read
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {message.is_read ? "Lu" : "Non lu"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!message.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkMessageRead(message.id);
                            }}
                            className="text-primary-600 hover:text-primary-800 mr-3"
                          >
                            Marquer lu
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteContactMessage(message.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {messageDetailsModal.isOpen && messageDetailsModal.message && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() =>
                setMessageDetailsModal({ isOpen: false, message: null })
              }
            ></div>
            <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-auto shadow-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Détail du message
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Reçu le{" "}
                    {formatMessageDate(messageDetailsModal.message.created_at)}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setMessageDetailsModal({ isOpen: false, message: null })
                  }
                  className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Nom</p>
                    <p className="font-medium text-gray-900">
                      {messageDetailsModal.message.name}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 break-all">
                      {messageDetailsModal.message.email}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Téléphone</p>
                  <p className="font-medium text-gray-900">
                    {messageDetailsModal.message.phone || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">Sujet</p>
                  <p className="font-medium text-gray-900">
                    {messageDetailsModal.message.subject}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-2">Message</p>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {messageDetailsModal.message.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={contactMessages.length}
          />
        )}
      </div>
    );
  }

  if (activeTab === "reports") {
    // Get the correct reports list based on view
    const currentReports = reportsView === "active" ? reports : trashedReports;

    // Filter reports based on selected filter (only for active view)
    const filteredReports =
      reportsView === "active"
        ? reportsFilter === "all"
          ? currentReports
          : currentReports.filter((r) => r.status === reportsFilter)
        : currentReports;

    const totalPages = Math.ceil((filteredReports || []).length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReports = (filteredReports || []).slice(
      startIndex,
      endIndex,
    );

    // Get resolved reports for history
    const resolvedReports = reports.filter(
      (r) => r.status === REPORT_STATUS.RESOLVED,
    );

    return (
      <div className="space-y-5">
        {/* Header with Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.role === ROLES.AGENCY_ADMIN
                ? "Signalements de mes véhicules"
                : reportsView === "active"
                  ? "Signalements"
                  : "Corbeille"}
            </h2>
            {reportsView === "trash" && user?.role === ROLES.SUPER_ADMIN && (
              <p className="text-sm text-gray-500 mt-1">
                Suppression automatique après 30 jours
              </p>
            )}
          </div>
          {user?.role === ROLES.SUPER_ADMIN && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setHistoryModal({
                    isOpen: true,
                    resolvedReports: resolvedReports,
                  });
                }}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Historique ({resolvedReports.length})
              </button>
              <button
                onClick={() => {
                  setReportsView(reportsView === "active" ? "trash" : "active");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                  reportsView === "trash"
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {reportsView === "trash" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  )}
                </svg>
                {reportsView === "trash"
                  ? "Retour"
                  : `Corbeille (${trashedReports.length})`}
              </button>
            </div>
          )}
        </div>

        {/* Filter Buttons (only for active view) */}
        {reportsView === "active" && (
          <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
            <span className="text-sm font-medium text-gray-700">Filtrer:</span>
            <button
              onClick={() => {
                setReportsFilter("all");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                reportsFilter === "all"
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tous ({reports.length})
            </button>
            <button
              onClick={() => {
                setReportsFilter(REPORT_STATUS.PENDING);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                reportsFilter === REPORT_STATUS.PENDING
                  ? "bg-yellow-600 text-white shadow-md"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
            >
              En attente (
              {reports.filter((r) => r.status === REPORT_STATUS.PENDING).length}
              )
            </button>
            <button
              onClick={() => {
                setReportsFilter(REPORT_STATUS.RESOLVED);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                reportsFilter === REPORT_STATUS.RESOLVED
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              Résolus (
              {
                reports.filter((r) => r.status === REPORT_STATUS.RESOLVED)
                  .length
              }
              )
            </button>
            <button
              onClick={() => {
                setReportsFilter(REPORT_STATUS.DISMISSED);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                reportsFilter === REPORT_STATUS.DISMISSED
                  ? "bg-gray-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejetés (
              {
                reports.filter((r) => r.status === REPORT_STATUS.DISMISSED)
                  .length
              }
              )
            </button>
          </div>
        )}

        {/* Trash Info Banner */}
        {reportsView === "trash" && trashedReports.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Suppression automatique après 30 jours
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Les signalements dans la corbeille seront automatiquement
                  supprimés définitivement après 30 jours. Vous pouvez restaurer
                  ou supprimer manuellement les signalements ci-dessous.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {paginatedReports.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  reportsView === "trash"
                    ? "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    : "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                }
              />
            </svg>
            <p className="text-gray-500 text-lg">
              {reportsView === "trash"
                ? "La corbeille est vide"
                : reportsFilter === "all"
                  ? "Aucun signalement pour le moment"
                  : `Aucun signalement ${
                      reportsFilter === REPORT_STATUS.PENDING
                        ? "en attente"
                        : reportsFilter === REPORT_STATUS.RESOLVED
                          ? "résolu"
                          : "rejeté"
                    }`}
            </p>
            {reportsView === "trash" && (
              <p className="text-gray-400 text-sm mt-2">
                Les signalements supprimés sont automatiquement effacés après 30
                jours
              </p>
            )}
          </div>
        )}

        {/* Reports List */}
        {paginatedReports.length > 0 && (
          <div className="space-y-3">
            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {paginatedReports.map((report) => (
                <div
                  key={report.id}
                  className={`bg-white rounded-xl border p-4 shadow-sm ${reportsView === "active" ? "cursor-pointer" : ""} ${report.status === REPORT_STATUS.PENDING ? "border-yellow-200 bg-yellow-50/40" : "border-gray-200"}`}
                  onClick={() =>
                    reportsView === "active" && onViewReportDetails(report)
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {report.reportType === "vehicle"
                          ? "Véhicule"
                          : report.reportType === "agency"
                            ? "Agence"
                            : "Client"}
                      </span>
                      {reportsView === "active" && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === REPORT_STATUS.PENDING ? "bg-yellow-100 text-yellow-800" : report.status === REPORT_STATUS.RESOLVED ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                        >
                          {report.status === REPORT_STATUS.PENDING
                            ? "En attente"
                            : report.status === REPORT_STATUS.RESOLVED
                              ? "Résolu"
                              : "Rejeté"}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(
                        report.reportedAt || report.created_at,
                      ).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">
                    {report.targetName}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    Par: {report.reportedBy}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {report.reason}
                  </p>
                  {reportsView === "trash" && (
                    <p className="text-xs text-orange-500 mt-1">
                      Suppression dans{" "}
                      {Math.ceil(
                        (new Date(report.autoDeleteAt).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      jours
                    </p>
                  )}
                  {reportsView === "active" &&
                    user?.role === ROLES.SUPER_ADMIN && (
                      <div className="flex items-center gap-2 pt-3 mt-2 border-t border-gray-100">
                        {report.status === REPORT_STATUS.PENDING && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setResolveModal({
                                  isOpen: true,
                                  type: "resolve",
                                  report,
                                });
                              }}
                              className="flex-1 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                            >
                              Résoudre
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setResolveModal({
                                  isOpen: true,
                                  type: "dismiss",
                                  report,
                                });
                              }}
                              className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteReport(report);
                          }}
                          className="py-1.5 px-3 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          Corbeille
                        </button>
                      </div>
                    )}
                  {reportsView === "trash" && (
                    <div className="flex items-center gap-2 pt-3 mt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestoreReport(report);
                        }}
                        className="flex-1 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        Restaurer
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmModal({ isOpen: true, report });
                        }}
                        className="flex-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Signalé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Raison
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    {reportsView === "active" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </th>
                    )}
                    {reportsView === "trash" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Suppression auto
                      </th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReports.map((report) => (
                    <tr
                      key={report.id}
                      onClick={() =>
                        reportsView === "active" && onViewReportDetails(report)
                      }
                      className={`${reportsView === "active" ? "cursor-pointer" : ""} transition-colors ${report.status === REPORT_STATUS.PENDING ? "bg-yellow-50/50 hover:bg-yellow-100/70" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {report.reportType === "vehicle"
                            ? "Véhicule"
                            : report.reportType === "agency"
                              ? "Agence"
                              : "Client"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {report.targetName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Par: {report.reportedBy}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {report.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(
                          report.reportedAt || report.created_at,
                        ).toLocaleDateString("fr-FR")}
                      </td>
                      {reportsView === "active" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {report.status === REPORT_STATUS.PENDING && (
                              <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                              </span>
                            )}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === REPORT_STATUS.PENDING ? "bg-yellow-100 text-yellow-800" : report.status === REPORT_STATUS.RESOLVED ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                            >
                              {report.status === REPORT_STATUS.PENDING
                                ? "En attente"
                                : report.status === REPORT_STATUS.RESOLVED
                                  ? "Résolu"
                                  : "Rejeté"}
                            </span>
                          </div>
                        </td>
                      )}
                      {reportsView === "trash" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {Math.ceil(
                            (new Date(report.autoDeleteAt).getTime() -
                              Date.now()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          jours
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {reportsView === "active" ? (
                          <>
                            {user?.role === ROLES.SUPER_ADMIN && (
                              <>
                                {report.status === REPORT_STATUS.PENDING && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setResolveModal({
                                          isOpen: true,
                                          type: "resolve",
                                          report,
                                        });
                                      }}
                                      className="text-green-600 hover:text-green-900 mr-3"
                                    >
                                      Résoudre
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setResolveModal({
                                          isOpen: true,
                                          type: "dismiss",
                                          report,
                                        });
                                      }}
                                      className="text-gray-600 hover:text-gray-900 mr-3"
                                    >
                                      Rejeter
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteReport(report);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                  title="Déplacer vers la corbeille"
                                >
                                  <svg
                                    className="w-5 h-5 inline"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}
                            {user?.role === ROLES.AGENCY_ADMIN && (
                              <span className="text-gray-500 text-sm italic">
                                Lecture seule
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRestoreReport(report);
                              }}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              <svg
                                className="w-5 h-5 inline mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                              Restaurer
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmModal({ isOpen: true, report });
                              }}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              <svg
                                className="w-5 h-5 inline mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            itemsPerPage={itemsPerPage}
            totalItems={(filteredReports || []).length}
          />
        )}

        {/* Resolve/Dismiss Modal */}
        <ResolveReportModal
          isOpen={resolveModal.isOpen}
          onClose={() =>
            setResolveModal({ isOpen: false, type: null, report: null })
          }
          report={resolveModal.report}
          type={resolveModal.type}
          onConfirm={(report, notes) => {
            if (resolveModal.type === "resolve") {
              onResolveReport && onResolveReport(report, notes);
            } else if (resolveModal.type === "dismiss") {
              onDismissReport && onDismissReport(report, notes);
            }
            setResolveModal({ isOpen: false, type: null, report: null });
          }}
        />

        {/* Permanent Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteConfirmModal.isOpen}
          onClose={() => setDeleteConfirmModal({ isOpen: false, report: null })}
          onConfirm={() => {
            if (deleteConfirmModal.report) {
              onPermanentDeleteReport(deleteConfirmModal.report);
              setDeleteConfirmModal({ isOpen: false, report: null });
            }
          }}
          title="Supprimer définitivement ?"
          message={`Êtes-vous sûr de vouloir supprimer définitivement le signalement "${deleteConfirmModal.report?.targetName}" ? Cette action est irréversible et le signalement sera perdu à jamais.`}
          confirmText="Supprimer définitivement"
          cancelText="Annuler"
          danger={true}
        />
      </div>
    );
  }

  if (activeTab === "statistics") {
    const statisticsSubTabs = [
      { id: "finance", label: "Finances" },
      { id: "global", label: "Statistiques Globales" },
    ];

    // Financial tab content
    const renderFinancialContent = () => {
      const monthlyRevenue = financialStats.monthly;
      const revenueByAgency = financialStats.byAgency;

      const totalRevenue = financialStats.totals.revenue;
      const totalProfit = financialStats.totals.profit;
      const totalCommission = financialStats.totals.commission;
      const avgMonthlyRevenue = financialStats.totals.avgMonthly;

      // Calculate growth percentages (comparing last month vs previous month)
      const calculateGrowth = (data, key) => {
        if (data.length < 2) return 0;
        const current = data[data.length - 1][key];
        const previous = data[data.length - 2][key];
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const revenueGrowth = calculateGrowth(monthlyRevenue, "revenue");
      const commissionGrowth = calculateGrowth(monthlyRevenue, "commission");
      const commissionRate =
        totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0;

      if (monthlyRevenue.length === 0) {
        // If the overall dashboard loading finished and we still have no
        // monthly data, show a friendly empty state instead of an infinite spinner
        if (!loading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-600">
                  Aucune donnée financière disponible.
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Chargement des données financières...
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Tableau de Bord Financier
            </h2>
          </div>

          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Revenu Total */}
            <div
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 animate-slideUp"
              style={{ animationDelay: "0ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${revenueGrowth >= 0 ? "text-green-600 bg-green-50 border-green-100" : "text-red-500 bg-red-50 border-red-100"}`}
                >
                  {revenueGrowth >= 0 ? "+" : ""}
                  {revenueGrowth.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                Revenu Total
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalRevenue.toLocaleString()} DT
              </p>
              <p className="text-xs text-gray-400 mt-2">Derniers 6 mois</p>
            </div>

            {/* Commission Gagnée */}
            <div
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 animate-slideUp"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${commissionGrowth >= 0 ? "text-green-600 bg-green-50 border-green-100" : "text-red-500 bg-red-50 border-red-100"}`}
                >
                  {commissionGrowth >= 0 ? "+" : ""}
                  {commissionGrowth.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                Commission Gagnée
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCommission.toLocaleString()} DT
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Votre revenu plateforme
              </p>
            </div>

            {/* Taux de Commission */}
            <div
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 animate-slideUp"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border text-violet-600 bg-violet-50 border-violet-100">
                  {commissionRate.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                Taux de Commission
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {commissionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400 mt-2">Sur le revenu total</p>
            </div>

            {/* Commission Moy./Mois */}
            <div
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 animate-slideUp"
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border text-amber-600 bg-amber-50 border-amber-100">
                  Moy.
                </span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                Commission Moy./Mois
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {(
                  totalCommission / Math.max(monthlyRevenue.length, 1)
                ).toLocaleString()}{" "}
                DT
              </p>
              <p className="text-xs text-gray-400 mt-2">Sur 6 derniers mois</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Revenue Trend Chart */}
            <div
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
              style={{ animationDelay: "400ms" }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Évolution du Revenu
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#3B82F6"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorProfit"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#10B981"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenu"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                    name="Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Agency */}
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "600ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Performance des Agences (Top 5)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByAgency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="#3B82F6"
                  name="Revenu"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="commission"
                  fill="#10B981"
                  name="Commission"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Financial Summary Table */}
          <div
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-slideUp"
            style={{ animationDelay: "700ms" }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Détails Mensuels
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Mois
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Revenu Total
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Commission
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">
                      Taux (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRevenue.map((month, index) => (
                    <tr
                      key={month.month}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {month.month}
                      </td>
                      <td className="text-right py-3 px-4 text-blue-600 font-semibold">
                        {month.revenue.toLocaleString()} DT
                      </td>
                      <td className="text-right py-3 px-4 text-green-600 font-semibold">
                        {month.commission.toLocaleString()} DT
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                          {month.revenue > 0
                            ? (
                                (month.commission / month.revenue) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes slideUp {
              from { 
                opacity: 0;
                transform: translateY(20px);
              }
              to { 
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .animate-fadeIn {
              animation: fadeIn 0.5s ease-out;
            }
            
            .animate-slideUp {
              animation: slideUp 0.6s ease-out both;
            }
          `}</style>
        </div>
      );
    };

    // Global statistics content
    const renderGlobalContent = () => {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">
            Statistiques Globales
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600 font-medium">
                  Total Agences
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-3xl font-bold text-blue-900">
                  {platformStats.totalAgencies}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600 font-medium">
                  Total Utilisateurs
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-3xl font-bold text-green-900">
                  {platformStats.totalUsers}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600 font-medium">
                  Revenu Mensuel
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-3xl font-bold text-purple-900">
                  {(platformStats?.monthlyRevenue ?? 0).toLocaleString()} DT
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* Sub-tabs Navigation */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          {statisticsSubTabs.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => setStatisticsSubTab(subTab.id)}
              className={`px-6 py-2.5 font-semibold rounded-lg transition-all duration-300 ${
                statisticsSubTab === subTab.id
                  ? "bg-white text-primary-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {subTab.label}
            </button>
          ))}
        </div>

        {/* Sub-tab Content */}
        {statisticsSubTab === "finance"
          ? renderFinancialContent()
          : renderGlobalContent()}
      </div>
    );
  }

  return null;
};

export default AdminContent;
