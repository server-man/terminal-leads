CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  niche TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to leads" ON public.leads FOR UPDATE USING (true);