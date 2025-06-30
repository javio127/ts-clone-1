import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('searches')
      .select('id, query, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching searches:', error);
      return NextResponse.json({ searches: [] });
    }

    return NextResponse.json({ searches: data || [] });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ searches: [] });
  }
} 