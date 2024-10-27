import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export const useFileOperations = () => {
  const [files, setFiles] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await api.get(`/files?page=${page}&limit=${limit}`);
      setFiles(response.data.files);
      setTotalFiles(response.data.total);
    } catch (err) {
      setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const updateFile = async (file) => {
    try {
      const response = await api.put(`/files/${file.id}`, file);
      if (!response.ok) {
        throw new Error('Failed to update file');
      }
    } catch (err) {
      setError('Failed to update file');
    }
  };

  const deleteFile = async (id) => {
    try {
      const response = await api.delete(`/files/${id}`);
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
