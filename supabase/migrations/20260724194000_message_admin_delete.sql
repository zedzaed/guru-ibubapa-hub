-- RLS sedia ada hanya membenarkan polisi admin melakukan DELETE.
-- Grant pada role authenticated diperlukan supaya polisi tersebut boleh digunakan.
GRANT DELETE ON public.messages TO authenticated;
