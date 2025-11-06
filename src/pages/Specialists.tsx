import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Star, Navigation, Heart, LogOut, User } from "lucide-react";

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  city: string;
  address: string;
  phone: string;
  email: string | null;
  latitude: number;
  longitude: number;
  experience_years: number | null;
  consultation_fee: number | null;
  available_days: string[] | null;
  rating: number | null;
  distance?: number;
}

const Specialists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const cities = ["Delhi", "Mumbai", "Jaipur", "Lucknow", "Patna"];
  const specialties = ["General Physician", "Pediatrician", "Cardiologist", "Dermatologist", "Orthopedic", "Gynecologist", "ENT Specialist", "Psychiatrist", "Dentist", "Ophthalmologist"];

  useEffect(() => {
    checkAuth();
    fetchSpecialists();
  }, []);

  useEffect(() => {
    filterSpecialists();
  }, [specialists, selectedCity, selectedSpecialty, searchQuery, userLocation]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchSpecialists = async () => {
    try {
      const { data, error } = await supabase
        .from("specialists")
        .select("*")
        .order("name");

      if (error) throw error;
      setSpecialists(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load specialists",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast({
            title: "Location found",
            description: "Showing specialists near you",
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get your location. Please select a city instead.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const filterSpecialists = () => {
    let filtered = [...specialists];

    if (selectedCity !== "all") {
      filtered = filtered.filter(s => s.city === selectedCity);
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(s => s.specialty === selectedSpecialty);
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (userLocation) {
      filtered = filtered.map(s => ({
        ...s,
        distance: calculateDistance(userLocation.lat, userLocation.lng, s.latitude, s.longitude)
      }));
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredSpecialists(filtered);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-soft">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HealthVia</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Healthcare Specialists</h1>
          <p className="text-muted-foreground">Discover trusted healthcare professionals near you</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Search</label>
            <Input
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">City</label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Specialty</label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Location</label>
            <Button
              variant="outline"
              onClick={getUserLocation}
              className="w-full justify-start"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Use my location
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading specialists...</div>
        ) : filteredSpecialists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No specialists found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSpecialists.map((specialist) => (
              <Card key={specialist.id} className="shadow-soft hover:shadow-hover transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{specialist.name}</CardTitle>
                      <CardDescription>{specialist.specialty}</CardDescription>
                    </div>
                    {specialist.rating && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {specialist.rating}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{specialist.city}</p>
                      <p className="text-muted-foreground">{specialist.address}</p>
                    </div>
                  </div>

                  {specialist.distance && (
                    <div className="text-sm text-primary font-medium">
                      📍 {specialist.distance.toFixed(1)} km away
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${specialist.phone}`} className="hover:underline">
                      {specialist.phone}
                    </a>
                  </div>

                  {specialist.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${specialist.email}`} className="hover:underline">
                        {specialist.email}
                      </a>
                    </div>
                  )}

                  <div className="pt-3 border-t space-y-2">
                    {specialist.experience_years && (
                      <p className="text-sm">
                        <span className="font-medium">Experience:</span> {specialist.experience_years} years
                      </p>
                    )}
                    {specialist.consultation_fee && (
                      <p className="text-sm">
                        <span className="font-medium">Fee:</span> ₹{specialist.consultation_fee}
                      </p>
                    )}
                    {specialist.available_days && specialist.available_days.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {specialist.available_days.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Specialists;
