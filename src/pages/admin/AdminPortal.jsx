import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Archive as ArchiveIcon,
  Assessment as AssessmentIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  LockReset as LockResetIcon,
  MailOutline as MailOutlineIcon,
  ManageSearch as AuditIcon,
  PersonAdd as PersonAddIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Stop as StopIcon,
  SwapHoriz as SwapHorizIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import adminService from '../../services/adminService';
import { Sidebar } from '../../components/layout/Sidebar';

const riskColors = ['#1565c0', '#2e7d32', '#ed6c02', '#c62828', '#6a1b9a'];
const fmt = (value) => (value || value === 0 ? value : 'N/A');
const dateFmt = (value) => (value ? new Date(value).toLocaleString() : 'N/A');

const emptyForms = {
  user: { username: '', email: '', password: 'Password123!', full_name: '', role: 'student', university_id: '' },
  university: { university_name: '', university_code: '', campus_name: '', district: '', counseling_unit_phone: '' },
  counselor: {
    username: '',
    email: '',
    password: 'Password123!',
    full_name: '',
    university_id: '',
    qualification: '',
    specialization: '',
    telephone_number: '',
    whatsapp_number: '',
    available_days: 'Monday-Friday',
    available_from: '09:00',
    available_until: '17:00',
  },
  resource: { title: '', category: 'coping', resource_type: 'article', description: '', url: '' },
  report: { report_type: 'usage_summary' },
};

const getErrorMessage = (err) => {
  const detail = err.response?.data?.detail || err.response?.data?.error;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || JSON.stringify(item)).join(', ');
  }
  return detail || err.message || 'Action failed';
};

const cleanPayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, value === '' ? null : value]),
  );

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForms);
  const [data, setData] = useState({
    dashboard: null,
    statistics: null,
    users: [],
    universities: [],
    counselors: [],
    models: [],
    runtimeStatus: [],
    resources: [],
    supportContacts: [],
    reports: [],
    reportTypes: [],
    audit: [],
    settings: {},
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [
        dashboard,
        statistics,
        users,
        universities,
        counselors,
        models,
        runtimeStatus,
        resources,
        supportContacts,
        reports,
        audit,
        settings,
      ] = await Promise.all([
        adminService.getDashboard(),
        adminService.getStatistics({ days: 30 }),
        adminService.getUsers(),
        adminService.getUniversities(),
        adminService.getCounselors(),
        adminService.getModels(),
        adminService.getModelRuntimeStatus(),
        adminService.getResources(),
        adminService.getSupportContacts(),
        adminService.getReports(),
        adminService.getAudit(),
        adminService.getSettings(),
      ]);
      setData({
        dashboard,
        statistics,
        users: users.users || [],
        universities: universities.universities || [],
        counselors: counselors.counselors || [],
        models: models.models || [],
        runtimeStatus: runtimeStatus.runtime_status || [],
        resources: resources.resources || [],
        supportContacts: supportContacts.support_contacts || [],
        reports: reports.reports || [],
        reportTypes: reports.available_report_types || [],
        audit: audit.audit_logs || [],
        settings: settings.sections || {},
      });
    } catch (err) {
      setError(getErrorMessage(err) || 'Unable to load administration portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const visibleUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return data.users;
    return data.users.filter((user) =>
      [user.name, user.email, user.role, user.university, user.status].filter(Boolean).some((value) => value.toLowerCase().includes(needle)),
    );
  }, [data.users, search]);

  const submitDialog = async () => {
    try {
      setError('');
      if (dialog === 'user') {
        await adminService.createUser(cleanPayload(form.user));
      }
      if (dialog === 'university') {
        const payload = cleanPayload(form.university);
        if (editing?.type === 'university') {
          const { university_code: _unused, ...updates } = payload;
          await adminService.updateUniversity(editing.id, updates);
        } else {
          await adminService.createUniversity(payload);
        }
      }
      if (dialog === 'counselor') {
        const payload = cleanPayload(form.counselor);
        if (editing?.type === 'counselor') {
          const { username: _username, password: _password, university_id, ...updates } = payload;
          await adminService.updateCounselor(editing.id, updates);
          if (university_id) {
            await adminService.assignCounselorUniversity(editing.id, { university_id });
          }
        } else {
          await adminService.createCounselor(payload);
        }
      }
      if (dialog === 'resource') {
        const payload = cleanPayload(form.resource);
        if (editing?.type === 'resource') {
          await adminService.updateResource(editing.id, payload);
        } else {
          await adminService.createResource(payload);
        }
      }
      if (dialog === 'report') {
        await adminService.generateReport({ report_type: form.report.report_type });
      }
      setDialog(null);
      setEditing(null);
      setForm({ ...emptyForms });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const runAction = async (action) => {
    try {
      setError('');
      await action();
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openCreate = (type) => {
    setEditing(null);
    setForm({ ...emptyForms });
    setDialog(type);
  };

  const openEditUniversity = (item) => {
    setEditing({ type: 'university', id: item.id });
    setForm({
      ...emptyForms,
      university: {
        university_name: item.university_name || item.university || '',
        university_code: item.university_code || '',
        campus_name: item.campus_name || item.campus || '',
        district: item.district || '',
        counseling_unit_phone: item.counseling_unit_phone || '',
      },
    });
    setDialog('university');
  };

  const openEditCounselor = (item) => {
    setEditing({ type: 'counselor', id: item.id });
    setForm({
      ...emptyForms,
      counselor: {
        ...emptyForms.counselor,
        username: item.username || '',
        email: item.email || '',
        password: '',
        full_name: item.full_name || '',
        university_id: item.university_id || '',
        qualification: item.qualification || '',
        specialization: item.specialization || '',
        telephone_number: item.telephone_number || '',
        whatsapp_number: item.whatsapp_number || '',
        available_days: item.available_days || '',
        available_from: item.available_from || '',
        available_until: item.available_until || '',
      },
    });
    setDialog('counselor');
  };

  const openEditResource = (item) => {
    setEditing({ type: 'resource', id: item.id });
    setForm({
      ...emptyForms,
      resource: {
        title: item.title || '',
        category: item.category || 'coping',
        resource_type: item.resource_type || 'article',
        description: item.description || '',
        url: item.url || '',
      },
    });
    setDialog('resource');
  };

  if (loading) {
    return (
      <div className="student-shell">
        <Sidebar
          variant="admin"
          activeKey={activeTab}
          onItemSelect={(item) => setActiveTab(item.key)}
        />
        <main className="student-main">
          <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f6f8fb', pt: { xs: 6, lg: 0 } }}>
            <CircularProgress />
          </Box>
        </main>
      </div>
    );
  }

  return (
    <div className="student-shell">
      <Sidebar
        variant="admin"
        activeKey={activeTab}
        onItemSelect={(item) => setActiveTab(item.key)}
      />
      <main className="student-main">
        <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fb', pt: { xs: 6, lg: 0 } }}>
          <Box sx={{ px: { xs: 2, md: 3 }, py: 2, bgcolor: '#ffffff', borderBottom: '1px solid #dfe5ee', position: 'sticky', top: 0, zIndex: 5 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" gap={2}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1d2733' }}>Administration Portal</Typography>
                <Typography variant="body2" color="text.secondary">Platform governance and institutional management</Typography>
              </Box>
              <Stack direction="row" gap={1} justifyContent="flex-end">
                <Tooltip title="Refresh portal data">
                  <IconButton onClick={loadData}><RefreshIcon /></IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {activeTab === 'dashboard' && <DashboardView dashboard={data.dashboard} audit={data.audit} />}
            {activeTab === 'universities' && <UniversitiesView universities={data.universities} onCreate={() => openCreate('university')} onEdit={openEditUniversity} onDeactivate={(id) => runAction(() => adminService.deactivateUniversity(id))} />}
            {activeTab === 'users' && <UsersView users={visibleUsers} counselors={data.counselors} search={search} setSearch={setSearch} onCreate={() => openCreate('user')} onAction={runAction} />}
            {activeTab === 'counselors' && <CounselorsView counselors={data.counselors} onCreate={() => openCreate('counselor')} onEdit={openEditCounselor} onAction={runAction} />}
            {activeTab === 'models' && <ModelsView models={data.models} runtimeStatus={data.runtimeStatus} onAction={runAction} />}
            {activeTab === 'resources' && <ResourcesView resources={data.resources} onCreate={() => openCreate('resource')} onEdit={openEditResource} onAction={runAction} />}
            {activeTab === 'analytics' && <AnalyticsView statistics={data.statistics} />}
            {activeTab === 'reports' && <ReportsView reports={data.reports} reportTypes={data.reportTypes} onCreate={() => openCreate('report')} onAction={runAction} />}
            {activeTab === 'audit' && <AuditView audit={data.audit} onAction={runAction} />}
            {activeTab === 'settings' && <SettingsView settings={data.settings} onAction={runAction} />}
          </Box>

          <AdminDialog dialog={dialog} editing={editing} form={form} setForm={setForm} universities={data.universities} reportTypes={data.reportTypes} onClose={() => { setDialog(null); setEditing(null); }} onSubmit={submitDialog} />
        </Box>
      </main>
    </div>
  );
};

const ToolbarTitle = ({ title, children }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
    <Stack direction="row" gap={1} justifyContent="flex-end">{children}</Stack>
  </Stack>
);

const DashboardView = ({ dashboard }) => {
  const cards = [
    ['Total Universities', dashboard?.total_universities],
    ['Total Students', dashboard?.total_students],
    ['Total Counselors', dashboard?.total_counselors],
    ['Total Administrators', dashboard?.total_administrators],
    ["Today's Logins", dashboard?.todays_logins],
    ["Today's Assessments", dashboard?.todays_assessments],
    ['Fusion Assessments', dashboard?.fusion_assessments],
    ['Support Requests', dashboard?.support_requests],
    ['Active Models', dashboard?.active_models],
    ['System Status', dashboard?.system_status?.status],
    ['Storage Usage', `${dashboard?.storage_usage?.megabytes || 0} MB`],
  ];
  return (
    <Stack gap={2}>
      <Grid container spacing={2}>
        {cards.map(([label, value]) => (
          <Grid item xs={12} sm={6} md={3} lg={2.4} key={label}>
            <Paper sx={{ p: 2, borderRadius: 1.5, border: '1px solid #dfe5ee', height: '100%' }}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 800, color: '#14395f' }}>{fmt(value)}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ p: 2, borderRadius: 1.5 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Recent Activity</Typography>
        <CompactTable headers={['Timestamp', 'User', 'Action', 'Entity', 'Status']}>
          {(dashboard?.recent_activity || []).map((item, index) => (
            <TableRow key={`${item.timestamp}-${index}`}>
              <TableCell>{dateFmt(item.timestamp)}</TableCell>
              <TableCell>{fmt(item.user)}</TableCell>
              <TableCell>{item.action}</TableCell>
              <TableCell>{item.entity}</TableCell>
              <TableCell><StatusChip value={item.status} /></TableCell>
            </TableRow>
          ))}
        </CompactTable>
      </Paper>
    </Stack>
  );
};

const UniversitiesView = ({ universities, onCreate, onEdit, onDeactivate }) => (
  <Paper sx={{ p: 2, borderRadius: 1.5 }}>
    <ToolbarTitle title="University Management">
      <Button startIcon={<AddIcon />} variant="contained" onClick={onCreate}>Create</Button>
    </ToolbarTitle>
    <CompactTable headers={['University', 'Campus', 'District', 'Students', 'Counselors', 'Support Contacts', 'Status', 'Actions']}>
      {universities.map((item) => (
        <TableRow key={item.id} hover>
          <TableCell>{item.university}</TableCell>
          <TableCell>{fmt(item.campus)}</TableCell>
          <TableCell>{fmt(item.district)}</TableCell>
          <TableCell>{fmt(item.students)}</TableCell>
          <TableCell>{fmt(item.counselors)}</TableCell>
          <TableCell>{fmt(item.support_contacts)}</TableCell>
          <TableCell><StatusChip value={item.status} /></TableCell>
          <TableCell>
            <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(item)}><EditIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="View statistics"><IconButton size="small"><AnalyticsIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Transfer students"><IconButton size="small"><SwapHorizIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Deactivate"><IconButton size="small" onClick={() => onDeactivate(item.id)}><BlockIcon fontSize="small" /></IconButton></Tooltip>
          </TableCell>
        </TableRow>
      ))}
    </CompactTable>
  </Paper>
);

const UsersView = ({ users, counselors, search, setSearch, onCreate, onAction }) => (
  <Paper sx={{ p: 2, borderRadius: 1.5 }}>
    <ToolbarTitle title="User Management">
      <TextField size="small" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }} />
      <Button startIcon={<UploadFileIcon />} variant="outlined" disabled>Bulk Import</Button>
      <Button startIcon={<AddIcon />} variant="contained" onClick={onCreate}>Create</Button>
    </ToolbarTitle>
    <CompactTable headers={['Name', 'Email', 'University', 'Role', 'Status', 'Registration Date', 'Last Login', 'Assigned Counselor', 'Actions']}>
      {users.map((user) => (
        <TableRow key={user.id} hover>
          <TableCell>{user.name}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>{fmt(user.university)}</TableCell>
          <TableCell>{user.role}</TableCell>
          <TableCell><StatusChip value={user.status} /></TableCell>
          <TableCell>{dateFmt(user.registration_date)}</TableCell>
          <TableCell>{dateFmt(user.last_login)}</TableCell>
          <TableCell>{fmt(user.assigned_counselor)}</TableCell>
          <TableCell>
            <Tooltip title="Activate"><IconButton size="small" onClick={() => onAction(() => adminService.updateUser(user.id, { status: 'active' }))}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Suspend"><IconButton size="small" onClick={() => onAction(() => adminService.updateUser(user.id, { status: 'suspended' }))}><BlockIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Reset password"><IconButton size="small" onClick={() => onAction(() => adminService.resetPassword(user.id))}><LockResetIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Resend invitation"><IconButton size="small" onClick={() => onAction(() => adminService.resendInvitation(user.id))}><MailOutlineIcon fontSize="small" /></IconButton></Tooltip>
            {user.role === 'student' && counselors[0] && (
              <Tooltip title="Assign counselor"><IconButton size="small" onClick={() => onAction(() => adminService.assignCounselor(user.id, { counselor_id: counselors[0].user_id || counselors[0].id }))}><PersonAddIcon fontSize="small" /></IconButton></Tooltip>
            )}
          </TableCell>
        </TableRow>
      ))}
    </CompactTable>
  </Paper>
);

const CounselorsView = ({ counselors, onCreate, onEdit, onAction }) => (
  <Paper sx={{ p: 2, borderRadius: 1.5 }}>
    <ToolbarTitle title="Counselor Management">
      <Button startIcon={<AddIcon />} variant="contained" onClick={onCreate}>Create</Button>
    </ToolbarTitle>
    <CompactTable headers={['Counselor', 'Qualification', 'Specialization', 'University', 'Students Assigned', 'Availability', 'Phone', 'WhatsApp', 'Status', 'Performance', 'Actions']}>
      {counselors.map((item) => (
        <TableRow key={item.id} hover>
          <TableCell>{item.full_name}</TableCell>
          <TableCell>{fmt(item.qualification)}</TableCell>
          <TableCell>{fmt(item.specialization)}</TableCell>
          <TableCell>{fmt(item.university_name)}</TableCell>
          <TableCell>{fmt(item.assignment_count)}</TableCell>
          <TableCell>{fmt(item.availability_status)}</TableCell>
          <TableCell>{fmt(item.telephone_number)}</TableCell>
          <TableCell>{fmt(item.whatsapp_number)}</TableCell>
          <TableCell><StatusChip value={item.active ? 'active' : 'inactive'} /></TableCell>
          <TableCell>{item.unresolved_review_count || 0} reviews</TableCell>
          <TableCell>
            <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(item)}><EditIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Transfer students"><IconButton size="small"><SwapHorizIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Deactivate"><IconButton size="small" onClick={() => onAction(() => adminService.deactivateCounselor(item.id))}><BlockIcon fontSize="small" /></IconButton></Tooltip>
          </TableCell>
        </TableRow>
      ))}
    </CompactTable>
  </Paper>
);

const ModelsView = ({ models, runtimeStatus, onAction }) => (
  <Stack gap={2}>
    <Paper sx={{ p: 2, borderRadius: 1.5 }}>
      <ToolbarTitle title="Runtime Health" />
      <CompactTable headers={['Modality', 'Health', 'Active', 'Artifact', 'Hash', 'Loader', 'Preprocessing', 'Smoke Test', 'Last Inference', 'Fusion', 'Reason']}>
        {(runtimeStatus || []).map((item) => (
          <TableRow key={item.modality} hover>
            <TableCell>{item.modality}</TableCell>
            <TableCell><StatusChip value={item.health_state} /></TableCell>
            <TableCell>{item.active ? 'Yes' : 'No'}</TableCell>
            <TableCell>{item.artifact_available ? 'Available' : 'Unavailable'}</TableCell>
            <TableCell>{item.hash_valid ? 'Valid' : 'Not valid'}</TableCell>
            <TableCell>{fmt(item.loader_status)}</TableCell>
            <TableCell>{fmt(item.preprocessing_status)}</TableCell>
            <TableCell>{fmt(item.smoke_test_status)}</TableCell>
            <TableCell>{dateFmt(item.last_successful_inference || item.last_failed_inference)}</TableCell>
            <TableCell>{item.fusion_eligibility ? 'Eligible' : 'Excluded'}</TableCell>
            <TableCell>{fmt(item.failure_reason)}</TableCell>
          </TableRow>
        ))}
      </CompactTable>
    </Paper>

    <Paper sx={{ p: 2, borderRadius: 1.5 }}>
      <ToolbarTitle title="ML Model Management" />
      <CompactTable headers={['Profile', 'Version', 'Status', 'Hash', 'Framework', 'Accuracy', 'Created', 'Approved', 'Active', 'Actions']}>
        {models.map((model) => (
          <TableRow key={model.id} hover>
            <TableCell>{model.modality}</TableCell>
            <TableCell>{model.version}</TableCell>
            <TableCell><StatusChip value={model.status} /></TableCell>
            <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmt(model.hash)}</TableCell>
            <TableCell>{model.framework}</TableCell>
            <TableCell>{fmt(model.accuracy)}</TableCell>
            <TableCell>{dateFmt(model.created)}</TableCell>
            <TableCell>{dateFmt(model.approved)}</TableCell>
            <TableCell>{model.active ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              <Tooltip title="Verify"><IconButton size="small" onClick={() => onAction(() => adminService.verifyModel(model.id))}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Verify runtime"><IconButton size="small" onClick={() => onAction(() => adminService.verifyRuntimeModel(model.id))}><AuditIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Smoke test"><IconButton size="small" onClick={() => onAction(() => adminService.smokeTestModel(model.id))}><AssessmentIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Activate"><IconButton size="small" onClick={() => onAction(() => adminService.activateModel(model.id))}><PlayArrowIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Deactivate"><IconButton size="small" onClick={() => onAction(() => adminService.deactivateModel(model.id))}><StopIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Rollback"><IconButton size="small" onClick={() => onAction(() => adminService.rollbackModel(model.id))}><HistoryIcon fontSize="small" /></IconButton></Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </CompactTable>
    </Paper>
  </Stack>
);

const ResourcesView = ({ resources, onCreate, onEdit, onAction }) => (
  <Paper sx={{ p: 2, borderRadius: 1.5 }}>
    <ToolbarTitle title="Resource Management">
      <Button startIcon={<AddIcon />} variant="contained" onClick={onCreate}>Upload</Button>
    </ToolbarTitle>
    <CompactTable headers={['Title', 'Type', 'Category', 'Status', 'Active', 'Created', 'Actions']}>
      {resources.map((resource) => (
        <TableRow key={resource.id} hover>
          <TableCell>{resource.title}</TableCell>
          <TableCell>{resource.resource_type}</TableCell>
          <TableCell>{resource.category}</TableCell>
          <TableCell><StatusChip value={resource.status} /></TableCell>
          <TableCell>{resource.is_active ? 'Yes' : 'No'}</TableCell>
          <TableCell>{dateFmt(resource.created_at)}</TableCell>
          <TableCell>
            <Tooltip title="Edit"><IconButton size="small" onClick={() => onEdit(resource)}><EditIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Approve"><IconButton size="small" onClick={() => onAction(() => adminService.approveResource(resource.id))}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Archive"><IconButton size="small" onClick={() => onAction(() => adminService.archiveResource(resource.id))}><ArchiveIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" onClick={() => onAction(() => adminService.deleteResource(resource.id))}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
          </TableCell>
        </TableRow>
      ))}
    </CompactTable>
  </Paper>
);

const AnalyticsView = ({ statistics }) => (
  <Grid container spacing={2}>
    <Grid item xs={12} lg={6}>
      <ChartPanel title="Daily Active Users">
        <LineChart data={statistics?.daily_active_users || []}>
          <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><ChartTooltip /><Line type="monotone" dataKey="value" stroke="#1565c0" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartPanel>
    </Grid>
    <Grid item xs={12} lg={6}>
      <ChartPanel title="Mood Trends">
        <LineChart data={statistics?.mood_trends || []}>
          <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><ChartTooltip /><Legend /><Line type="monotone" dataKey="mood" stroke="#2e7d32" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="stress" stroke="#ed6c02" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartPanel>
    </Grid>
    <Grid item xs={12} md={6}>
      <ChartPanel title="Fusion Distribution">
        <PieChart>
          <Pie data={statistics?.fusion_distribution || []} dataKey="value" nameKey="risk_level" outerRadius={100} label>
            {(statistics?.fusion_distribution || []).map((entry, index) => <Cell key={entry.risk_level} fill={riskColors[index % riskColors.length]} />)}
          </Pie>
          <ChartTooltip /><Legend />
        </PieChart>
      </ChartPanel>
    </Grid>
    <Grid item xs={12} md={6}>
      <ChartPanel title="Support Requests">
        <BarChart data={statistics?.support_requests || []}>
          <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><ChartTooltip /><Bar dataKey="value" fill="#6d4c41" />
        </BarChart>
      </ChartPanel>
    </Grid>
  </Grid>
);

const ReportsView = ({ reports, reportTypes, onCreate, onAction }) => (
  <Paper sx={{ p: 2, borderRadius: 1.5 }}>
    <ToolbarTitle title="Reports">
      <Button startIcon={<AssessmentIcon />} variant="contained" onClick={onCreate}>Generate</Button>
    </ToolbarTitle>
    <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
      {reportTypes.map((type) => <Chip key={type} label={type.replaceAll('_', ' ')} />)}
    </Stack>
    <CompactTable headers={['Title', 'Type', 'Status', 'Exports', 'Created', 'Actions']}>
      {reports.map((report) => (
        <TableRow key={report.id} hover>
          <TableCell>{report.title}</TableCell>
          <TableCell>{report.report_type}</TableCell>
          <TableCell><StatusChip value={report.status} /></TableCell>
          <TableCell>{(report.export_formats || []).join(', ')}</TableCell>
          <TableCell>{dateFmt(report.created_at)}</TableCell>
          <TableCell><Tooltip title="Download CSV"><IconButton size="small" onClick={() => onAction(() => adminService.exportReport(report.id, 'csv'))}><DownloadIcon fontSize="small" /></IconButton></Tooltip></TableCell>
        </TableRow>
      ))}
    </CompactTable>
  </Paper>
);

const AuditView = ({ audit, onAction }) => (
  <Paper sx={{ p: 2, borderRadius: 1.5 }}>
    <ToolbarTitle title="Audit Logs">
      <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => onAction(() => adminService.exportAudit())}>Export</Button>
    </ToolbarTitle>
    <CompactTable headers={['Timestamp', 'User', 'Action', 'Entity', 'Old Value', 'New Value', 'IP', 'Status']}>
      {audit.map((item, index) => (
        <TableRow key={`${item.timestamp}-${index}`} hover>
          <TableCell>{dateFmt(item.timestamp)}</TableCell>
          <TableCell>{fmt(item.user)}</TableCell>
          <TableCell>{item.action}</TableCell>
          <TableCell>{item.entity}</TableCell>
          <TableCell sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.old_value ? 'Recorded' : 'N/A'}</TableCell>
          <TableCell sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.new_value ? 'Recorded' : 'N/A'}</TableCell>
          <TableCell>{fmt(item.ip)}</TableCell>
          <TableCell><StatusChip value={item.status} /></TableCell>
        </TableRow>
      ))}
    </CompactTable>
  </Paper>
);

const SettingsView = ({ settings, onAction }) => (
  <Stack gap={2}>
    {Object.entries(settings).map(([section, items]) => (
      <Paper key={section} sx={{ p: 2, borderRadius: 1.5 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 800 }}>{section.replaceAll('_', ' ')}</Typography>
        <CompactTable headers={['Setting', 'Value', 'Read Only', 'Updated', 'Actions']}>
          {items.map((setting) => (
            <TableRow key={setting.id} hover>
              <TableCell>{setting.key}</TableCell>
              <TableCell>{typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value)}</TableCell>
              <TableCell>{setting.read_only ? 'Yes' : 'No'}</TableCell>
              <TableCell>{dateFmt(setting.updated_at)}</TableCell>
              <TableCell>
                <Tooltip title="Toggle boolean">
                  <span>
                    <IconButton size="small" disabled={setting.read_only || typeof setting.value !== 'boolean'} onClick={() => onAction(() => adminService.updateSetting(setting.id, { setting_value: !setting.value }))}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </CompactTable>
      </Paper>
    ))}
  </Stack>
);

const CompactTable = ({ headers, children }) => (
  <TableContainer sx={{ overflowX: 'auto' }}>
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>{headers.map((header) => <TableCell key={header} sx={{ fontWeight: 800, bgcolor: '#eef3f8' }}>{header}</TableCell>)}</TableRow>
      </TableHead>
      <TableBody>{children}</TableBody>
    </Table>
  </TableContainer>
);

const ChartPanel = ({ title, children }) => (
  <Paper sx={{ p: 2, borderRadius: 1.5, height: 360 }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>{title}</Typography>
    <ResponsiveContainer width="100%" height="82%">{children}</ResponsiveContainer>
  </Paper>
);

const StatusChip = ({ value }) => {
  const normalized = String(value || 'unknown').toLowerCase();
  const color = normalized.includes('active') || normalized.includes('success') || normalized.includes('approved') || normalized.includes('generated') ? 'success' : normalized.includes('suspend') || normalized.includes('failed') || normalized.includes('deleted') ? 'error' : 'default';
  return <Chip size="small" color={color} label={String(value || 'unknown')} />;
};

const AdminDialog = ({ dialog, editing, form, setForm, universities, reportTypes, onClose, onSubmit }) => (
  <Dialog open={!!dialog} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{dialog ? `${editing ? 'Edit' : 'Create'} ${dialog}` : ''}</DialogTitle>
    <DialogContent sx={{ pt: 2 }}>
      {dialog === 'user' && (
        <Stack gap={2} sx={{ mt: 1 }}>
          <TextField label="Full name" value={form.user.full_name} onChange={(event) => setForm({ ...form, user: { ...form.user, full_name: event.target.value } })} />
          <TextField label="Username" value={form.user.username} onChange={(event) => setForm({ ...form, user: { ...form.user, username: event.target.value } })} />
          <TextField label="Email" value={form.user.email} onChange={(event) => setForm({ ...form, user: { ...form.user, email: event.target.value } })} />
          <TextField label="Password" type="password" value={form.user.password} onChange={(event) => setForm({ ...form, user: { ...form.user, password: event.target.value } })} />
          <FormControl><InputLabel>Role</InputLabel><Select label="Role" value={form.user.role} onChange={(event) => setForm({ ...form, user: { ...form.user, role: event.target.value } })}><MenuItem value="student">Student</MenuItem><MenuItem value="counselor">Counselor</MenuItem><MenuItem value="admin">Administrator</MenuItem></Select></FormControl>
          <FormControl><InputLabel>University</InputLabel><Select label="University" value={form.user.university_id} onChange={(event) => setForm({ ...form, user: { ...form.user, university_id: event.target.value } })}><MenuItem value="">None</MenuItem>{universities.map((uni) => <MenuItem key={uni.id} value={uni.id}>{uni.university}</MenuItem>)}</Select></FormControl>
        </Stack>
      )}
      {dialog === 'university' && (
        <Stack gap={2} sx={{ mt: 1 }}>
          <TextField label="University" value={form.university.university_name} onChange={(event) => setForm({ ...form, university: { ...form.university, university_name: event.target.value } })} />
          <TextField label="Code" disabled={!!editing} value={form.university.university_code} onChange={(event) => setForm({ ...form, university: { ...form.university, university_code: event.target.value } })} />
          <TextField label="Campus" value={form.university.campus_name} onChange={(event) => setForm({ ...form, university: { ...form.university, campus_name: event.target.value } })} />
          <TextField label="District" value={form.university.district} onChange={(event) => setForm({ ...form, university: { ...form.university, district: event.target.value } })} />
          <TextField label="Counseling unit phone" value={form.university.counseling_unit_phone} onChange={(event) => setForm({ ...form, university: { ...form.university, counseling_unit_phone: event.target.value } })} />
        </Stack>
      )}
      {dialog === 'counselor' && (
        <Stack gap={2} sx={{ mt: 1 }}>
          <TextField label="Full name" value={form.counselor.full_name} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, full_name: event.target.value } })} />
          <TextField label="Username" disabled={!!editing} value={form.counselor.username} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, username: event.target.value } })} />
          <TextField label="Email" value={form.counselor.email} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, email: event.target.value } })} />
          {!editing && (
            <TextField label="Password" type="password" value={form.counselor.password} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, password: event.target.value } })} />
          )}
          <FormControl>
            <InputLabel>University</InputLabel>
            <Select label="University" value={form.counselor.university_id} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, university_id: event.target.value } })}>
              <MenuItem value="">None</MenuItem>
              {universities.map((uni) => <MenuItem key={uni.id} value={uni.id}>{uni.university}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Qualification" value={form.counselor.qualification} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, qualification: event.target.value } })} />
          <TextField label="Specialization" value={form.counselor.specialization} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, specialization: event.target.value } })} />
          <TextField label="Phone" value={form.counselor.telephone_number} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, telephone_number: event.target.value } })} />
          <TextField label="WhatsApp" value={form.counselor.whatsapp_number} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, whatsapp_number: event.target.value } })} />
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <TextField fullWidth label="Available days" value={form.counselor.available_days} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, available_days: event.target.value } })} />
            <TextField fullWidth label="From" value={form.counselor.available_from} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, available_from: event.target.value } })} />
            <TextField fullWidth label="Until" value={form.counselor.available_until} onChange={(event) => setForm({ ...form, counselor: { ...form.counselor, available_until: event.target.value } })} />
          </Stack>
        </Stack>
      )}
      {dialog === 'resource' && (
        <Stack gap={2} sx={{ mt: 1 }}>
          <TextField label="Title" value={form.resource.title} onChange={(event) => setForm({ ...form, resource: { ...form.resource, title: event.target.value } })} />
          <TextField label="Category" value={form.resource.category} onChange={(event) => setForm({ ...form, resource: { ...form.resource, category: event.target.value } })} />
          <FormControl><InputLabel>Type</InputLabel><Select label="Type" value={form.resource.resource_type} onChange={(event) => setForm({ ...form, resource: { ...form.resource, resource_type: event.target.value } })}>{['article', 'video', 'meditation', 'breathing', 'animation', 'audio', 'exercise', 'game'].map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}</Select></FormControl>
          <TextField label="URL" value={form.resource.url} onChange={(event) => setForm({ ...form, resource: { ...form.resource, url: event.target.value } })} />
          <TextField label="Description" multiline rows={3} value={form.resource.description} onChange={(event) => setForm({ ...form, resource: { ...form.resource, description: event.target.value } })} />
        </Stack>
      )}
      {dialog === 'report' && (
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Report type</InputLabel>
          <Select label="Report type" value={form.report.report_type} onChange={(event) => setForm({ ...form, report: { report_type: event.target.value } })}>
            {(reportTypes.length ? reportTypes : ['usage_summary']).map((type) => <MenuItem key={type} value={type}>{type.replaceAll('_', ' ')}</MenuItem>)}
          </Select>
        </FormControl>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={onSubmit}>Save</Button>
    </DialogActions>
  </Dialog>
);

export default AdminPortal;
