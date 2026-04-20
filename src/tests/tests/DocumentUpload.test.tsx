import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { DocumentEntry, User } from '../../types';

// Mock DocumentUpload component
// Assume it takes onUpload: (file: File) => Promise<void>
// and displays loading/error/success states

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await onUpload(e.target.files[0]);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label htmlFor="file-input">Upload Document</label>
      <input id="file-input" type="file" onChange={handleChange} />
      {loading && <div role="status">Uploading...</div>}
      {error && <div role="alert">{error}</div>}
      {success && <div>Upload successful!</div>}
    </div>
  );
};

describe('DocumentUpload', () => {
  it('uploads a file and shows success message on happy path', async () => {
    const mockUpload = jest.fn().mockResolvedValue(undefined);
    render(<DocumentUpload onUpload={mockUpload} />);
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload document/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockUpload).toHaveBeenCalledWith(file);
    expect(await screen.findByRole('status')).toHaveTextContent('Uploading...');
    await waitFor(() => expect(screen.getByText(/upload successful/i)).toBeInTheDocument());
  });

  it('shows error message if upload fails', async () => {
    const mockUpload = jest.fn().mockRejectedValue(new Error('Network error'));
    render(<DocumentUpload onUpload={mockUpload} />);
    const file = new File(['fail'], 'fail.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload document/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(mockUpload).toHaveBeenCalledWith(file);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Network error'));
  });

  it('does not call onUpload if no file is selected', () => {
    const mockUpload = jest.fn();
    render(<DocumentUpload onUpload={mockUpload} />);
    const input = screen.getByLabelText(/upload document/i) as HTMLInputElement;

    fireEvent.change(input, { target: { files: [] } });

    expect(mockUpload).not.toHaveBeenCalled();
  });
});