import { useState } from 'react';
import { autoContentApi } from '@/lib/api';
import { storageService } from '@/lib/storage';
import { API_CONSTANTS } from '@/lib/api/constants';

interface UploadInterfaceProps {
  onClose: () => void;
  onSourcesUpdate: () => void;
}

export function UploadInterface({ onClose, onSourcesUpdate }: UploadInterfaceProps) {
  const [tab, setTab] = useState<'file' | 'link' | 'text'>('file');
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    setError('');
    if (file.size > API_CONSTANTS.MAX_FILE_SIZE) {
      setError('File too large');
      return;
    }
    const validTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type');
      return;
    }

    setFiles([file]);
    setUploading(true);
    setProgress(0);
    try {
      const result = await autoContentApi.uploadSource(file);
      setProgress(50);
      await autoContentApi.analyzeSource(result.request_id || '');
      setProgress(100);
      storageService.saveSources([]);
      onSourcesUpdate();
    } catch (e) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUrl = async () => {
    if (!/^https?:\/\//i.test(url)) {
      setError('Invalid URL');
      return;
    }
    setUploading(true);
    try {
      const res = await autoContentApi.createContent({ text: url, outputType: 'url_content', includeCitations: true });
      await autoContentApi.analyzeSource(res.request_id || '');
      storageService.saveSources([]);
      onSourcesUpdate();
      setUrl('');
    } catch (e) {
      setError('Failed');
    } finally {
      setUploading(false);
    }
  };

  const handleText = async () => {
    if (!text.trim()) return;
    setUploading(true);
    try {
      const res = await autoContentApi.createContent({ text, outputType: 'text_content', includeCitations: true });
      await autoContentApi.analyzeSource(res.request_id || '');
      storageService.saveSources([]);
      onSourcesUpdate();
      setText('');
    } catch (e) {
      setError('Failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Add sources</h2>
      <div>
        <button onClick={() => setTab('file')}>File</button>
        <button onClick={() => setTab('link')}>Link</button>
        <button onClick={() => setTab('text')}>Text</button>
        <button aria-label="close" onClick={onClose}>Close</button>
      </div>

      {tab === 'file' && (
        <input aria-label="upload" type="file" onChange={e => e.target.files && handleFileUpload(e.target.files[0])} />
      )}
      {tab === 'link' && (
        <div>
          <input placeholder="Enter URL..." value={url} onChange={e => setUrl(e.target.value)} />
          <button onClick={handleUrl}>Add</button>
        </div>
      )}
      {tab === 'text' && (
        <div>
          <textarea placeholder="Paste text..." value={text} onChange={e => setText(e.target.value)} />
          <button onClick={handleText}>Add</button>
        </div>
      )}

      {files.map(f => <div key={f.name}>{f.name}</div>)}
      {uploading && (
        <div>
          <progress role="progressbar" value={progress} max={100}></progress>
          <span>Processing</span>
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}
