export interface Note {
  _id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchNotes(search?: string): Promise<Note[]> {
  const url = search
    ? `${API_URL}/api/notes?search=${encodeURIComponent(search)}`
    : `${API_URL}/api/notes`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
}

export async function createNote(note: Omit<Note, '_id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  const response = await fetch(`${API_URL}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create note');
  }
  return response.json();
}

export async function updateNote(
  id: string,
  note: Partial<Omit<Note, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<Note> {
  const response = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update note');
  }
  return response.json();
}

export async function deleteNote(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete note');
  }
  return response.json();
}

