import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MapPin, Users, Shield, ArrowRight, Stethoscope, Clock, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/specialists");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJWMTZoMnYxOHptMCAwdjE2aC0yVjM0aDJ6TTIwIDM0di0yaDE2djJIMjB6bTAgMGgxNnYySDIwdi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-8 shadow-soft">
              <Heart className="h-10 w-10" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Find Trusted Healthcare Specialists Near You
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              Access quality healthcare in rural and urban areas with location-based search and verified specialists
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-white text-primary hover:bg-white/90 shadow-hover text-lg px-8"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/specialists")}
                className="border-white text-white hover:bg-white/10 text-lg px-8"
              >
                Browse Specialists
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose HealthVia?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We make finding quality healthcare simple, accessible, and reliable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-soft hover:shadow-hover transition-all duration-300 border-2 hover:border-primary">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Location-Based Search</CardTitle>
                <CardDescription>
                  Find specialists near you with real-time distance calculations and city-based filtering
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-hover transition-all duration-300 border-2 hover:border-primary">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Multiple Specialties</CardTitle>
                <CardDescription>
                  Access a wide range of healthcare specialists from general physicians to specialized doctors
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-hover transition-all duration-300 border-2 hover:border-primary">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Verified Professionals</CardTitle>
                <CardDescription>
                  All specialists are verified with complete credentials, ratings, and contact information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-hover transition-all duration-300 border-2 hover:border-primary">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>User Profiles</CardTitle>
                <CardDescription>
                  Create your account to save favorites, track appointments, and manage your healthcare journey
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-hover transition-all duration-300 border-2 hover:border-primary">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Availability Info</CardTitle>
                <CardDescription>
                  See specialist availability, consultation fees, and book appointments at your convenience
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-hover transition-all duration-300 border-2 hover:border-primary">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Ratings & Reviews</CardTitle>
                <CardDescription>
                  Make informed decisions with specialist ratings and patient reviews for quality assurance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Healthcare Specialist?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of patients who trust HealthVia for their healthcare needs
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-primary hover:bg-white/90 shadow-hover text-lg px-8"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold">HealthVia</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 HealthVia. Bringing accessible healthcare to everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
