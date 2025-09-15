import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin, Send, Mic, Clock, CheckCircle, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CameraCapture from "./CameraCapture";
import InteractiveMap from "./InteractiveMap";
import { useReports } from "@/hooks/useReports";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

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
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [generatedComplaint, setGeneratedComplaint] = useState("");
  const [editingComplaint, setEditingComplaint] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  
  const { reports, loading, createReport } = useReports();
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Auto-request location on component mount
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Get address from coordinates (reverse geocoding)
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=your-mapbox-token-here`
            );
            const data = await response.json();
            const address = data.features[0]?.place_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            setLocation({ lat: latitude, lng: longitude, address });
            toast({
              title: "Location captured",
              description: "Your location has been recorded for the report."
            });
          } catch (error) {
            setLocation({ 
              lat: latitude, 
              lng: longitude, 
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
            });
          }
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

  const handleImageCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    // Simulate AI processing for description
    setTimeout(() => {
      const descriptions = [
        "Detected damaged road surface with visible cracks and debris. The road condition appears unsafe for vehicles and may cause damage. Immediate repair is recommended to ensure public safety.",
        "Broken streetlight observed, compromising pedestrian and vehicle safety. The lighting infrastructure requires immediate attention to restore proper illumination.",
        "Blocked drainage system causing water accumulation. This could lead to flooding and structural damage during heavy rainfall.",
        "Damaged sidewalk with uneven surfaces creating accessibility issues for pedestrians, especially those with mobility challenges.",
        "Graffiti vandalism detected on public property. Surface restoration and protective measures may be required."
      ];
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      setGeneratedComplaint(randomDescription);
      
      // Auto-generate title based on description
      const titleKeywords = randomDescription.split(' ').slice(0, 4).join(' ');
      setReportTitle(titleKeywords);
    }, 2000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak to describe the issue you're reporting."
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Voice description has been captured."
      });
    }
  };

  const submitComplaint = async () => {
    if (!generatedComplaint.trim() || !reportTitle.trim() || !selectedCategory) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createReport({
        title: reportTitle,
        description: editingComplaint || generatedComplaint,
        category: selectedCategory,
        location_address: location?.address,
        location_lat: location?.lat,
        location_lng: location?.lng,
        original_image_url: capturedImage || undefined,
        audio_description_url: audioUrl || undefined,
        priority: selectedCategory === 'Emergency Services' ? 'high' : 'medium'
      });
      
      // Reset form
      setCapturedImage(null);
      setGeneratedComplaint("");
      setEditingComplaint("");
      setReportTitle("");
      setSelectedCategory("");
      setAudioUrl(null);
      setShowCamera(false);
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
                      Location: {location.address}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Issue Category *</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public Works">Public Works</SelectItem>
                      <SelectItem value="Sanitation">Sanitation</SelectItem>
                      <SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Environmental">Environmental</SelectItem>
                      <SelectItem value="Emergency Services">Emergency Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => setShowCamera(true)}
                    variant="gradient"
                    size="lg"
                    disabled={!location || !selectedCategory}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>

                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="lg"
                    disabled={!location}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isRecording ? "Stop" : "Record"}
                  </Button>
                </div>

                {audioUrl && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-foreground mb-2">Voice description recorded:</p>
                    <audio controls className="w-full">
                      <source src={audioUrl} type="audio/wav" />
                    </audio>
                  </div>
                )}

                {capturedImage && (
                  <div className="space-y-4">
                    <img 
                      src={capturedImage} 
                      alt="Captured complaint" 
                      className="w-full h-48 object-cover rounded-lg shadow-soft"
                    />
                    
                    {generatedComplaint && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Report Title *</Label>
                          <input
                            type="text"
                            value={reportTitle}
                            onChange={(e) => setReportTitle(e.target.value)}
                            placeholder="Brief title for your report"
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        
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
                            disabled={!reportTitle.trim() || !selectedCategory}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit Report
                          </Button>
                          <Button 
                            onClick={() => {
                              setCapturedImage(null);
                              setGeneratedComplaint("");
                              setEditingComplaint("");
                              setReportTitle("");
                              setAudioUrl(null);
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

          {/* My Reports & Map */}
          <div className="space-y-6">
            {/* Interactive Map */}
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
              center={location ? [location.lng, location.lat] : undefined}
            />

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>My Reports</CardTitle>
                <CardDescription>
                  Track the status of your submitted reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading reports...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.filter(r => r.user_id === user?.id).map((report) => (
                      <div key={report.id} className="p-4 border border-border rounded-lg hover:shadow-soft transition-all duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-2">
                            <Badge variant={getStatusColor(report.status)} className="flex items-center gap-1">
                              {getStatusIcon(report.status)}
                              {report.status.replace('-', ' ')}
                            </Badge>
                            <Badge variant="outline">{report.category}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-foreground mb-2">{report.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                        
                        {report.location_address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                            <MapPin className="w-3 h-3" />
                            {report.location_address}
                          </p>
                        )}

                        {report.completion_image_url && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-success mb-2">Resolution Image:</p>
                            <img 
                              src={report.completion_image_url} 
                              alt="Resolution" 
                              className="w-full h-32 object-cover rounded-lg shadow-soft"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {reports.filter(r => r.user_id === user?.id).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No reports submitted yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Capture Issue Photo</DialogTitle>
          </DialogHeader>
          <CameraCapture 
            onCapture={handleImageCapture}
            onClose={() => setShowCamera(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}