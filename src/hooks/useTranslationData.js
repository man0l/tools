import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useTranslationData = () => {
  const [files, setFiles] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [totalTranslations, setTotalTranslations] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetch('http://localhost:5000/files')
      .then(response => response.json())
      .then(data => setFiles(data.files))
      .catch(() => toast.error('Failed to fetch files'));
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetch(`http://localhost:5000/translations/${selectedFile}?page=${currentPage + 1}&limit=${itemsPerPage}`)
        .then(response => response.json())
        .then(data => {
          setTranslations(data.translations);
          setTotalTranslations(data.total);
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
