import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Upload, 
  Eye,
  MessageSquare,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      description: 'Pothole on Main Street causing vehicle damage. Multiple vehicles have reported tire damage.',
      status: 'pending',
      createdAt: '2024-01-15',
      location: 'Main Street, Block A',
      userName: 'John Smith',
      userEmail: 'john@example.com',
      priority: 'high',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      description: 'Broken streetlight compromising safety in residential area',
      status: 'in-progress',
      createdAt: '2024-01-16',
      location: 'Oak Avenue, Near Park',
      userName: 'Sarah Johnson',
      userEmail: 'sarah@example.com',
      priority: 'medium'
    },
    {
      id: '3',
      description: 'Damaged sidewalk creating accessibility issues',
      status: 'resolved',
      createdAt: '2024-01-14',
      location: 'Elm Street, Downtown',
      userName: 'Mike Wilson',
      userEmail: 'mike@example.com',
      priority: 'low',
      resolvedImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    }
  ]);

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionImage, setResolutionImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const updateComplaintStatus = (complaintId: string, newStatus: Complaint['status']) => {
    setComplaints(prev => 
      prev.map(complaint => 
        complaint.id === complaintId 
          ? { ...complaint, status: newStatus }
          : complaint
      )
    );

    const statusMessages = {
      'in-progress': 'Complaint marked as in progress',
      'resolved': 'Complaint marked as resolved',
      'pending': 'Complaint marked as pending'
    };

    toast({
      title: "Status Updated",
      description: statusMessages[newStatus]
    });
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

  const submitResolution = () => {
    if (!selectedComplaint) return;

    setComplaints(prev => 
      prev.map(complaint => 
        complaint.id === selectedComplaint.id 
          ? { 
              ...complaint, 
              status: 'resolved',
              resolvedImage: resolutionImage || undefined
            }
          : complaint
      )
    );

    toast({
      title: "Resolution Submitted",
      description: "The complaint has been marked as resolved with the uploaded evidence."
    });

    // Reset form
    setSelectedComplaint(null);
    setResolutionNotes("");
    setResolutionImage(null);
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

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in-progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Complaints List */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>All Complaints</CardTitle>
            <CardDescription>
              Manage and track complaint resolutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="p-6 border border-border rounded-lg hover:shadow-soft transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      <Badge variant={getStatusColor(complaint.status)} className="flex items-center gap-1">
                        {getStatusIcon(complaint.status)}
                        {complaint.status.replace('-', ' ')}
                      </Badge>
                      <Badge variant={getPriorityColor(complaint.priority)}>
                        {complaint.priority} priority
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {complaint.createdAt}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Complaint Details</h4>
                      <p className="text-sm text-foreground mb-3">{complaint.description}</p>
                      
                      {complaint.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3" />
                          {complaint.location}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground">
                        <p>Reported by: {complaint.userName}</p>
                        <p>Email: {complaint.userEmail}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {complaint.image && (
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-2">Complaint Image</h5>
                          <img 
                            src={complaint.image} 
                            alt="Complaint" 
                            className="w-full h-32 object-cover rounded-lg shadow-soft"
                          />
                        </div>
                      )}

                      {complaint.resolvedImage && (
                        <div>
                          <h5 className="text-sm font-medium text-success mb-2">Resolution Image</h5>
                          <img 
                            src={complaint.resolvedImage} 
                            alt="Resolution" 
                            className="w-full h-32 object-cover rounded-lg shadow-soft"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {complaint.status === 'pending' && (
                      <Button 
                        onClick={() => updateComplaintStatus(complaint.id, 'in-progress')}
                        variant="default"
                        size="sm"
                      >
                        Start Working
                      </Button>
                    )}
                    
                    {complaint.status === 'in-progress' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            onClick={() => setSelectedComplaint(complaint)}
                            variant="success"
                            size="sm"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Mark Resolved
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Mark Complaint as Resolved</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Complaint:</p>
                              <p className="text-sm text-foreground">{complaint.description}</p>
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

                    {complaint.status === 'resolved' && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}