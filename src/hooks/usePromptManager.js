import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useApi from '../utils/api';

const usePromptManager = () => {
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState({ system_message: '', user_message: '', prompt_type: 'translation' });
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [editField, setEditField] = useState('');

  const api = useApi();

  const fetchPrompts = async () => {
    try {
      const response = await api.get(`/prompts?page=${currentPage + 1}&itemsPerPage=${itemsPerPage}`);
      setPrompts(response.data.prompts || []);
      setTotalPrompts(response.data.total || 0);
    } catch (error) {
      toast.error('Failed to fetch prompts');
      setPrompts([]);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [currentPage, itemsPerPage]);

  return {
    prompts,
    setPrompts,
    newPrompt,
    setNewPrompt,
    editingPrompt,
    setEditingPrompt,
    modalIsOpen,
    setModalIsOpen,
    createModalIsOpen,
    setCreateModalIsOpen,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPrompts,
    setTotalPrompts,
    editField,
    setEditField,
    fetchPrompts
  };
};

export default usePromptManager;
