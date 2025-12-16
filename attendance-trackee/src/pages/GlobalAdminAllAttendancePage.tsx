
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { globalAdminAPI, globalAdminOperationsAPI } from '../api';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import type { Theme } from '@mui/material/styles';


const GlobalAdminAllAttendancePage: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const navigate = useNavigate();
  const [verticalFilter, setVerticalFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      setAttendanceLoading(true);
      try {
        const data = await globalAdminAPI.getAllVerticalsAttendanceSummary();
        setAttendanceData(data.attendance_summary || []);
      } catch (err) {
        setAttendanceData([]);
      } finally {
        setAttendanceLoading(false);
      }
    };
    fetchAttendanceSummary();
  }, []);

  // Get unique verticals and years for filters
  const verticals = Array.from(new Set(attendanceData.map((m) => m.vertical).filter(Boolean)));
  const years = Array.from(new Set(attendanceData.map((m) => m.year).filter(Boolean))).sort();

  // Filter and sort logic
  const filteredAttendance = attendanceData.filter((m) => {
    const verticalMatch = verticalFilter ? m.vertical === verticalFilter : true;
    const yearMatch = yearFilter ? String(m.year) === yearFilter : true;
    return verticalMatch && yearMatch;
  });

  const sortedAttendance = [...filteredAttendance].sort((a, b) => {
    const percentA = typeof a.percentage === 'number' ? a.percentage : 0;
    const percentB = typeof b.percentage === 'number' ? b.percentage : 0;
    if (sortOrder === 'asc') {
      return percentA - percentB;
    } else {
      return percentB - percentA;
    }
  });

  // Download CSV report
  const handleDownloadCsv = async () => {
    try {
      setDownloadingCsv(true);
      const response = await globalAdminOperationsAPI.generateAttendanceReport();
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success toast
      toast.success('Attendance report downloaded successfully!');
    } catch (err: any) {
      console.error('Error downloading CSV:', err);
      
      // Handle blob error response - axios returns error as blob when responseType is 'blob'
      if (err instanceof Blob) {
        try {
          const text = await err.text();
          const errorData = JSON.parse(text);
          const errorMessage = errorData.error || 'Failed to download attendance report';
          toast.error(errorMessage);
        } catch {
          toast.error('Failed to download attendance report');
        }
      } else {
        // Handle regular error objects from the interceptor
        const errorMessage = err?.error || err?.message || 'Failed to download attendance report';
        toast.error(errorMessage);
      }
    } finally {
      setDownloadingCsv(false);
    }
  };

  // Color chip for percentage
  const getAttendanceChip = (percentage: number) => {
    if (percentage === undefined || percentage === null || isNaN(percentage)) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-slate-700/40 text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-slate-600">N/A</span>
      );
    } else if (percentage >= 80) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100/80 dark:bg-emerald-600/30 text-green-800 dark:text-emerald-200">{percentage.toFixed(1)}%</span>
      );
    } else if (percentage >= 60) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100/80 dark:bg-amber-500/30 text-yellow-800 dark:text-amber-200">{percentage.toFixed(1)}%</span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100/80 dark:bg-rose-600/30 text-red-800 dark:text-rose-200">{percentage.toFixed(1)}%</span>
      );
    }
  };

  const headerCellSx = (theme: Theme) => ({
    color: '#f8fafc',
    fontWeight: theme.palette.mode === 'dark' ? 600 : 500,
    whiteSpace: 'nowrap',
    fontSize: { xs: 12, sm: 16 },
    px: { xs: 1, sm: 2 },
    py: { xs: 1, sm: 2 },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-0 sm:p-6 text-left backdrop-blur transition-colors">
          {/* Card header with title, back button, and filters on right */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-4 border-b border-gray-100 dark:border-slate-800/80">
            <div className="flex items-center mb-2 sm:mb-0 gap-3">
              <button
                onClick={() => navigate('/global-admin/dashboard')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/60"
                aria-label="Back to Dashboard"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 className="ml-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">All Members Attendance</h1>
              <button
                onClick={handleDownloadCsv}
                disabled={downloadingCsv || attendanceLoading}
                className="ml-4 inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                {downloadingCsv ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download CSV
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <div className="flex gap-2 items-center bg-gray-50 dark:bg-slate-900 border border-blue-200 dark:border-blue-400/50 rounded-lg px-2 py-1.5">
                <label className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-200">Vertical</label>
                <select
                  value={verticalFilter}
                  onChange={e => setVerticalFilter(e.target.value)}
                  className="border border-blue-400 dark:border-blue-500 rounded px-2 py-1 text-blue-700 dark:text-blue-200 font-semibold text-xs sm:text-sm focus:outline-none bg-white dark:bg-slate-900"
                  style={{ minWidth: 70 }}
                >
                  <option value="">All</option>
                  {verticals.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <label className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-200 ml-1">Year</label>
                <select
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                  className="border border-blue-400 dark:border-blue-500 rounded px-2 py-1 text-blue-700 dark:text-blue-200 font-semibold text-xs sm:text-sm focus:outline-none bg-white dark:bg-slate-900"
                  style={{ minWidth: 50 }}
                >
                  <option value="">All</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 border border-blue-200 dark:border-blue-400/50 rounded-lg px-2 py-1.5">
                <span className="font-semibold text-xs sm:text-sm text-blue-700 dark:text-blue-200">Sort by</span>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="border border-blue-400 dark:border-blue-500 rounded px-2 py-1 text-blue-700 dark:text-blue-200 font-semibold text-xs sm:text-sm focus:outline-none bg-white dark:bg-slate-900"
                  style={{ minWidth: 80 }}
                >
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>
              </div>
            </div>
          </div>
          <div className="px-4 pt-4 pb-2 flex items-center">
            <span className="inline-block rounded-xl bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 dark:from-blue-900/40 dark:via-blue-800/20 dark:to-blue-900/40 text-blue-900 dark:text-blue-100 font-bold text-base sm:text-lg px-6 py-3 shadow border border-blue-200 dark:border-blue-500/40 tracking-wide transition-colors">
              {
                (() => {
                  // Helper to get ordinal suffix
                  const getOrdinal = (n: number) => {
                    const s = ["th", "st", "nd", "rd"], v = n % 100;
                    return n + (s[(v - 20) % 10] || s[v] || s[0]);
                  };
                  const yearText = yearFilter ? `${getOrdinal(Number(yearFilter))} year` : '';
                  if (verticalFilter && yearFilter) return `Attendance statistics for ${verticalFilter} (${yearText})`;
                  if (verticalFilter && !yearFilter) return `Attendance statistics for ${verticalFilter}`;
                  if (!verticalFilter && yearFilter) return `Attendance statistics for all verticals (${yearText})`;
                  return 'Attendance statistics for all verticals';
                })()
              }
            </span>
          </div>
          <div className="overflow-x-auto px-2 pb-2">
            {attendanceLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Paper
                elevation={2}
                className="attendance-table !bg-white/90 dark:!bg-slate-900/80 !text-inherit transition-colors"
                sx={{ width: '100%', overflowX: 'auto', boxShadow: { xs: 0, sm: 2 }, borderRadius: { xs: 1, sm: 2 } }}
              >
                <Table
                  sx={{
                    minWidth: 400,
                    width: '100%',
                    tableLayout: 'auto',
                    '& .MuiTableCell-root': {
                      borderBottomColor: '#e2e8f0',
                    },
                  }}
                  className="[&_td]:!text-slate-900 [&_.MuiTableCell-head]:!text-white dark:[&_td]:!text-white dark:[&_td]:!border-slate-700/60 dark:[&_th]:!border-slate-700/60 dark:[&_tr:hover_.MuiTableCell-root]:!text-white"
                >
                  <TableHead
                    sx={{
                      backgroundColor: '#2563eb',
                      '& .MuiTableCell-root': {
                        color: '#f8fafc',
                        borderBottom: 'none',
                      },
                    }}
                    className="dark:!bg-slate-800/95"
                  >
                    <TableRow>
                      <TableCell sx={headerCellSx}>Name</TableCell>
                      <TableCell sx={headerCellSx}>Roll No</TableCell>
                      <TableCell sx={headerCellSx}>Vertical</TableCell>
                      <TableCell sx={headerCellSx}>Meetings Attended</TableCell>
                      <TableCell sx={headerCellSx}>Attendance %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedAttendance.map((member, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          '& td': { fontSize: { xs: 12, sm: 15 }, px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 } },
                          '&:hover': { backgroundColor: 'rgba(59,130,246,0.08)' },
                        }}
                        className="dark:hover:!bg-slate-800/60"
                      >
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.roll_no}</TableCell>
                        <TableCell>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100/80 dark:bg-blue-600/30 text-blue-800 dark:text-blue-200">
                            {member.vertical}
                          </span>
                        </TableCell>
                        <TableCell>{member.attended} / {typeof member.total_meetings === 'number' ? member.total_meetings : (typeof member.attended === 'number' && typeof member.notAttended === 'number' ? member.attended + member.notAttended : '-')}</TableCell>
                        <TableCell>{getAttendanceChip(member.percentage)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAdminAllAttendancePage;
