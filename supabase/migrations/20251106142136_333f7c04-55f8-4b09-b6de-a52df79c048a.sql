-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create specialists table
CREATE TABLE public.specialists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  experience_years INTEGER,
  consultation_fee INTEGER,
  available_days TEXT[],
  rating DECIMAL(2, 1) DEFAULT 4.5,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;

-- Trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_specialists_updated_at
  BEFORE UPDATE ON public.specialists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for specialists (public read)
CREATE POLICY "Anyone can view specialists"
  ON public.specialists FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can insert specialists"
  ON public.specialists FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update specialists"
  ON public.specialists FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete specialists"
  ON public.specialists FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample specialists data
INSERT INTO public.specialists (name, specialty, city, address, phone, email, latitude, longitude, experience_years, consultation_fee, available_days) VALUES
('Dr. Rajesh Kumar', 'General Physician', 'Delhi', 'Sector 12, Dwarka, New Delhi', '+91-9876543210', 'rajesh.kumar@example.com', 28.5921, 77.0460, 15, 500, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Friday']),
('Dr. Priya Sharma', 'Pediatrician', 'Mumbai', 'Andheri West, Mumbai', '+91-9876543211', 'priya.sharma@example.com', 19.1136, 72.8697, 12, 600, ARRAY['Monday', 'Wednesday', 'Thursday', 'Saturday']),
('Dr. Amit Verma', 'Cardiologist', 'Jaipur', 'C-Scheme, Jaipur', '+91-9876543212', 'amit.verma@example.com', 26.9124, 75.7873, 18, 1000, ARRAY['Tuesday', 'Thursday', 'Friday']),
('Dr. Sneha Patel', 'Dermatologist', 'Lucknow', 'Gomti Nagar, Lucknow', '+91-9876543213', 'sneha.patel@example.com', 26.8467, 80.9462, 10, 700, ARRAY['Monday', 'Tuesday', 'Friday', 'Saturday']),
('Dr. Vikram Singh', 'Orthopedic', 'Patna', 'Boring Road, Patna', '+91-9876543214', 'vikram.singh@example.com', 25.5941, 85.1376, 14, 800, ARRAY['Wednesday', 'Thursday', 'Saturday']),
('Dr. Anjali Mehta', 'Gynecologist', 'Delhi', 'Saket, New Delhi', '+91-9876543215', 'anjali.mehta@example.com', 28.5244, 77.2066, 16, 900, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday']),
('Dr. Rohit Gupta', 'ENT Specialist', 'Mumbai', 'Bandra, Mumbai', '+91-9876543216', 'rohit.gupta@example.com', 19.0596, 72.8295, 11, 600, ARRAY['Tuesday', 'Thursday', 'Friday']),
('Dr. Kavita Reddy', 'Psychiatrist', 'Jaipur', 'Malviya Nagar, Jaipur', '+91-9876543217', 'kavita.reddy@example.com', 26.8523, 75.8226, 13, 1200, ARRAY['Monday', 'Wednesday', 'Friday']),
('Dr. Suresh Rao', 'Dentist', 'Lucknow', 'Hazratganj, Lucknow', '+91-9876543218', 'suresh.rao@example.com', 26.8489, 80.9463, 9, 500, ARRAY['Monday', 'Tuesday', 'Thursday', 'Saturday']),
('Dr. Meera Joshi', 'Ophthalmologist', 'Patna', 'Kankarbagh, Patna', '+91-9876543219', 'meera.joshi@example.com', 25.5940, 85.1376, 17, 700, ARRAY['Tuesday', 'Wednesday', 'Friday']);
