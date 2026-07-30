import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wwucatnjiaglqsyvazyk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dWNhdG5qaWFnbHFzeXZhenlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTcxNDMsImV4cCI6MjEwMDk5MzE0M30.-uxUxF_smtpfWtZwEr7Yv2Om2I9IhDpg8zyuzMwrrV8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
