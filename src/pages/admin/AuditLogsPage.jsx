import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/helpers';
import { HiDocumentReport, HiShieldCheck } from 'react-icons/hi';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15 });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs({ page, limit: 15 });
      setLogs(res.data.data || []);
      setPagination(
        res.data.pagination || { total: res.data.data?.length || 0, pages: 1, limit: 15 }
      );
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (val) => (
        <span className="font-mono text-xs text-gray-500">
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'Acting User',
      render: (val) => (
        <div>
          <p className="font-semibold text-gray-900 text-xs">{val?.name || 'System Auto'}</p>
          <span className="text-[10px] text-gray-400 font-mono">{val?.email || 'automated-task'}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Operation / Action',
      render: (val) => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {val}
        </span>
      ),
    },
    {
      key: 'resourceType',
      label: 'Entity Affected',
      render: (val, row) => (
        <span className="text-xs text-gray-700 capitalize font-medium">
          {val}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (val) => (
        <span className="font-mono text-xs text-gray-400">{val || '127.0.0.1'}</span>
      ),
    },
    {
      key: 'details',
      label: 'Audit Payload Details',
      render: (val) => (
        <span className="text-xs text-gray-500 truncate max-w-xs block font-mono">
          {val ? JSON.stringify(val) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          System Security & Redressal Audit Trail
        </h2>
        <p className="text-xs text-gray-500">
          Tamper-evident record of all administrative overrides, grievance status transitions, and user actions
        </p>
      </div>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyMessage="No audit logs recorded yet."
        />

        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
};

export default AuditLogsPage;

