import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.0.0/+esm';

const supabaseUrl = 'https://qgmqmcambqfximtjcuzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbXFtY2FtYnFmeGltdGpjdXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjA4NzQ3NjIsImV4cCI6MjAzNjQ1MDc2Mn0.R7RFFcBq8AZwsM13RSKD0v9Y9lexGV_o336WLIWG-Yo';
export const supabase = createClient(supabaseUrl, supabaseKey);