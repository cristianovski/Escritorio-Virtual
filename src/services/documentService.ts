import { supabase } from '../lib/supabase';
import { ClientDocument } from '../types';

export async function updateDocument(
  id: string,
  updates: {
    title: string;
    category: ClientDocument['category'];
    reference_date: string | null;
    description: string;
  }
) {
  const { error } = await supabase
    .from('client_documents')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from('client_documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
