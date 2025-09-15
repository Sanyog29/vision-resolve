import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Upload, 
  BarChart3,
  Calendar,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReports } from "@/hooks/useReports";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import InteractiveMap from "./InteractiveMap";
import AnalyticsDashboard from "./AnalyticsDashboard";

interface EmployeeDashboardProps {
  user: any;
  onLogout: () => void;
}

interface Complaint {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  image?: string;
  resolvedImage?: string;
  createdAt: string;
  location?: string;
  userName: string;
  userEmail: string;
  priority: 'low' | 'medium' | 'high';
}

export default function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionImage, setResolutionImage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  const { reports, loading, updateReportStatus, assignReport } = useReports();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const updateComplaintStatus = async (reportId: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
    try {
      await updateReportStatus(reportId, newStatus, {
        assigned_employee_id: user?.id
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleResolutionImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setResolutionImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitResolution = async () => {
    if (!selectedComplaint) return;

    try {
      await updateReportStatus(selectedComplaint.id, 'resolved', {
        completion_image_url: resolutionImage || undefined,
        resolution_notes: resolutionNotes,
        assigned_employee_id: user?.id
      });

      // Reset form
      setSelectedComplaint(null);
      setResolutionNotes("");
      setResolutionImage(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in-progress': return 'default';
      case 'resolved': return 'success';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const inProgressCount = reports.filter(r => r.status === 'in-progress').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  const filteredReports = reports.filter(report => {
    if (statusFilter !== "all" && report.status !== statusFilter) return false;
    if (priorityFilter !== "all" && report.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-surface" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Employee Dashboard</h1>
                <p className="text-sm text-muted-foreground">Managing complaints - {user.name || user.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-medium">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-3xl font-bold text-warning">{pendingCount}</p>
                    </div>
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                      <p className="text-3xl font-bold text-primary">{inProgressCount}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                      <p className="text-3xl font-bold text-success">{resolvedCount}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reports Quick View */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Recent High Priority Reports</CardTitle>
                <CardDescription>
                  Reports requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.filter(r => r.priority === 'high' && r.status !== 'resolved').slice(0, 3).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{report.title}</p>
                        <p className="text-xs text-muted-foreground">{report.category} • {report.location_address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(report.priority)}>{report.priority}</Badge>
                        <Button size="sm" onClick={() => updateComplaintStatus(report.id, 'in-progress')}>
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </CardContent>
            </Card>

            {/* Reports List */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>All Reports ({filteredReports.length})</CardTitle>
                <CardDescription>
                  Manage and track report resolutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading reports...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReports.map((report) => (
                      <div key={report.id} className="p-6 border border-border rounded-lg hover:shadow-soft transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-2">
                            <Badge variant={getStatusColor(report.status)} className="flex items-center gap-1">
                              {getStatusIcon(report.status)}
                              {report.status.replace('-', ' ')}
                            </Badge>
                            <Badge variant={getPriorityColor(report.priority)}>
                              {report.priority} priority
                            </Badge>
                            <Badge variant="outline">{report.category}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-foreground mb-2">{report.title}</h4>
                            <p className="text-sm text-foreground mb-3">{report.description}</p>
                            
                            {report.location_address && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                                <MapPin className="w-3 h-3" />
                                {report.location_address}
                              </p>
                            )}

                            <div className="text-xs text-muted-foreground">
                              <p>Report ID: {report.id.slice(0, 8)}...</p>
                              <p>Department: {report.department || 'Unassigned'}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {report.original_image_url && (
                              <div>
                                <h5 className="text-sm font-medium text-foreground mb-2">Report Image</h5>
                                <img 
                                  src={report.original_image_url} 
                                  alt="Report" 
                                  className="w-full h-32 object-cover rounded-lg shadow-soft"
                                />
                              </div>
                            )}

                            {report.completion_image_url && (
                              <div>
                                <h5 className="text-sm font-medium text-success mb-2">Resolution Image</h5>
                                <img 
                                  src={report.completion_image_url} 
                                  alt="Resolution" 
                                  className="w-full h-32 object-cover rounded-lg shadow-soft"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {report.status === 'pending' && (
                            <Button 
                              onClick={() => updateComplaintStatus(report.id, 'in-progress')}
                              variant="default"
                              size="sm"
                            >
                              Start Working
                            </Button>
                          )}
                          
                          {report.status === 'in-progress' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  onClick={() => setSelectedComplaint(report as any)}
                                  variant="success"
                                  size="sm"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Mark Resolved
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Mark Report as Resolved</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Report:</p>
                                    <p className="text-sm text-foreground">{report.description}</p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Resolution Notes</Label>
                                    <Textarea
                                      value={resolutionNotes}
                                      onChange={(e) => setResolutionNotes(e.target.value)}
                                      placeholder="Describe how the issue was resolved..."
                                    />
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                      Upload Resolution Image
                                    </label>
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/*"
                                      onChange={handleResolutionImageUpload}
                                      className="hidden"
                                    />
                                    <Button 
                                      onClick={() => fileInputRef.current?.click()}
                                      variant="outline"
                                      className="w-full"
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Choose Image
                                    </Button>
                                  </div>

                                  {resolutionImage && (
                                    <div>
                                      <p className="text-sm font-medium text-foreground mb-2">Preview:</p>
                                      <img 
                                        src={resolutionImage} 
                                        alt="Resolution preview" 
                                        className="w-full h-48 object-cover rounded-lg shadow-soft"
                                      />
                                    </div>
                                  )}

                                  <div className="flex gap-3">
                                    <Button 
                                      onClick={submitResolution}
                                      variant="success"
                                      className="flex-1"
                                      disabled={!resolutionImage}
                                    >
                                      Submit Resolution
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        setSelectedComplaint(null);
                                        setResolutionImage(null);
                                        setResolutionNotes("");
                                      }}
                                      variant="outline"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {report.status === 'resolved' && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {filteredReports.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No reports match the current filters.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <InteractiveMap 
              reports={reports.map(r => ({
                id: r.id,
                lat: r.location_lat || 40.7128,
                lng: r.location_lng || -74.0060,
                title: r.title,
                status: r.status,
                priority: r.priority,
                category: r.category,
                createdAt: r.created_at
              }))}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}