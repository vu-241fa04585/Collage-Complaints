import { format, formatDistanceToNow, parseISO, differenceInHours, isPast } from 'date-fns';

// Format date to readable string
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy');
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

// Relative time (e.g., "2 hours ago")
export const timeAgo = (date) => {
  if (!date) return 'N/A';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Check if date is overdue
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return isPast(new Date(dueDate));
};

// Hours remaining until due
export const hoursRemaining = (dueDate) => {
  if (!dueDate) return null;
  return differenceInHours(new Date(dueDate), new Date());
};

// Status display configuration
export const statusConfig = {
  submitted: { label: 'Submitted', color: 'blue', bgClass: 'badge-submitted' },
  assigned: { label: 'Assigned', color: 'purple', bgClass: 'badge-assigned' },
  in_progress: { label: 'In Progress', color: 'yellow', bgClass: 'badge-in-progress' },
  resolved: { label: 'Resolved', color: 'green', bgClass: 'badge-resolved' },
  closed: { label: 'Closed', color: 'gray', bgClass: 'badge-closed' },
  reopened: { label: 'Reopened', color: 'orange', bgClass: 'badge-reopened' },
  escalated: { label: 'Escalated', color: 'red', bgClass: 'badge-escalated' },
};

// Priority display configuration
export const priorityConfig = {
  critical: { label: 'Critical', color: 'red', bgClass: 'badge-critical', icon: '🔴' },
  high: { label: 'High', color: 'orange', bgClass: 'badge-high', icon: '🟠' },
  medium: { label: 'Medium', color: 'yellow', bgClass: 'badge-medium', icon: '🟡' },
  low: { label: 'Low', color: 'green', bgClass: 'badge-low', icon: '🟢' },
};

// Category display names
export const categoryLabels = {
  classroom: 'Classroom Facilities',
  laboratory: 'Laboratory Equipment',
  internet_wifi: 'Internet & Wi-Fi',
  hostel: 'Hostel Facilities',
  transportation: 'Transportation',
  library: 'Library Services',
  canteen: 'Canteen & Food Quality',
  drinking_water_sanitation: 'Drinking Water & Sanitation',
  academic: 'Academic Issues',
  faculty_related: 'Faculty Related',
  examination: 'Examination & Administration',
  ragging_harassment: 'Ragging & Harassment',
  infrastructure: 'Infrastructure',
  other: 'Other',
};

// Category icons
export const categoryIcons = {
  classroom: '🏫',
  laboratory: '🔬',
  internet_wifi: '📶',
  hostel: '🏠',
  transportation: '🚌',
  library: '📚',
  canteen: '🍽️',
  drinking_water_sanitation: '💧',
  academic: '📖',
  faculty_related: '👨‍🏫',
  examination: '📝',
  ragging_harassment: '⚠️',
  infrastructure: '🏗️',
  other: '📋',
};

// Role display names
export const roleLabels = {
  student: 'Student',
  faculty: 'Faculty / Staff',
  department_head: 'Department Head',
  admin: 'Administrator',
  management: 'College Management',
};

// Get role-based dashboard route
export const getDashboardRoute = (role) => {
  const routes = {
    student: '/student/dashboard',
    faculty: '/faculty/dashboard',
    department_head: '/department/dashboard',
    admin: '/admin/dashboard',
    management: '/management/dashboard',
  };
  return routes[role] || '/login';
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate file type
export const isValidFileType = (file) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  return allowedTypes.includes(file.type);
};

// Max file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

