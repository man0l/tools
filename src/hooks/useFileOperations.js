import { useState, useEffect } from 'react';

export const useFileOperations = () => {
  const [files, setFiles] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const backendPort = process.env.REACT_APP_BACKEND_PORT || 5000;

  const fetchFiles = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:${backendPort}/files?page=${page}&limit=${limit}`);
      const data = await response.json();
      setFiles(data.files);
      setTotalFiles(data.total);
    } catch (err) {
      setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const updateFile = async (file) => {
    try {
      const response = await fetch(`http://localhost:${backendPort}/files/${file.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(file),
      });
      if (!response.ok) {
        throw new Error('Failed to update file');
      }
    } catch (err) {
      setError('Failed to update file');
    }
  };

  const deleteFile = async (id) => {
    try {
      const response = await fetch(`http://localhost:${backendPort}/files/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return { files, totalFiles, loading, error, fetchFiles, updateFile, deleteFile };
};
