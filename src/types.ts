export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: string; // ISO date string
}

export interface DocumentEntry {
  id: string;
  fileName: string;
  uploadedAt: string; // ISO date string
  uploadedBy: User;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extractedText?: string;
  errorMessage?: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}