import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  MapPin
} from 'lucide-react';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];

const mockData = {
  reportsByDepartment: [
    { name: 'Public Works', value: 45, color: '#ef4444' },
    { name: 'Sanitation', value: 32, color: '#f59e0b' },
    { name: 'Parks & Rec', value: 28, color: '#22c55e' },
    { name: 'Transportation', value: 19, color: '#3b82f6' },
  ],
  weeklyTrends: [
    { day: 'Mon', reports: 12, resolved: 8 },
    { day: 'Tue', reports: 19, resolved: 13 },
    { day: 'Wed', reports: 15, resolved: 11 },
    { day: 'Thu', reports: 22, resolved: 16 },
    { day: 'Fri', reports: 18, resolved: 14 },
    { day: 'Sat', reports: 8, resolved: 6 },
    { day: 'Sun', reports: 6, resolved: 4 },
  ],
  responseTime: [
    { timeFrame: 'Same Day', percentage: 25 },
    { timeFrame: '1-2 Days', percentage: 45 },
    { timeFrame: '3-5 Days', percentage: 20 },
    { timeFrame: '1+ Week', percentage: 10 },
  ]
};

export default function AnalyticsDashboard() {
  const totalReports = 124;
  const resolvedReports = 89;
  const avgResponseTime = 2.3;
  const activeUsers = 1256;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                <p className="text-3xl font-bold text-foreground">{totalReports}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last week
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold text-foreground">{resolvedReports}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((resolvedReports / totalReports) * 100)}% resolution rate
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className="text-3xl font-bold text-foreground">{avgResponseTime}d</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  -8% improvement
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold text-foreground">{activeUsers}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Users className="w-3 h-3 mr-1" />
                  +156 this month
                </p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Report Trends</CardTitle>
            <CardDescription>
              Reports submitted vs resolved over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reports" fill="#ef4444" name="Reports" />
                <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Reports by Department</CardTitle>
            <CardDescription>
              Distribution of reports across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.reportsByDepartment}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.reportsByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Distribution</CardTitle>
          <CardDescription>
            How quickly reports are being addressed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {mockData.responseTime.map((item, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-foreground">{item.percentage}%</p>
                <p className="text-sm text-muted-foreground">{item.timeFrame}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            High-Activity Areas
          </CardTitle>
          <CardDescription>
            Locations with the most reported issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { location: 'Downtown Main Street', reports: 23, trend: 'up' },
              { location: 'City Park Area', reports: 18, trend: 'down' },
              { location: 'Industrial District', reports: 15, trend: 'up' },
              { location: 'Residential Zone A', reports: 12, trend: 'stable' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{item.location}</p>
                  <p className="text-sm text-muted-foreground">{item.reports} reports this week</p>
                </div>
                <Badge variant={item.trend === 'up' ? 'destructive' : item.trend === 'down' ? 'success' : 'secondary'}>
                  {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} {item.trend}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}