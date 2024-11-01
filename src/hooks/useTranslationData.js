import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

export const useTranslationData = () => {
  const [files, setFiles] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [totalTranslations, setTotalTranslations] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchTranslations = async (options = {}) => {
    const { download_all = null } = options;
    
    if (selectedFile) {
      try {
        const response = await api.get(`/translations/${selectedFile}`, {
          params: {
            page: currentPage + 1,
            limit: itemsPerPage,
            download_all
          }
        });
        
        if (!download_all) {
          setTranslations(response.data.translations);
          setTotalTranslations(response.data.total);
        }
        
        return response.data;
      } catch (error) {
        toast.error('Failed to fetch translations');
        throw error;
      }
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get('/files');
        setFiles(response.data.files);
      } catch {
        toast.error('Failed to fetch files');
      }
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    fetchTranslations();
  }, [selectedFile, currentPage, itemsPerPage]);

  return {
    files,
    translations,
    totalTranslations,
    selectedFile,
    setSelectedFile,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    setTranslations,
    fetchTranslations
  };
};
