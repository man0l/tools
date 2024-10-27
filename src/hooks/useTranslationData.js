import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useApi from '../utils/api';

export const useTranslationData = () => {
  const [files, setFiles] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [totalTranslations, setTotalTranslations] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const api = useApi();

  useEffect(() => {
    api.get('/files')
      .then(response => setFiles(response.data.files))
      .catch(() => toast.error('Failed to fetch files'));
  }, []);

  useEffect(() => {
    if (selectedFile) {
      api.get(`/translations/${selectedFile}?page=${currentPage + 1}&limit=${itemsPerPage}`)
        .then(response => {
          setTranslations(response.data.translations);
          setTotalTranslations(response.data.total);
        })
        .catch(() => toast.error('Failed to fetch translations'));
    }
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
    setTranslations
  };
};
