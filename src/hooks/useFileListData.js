import { useState, useEffect, useCallback } from 'react';
import { useFileOperations } from './useFileOperations';
import { useAlert } from './useAlert';

export const useFileListData = () => {
  const { files, totalFiles, loading, error, fetchFiles, updateFile, deleteFile } = useFileOperations();
  const { alert, setAlert } = useAlert();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFiles(currentPage + 1, itemsPerPage);
  }, [currentPage]);

  const debouncedUpdateFile = useCallback((file) => {
    const debounce = (func, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
      };
    };
    return debounce(updateFile, 300)(file);
  }, [updateFile]);

  return {
    files,
    totalFiles,
    loading,
    error,
    alert,
    setAlert,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    debouncedUpdateFile,
    deleteFile
  };
};
