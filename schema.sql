-- Create searches table
CREATE TABLE searches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  query text NOT NULL,
  answer text,
  created_at timestamp DEFAULT now()
);

-- Enable Row Level Security (optional but good practice)
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for saving searches)
CREATE POLICY "Allow anonymous inserts" ON searches
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous reads (for showing recent searches - optional)
CREATE POLICY "Allow anonymous reads" ON searches
  FOR SELECT TO anon
  USING (true); 