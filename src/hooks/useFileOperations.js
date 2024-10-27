import { useState, useEffect } from 'react';
import useApi from '../utils/api';

export const useFileOperations = () => {
  const [files, setFiles] = useState([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();

  const backendPort = process.env.REACT_APP_BACKEND_PORT || 5000;

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
      await api.put(`/files/${file.id}`, file);
    } catch (err) {
      setError('Failed to update file');
    }
  };

  const deleteFile = async (id) => {
    try {
      await api.delete(`/files/${id}`);
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
