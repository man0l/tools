import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000';

export const useFileOperations = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/files`);
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError('There was an error fetching the files!');
    } finally {
      setLoading(false);
    }
  };

  const updateFile = async (file) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${file.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_count: file.page_count,
          page_range: file.page_range,
          system_prompt: file.system_prompt,
          user_prompt: file.user_prompt
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update file');
      }
    } catch (err) {
      setError('There was an error updating the file!');
    }
  };

  const deleteFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  return {
    files,
    loading,
    error,
    fetchFiles,
    updateFile,
    deleteFile,
  };
};
