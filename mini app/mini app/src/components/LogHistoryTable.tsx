import React, { useState } from 'react';
import { DatabaseRecord } from '../types';
import { Database, Download, Search, Trash2, CheckCircle2, XCircle, ExternalLink, RefreshCw, Filter } from 'lucide-react';
import { exportLogsToCSV, clearLogs, downloadJsonFile } from '../utils/storage';

interface LogHistoryTableProps {
  logs: DatabaseRecord[];
  onRefreshLogs: () => void;
  onSelectLogRecord: (log: DatabaseRecord) => void;
}

export const LogHistoryTable: React.FC<LogHistoryTableProps> = ({
  logs,
  onRefreshLogs,
  onSelectLogRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'REJECTED'>('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.video_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.product_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.filter_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all logged analysis records?")) {
      clearLogs();
      onRefreshLogs();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>STEP 4: DATA STORAGE & LOGS</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Processed Video <span className="gradient-text-emerald">Database Logs</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportLogsToCSV(logs)}
            disabled={logs.length === 0}
            className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center space-x-1.5 border border-gray-700 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => downloadJsonFile(`viral_video_database_${Date.now()}.json`, logs)}
            disabled={logs.length === 0}
            className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center space-x-1.5 border border-gray-700 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={logs.length === 0}
            className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold flex items-center space-x-1.5 border border-rose-800/40 transition disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search URL or Product..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-400">Filter:</span>
          {(['ALL', 'PASSED', 'REJECTED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                statusFilter === status
                  ? status === 'PASSED'
                    ? 'bg-emerald-500 text-black'
                    : status === 'REJECTED'
                    ? 'bg-rose-500 text-white'
                    : 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

      </div>

      {/* Log Table */}
      <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-900/90 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Status</th>
                <th className="p-4">Video URL & Target</th>
                <th className="p-4">Metrics (Followers / Views / Eng)</th>
                <th className="p-4">Pipeline Output</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80 text-gray-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-sans">
                    No logged records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/40 transition">
                    <td className="p-4 text-gray-400 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        log.filter_status === 'PASSED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                      }`}>
                        {log.filter_status === 'PASSED' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{log.filter_status}</span>
                      </span>
                    </td>

                    <td className="p-4 max-w-xs truncate">
                      <a
                        href={log.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:underline flex items-center gap-1 font-sans text-xs truncate"
                      >
                        <span className="truncate">{log.video_url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      {log.product_name && (
                        <div className="text-[11px] text-emerald-300 font-sans mt-0.5 font-semibold">
                          📦 {log.product_name}
                        </div>
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="text-gray-200">
                        <span className="text-gray-400">Fol:</span> {log.followers_count.toLocaleString()} | <span className="text-gray-400">Vws:</span> {log.views_count.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-[11px]">
                        Eng: {log.total_engagement.toLocaleString()}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.output_status === 'READY_FOR_RENDER'
                          ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50'
                          : 'bg-gray-800 text-gray-500'
                      }`}>
                        {log.output_status}
                      </span>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectLogRecord(log)}
                        className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-purple-300 font-sans flex items-center gap-1 ml-auto"
                        title="Reload metrics & script"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
