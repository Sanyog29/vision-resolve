import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, MapPin, Send, Edit3, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserDashboardProps {
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
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("");
  const [generatedComplaint, setGeneratedComplaint] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      description: 'Pothole on Main Street causing vehicle damage',
      status: 'resolved',
      createdAt: '2024-01-15',
      location: 'Main Street, Block A',
      resolvedImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    },
    {
      id: '2', 
      description: 'Broken streetlight compromising safety',
      status: 'in-progress',
      createdAt: '2024-01-16',
      location: 'Oak Avenue, Near Park'
    }
  ]);
  const [editingComplaint, setEditingComplaint] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast({
            title: "Location captured",
            description: "Your location has been recorded for the complaint."
          });
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Please enable location access to continue.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setCapturedImage(imageUrl);
        // Simulate AI processing
        setTimeout(() => {
          setGeneratedComplaint("Detected damaged road surface with visible cracks and debris. The road condition appears unsafe for vehicles and may cause damage. Immediate repair is recommended to ensure public safety.");
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitComplaint = () => {
    if (!generatedComplaint.trim()) return;

    const newComplaint: Complaint = {
      id: Date.now().toString(),
      description: editingComplaint || generatedComplaint,
      status: 'pending',
      image: capturedImage || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      location: location || "Location not available"
    };

    setComplaints(prev => [newComplaint, ...prev]);
    
    // Reset form
    setCapturedImage(null);
    setGeneratedComplaint("");
    setEditingComplaint("");
    setLocation("");
    setShowCamera(false);

    toast({
      title: "Complaint submitted",
      description: "Your complaint has been sent to the relevant department."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in-progress': return 'default';
      case 'resolved': return 'success';
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-surface" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ComplaintFlow</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.name || user.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit New Complaint */}
          <div className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Submit New Complaint
                </CardTitle>
                <CardDescription>
                  Capture an image and let AI generate your complaint description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!location && (
                  <Button 
                    onClick={requestLocation} 
                    variant="outline" 
                    className="w-full"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Enable Location Access
                  </Button>
                )}

                {location && (
                  <div className="p-3 bg-secondary-light rounded-lg">
                    <p className="text-sm text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-secondary" />
                      Location captured: {location}
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                  className="hidden"
                />

                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  disabled={!location}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Image
                </Button>

                {capturedImage && (
                  <div className="space-y-4">
                    <img 
                      src={capturedImage} 
                      alt="Captured complaint" 
                      className="w-full h-48 object-cover rounded-lg shadow-soft"
                    />
                    
                    {generatedComplaint && (
                      <div className="space-y-3">
                        <Label>AI Generated Description:</Label>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm text-foreground">{generatedComplaint}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Edit Description (Optional):</Label>
                          <Textarea
                            value={editingComplaint}
                            onChange={(e) => setEditingComplaint(e.target.value)}
                            placeholder="Edit the AI generated description if needed..."
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            onClick={submitComplaint}
                            variant="accent"
                            className="flex-1"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit Complaint
                          </Button>
                          <Button 
                            onClick={() => {
                              setCapturedImage(null);
                              setGeneratedComplaint("");
                              setEditingComplaint("");
                            }}
                            variant="outline"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* My Complaints */}
          <div className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>My Complaints</CardTitle>
                <CardDescription>
                  Track the status of your submitted complaints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div key={complaint.id} className="p-4 border border-border rounded-lg hover:shadow-soft transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant={getStatusColor(complaint.status)} className="flex items-center gap-1">
                          {getStatusIcon(complaint.status)}
                          {complaint.status.replace('-', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{complaint.createdAt}</span>
                      </div>
                      
                      <p className="text-sm text-foreground mb-2">{complaint.description}</p>
                      
                      {complaint.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                          <MapPin className="w-3 h-3" />
                          {complaint.location}
                        </p>
                      )}

                      {complaint.resolvedImage && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-success mb-2">Resolution Image:</p>
                          <img 
                            src={complaint.resolvedImage} 
                            alt="Resolution" 
                            className="w-full h-32 object-cover rounded-lg shadow-soft"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}