import React from 'react';
import Modal from 'react-modal';
import './PromptManager.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';
import { format } from 'date-fns';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import usePromptManager from '../hooks/usePromptManager';
import api from '../utils/api';

Modal.setAppElement('#root');

const PromptManager = () => {
  const {
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
  } = usePromptManager();

  const backendPort = process.env.REACT_APP_BACKEND_PORT || 5000;

  const handleCreatePrompt = async () => {
    if (!newPrompt.system_message || !newPrompt.user_message || !newPrompt.prompt_type) {
      toast.error('All fields are required');
      return;
    }
    try {
      api().post('/prompts', newPrompt)
        .then(response => {
          if (response.data.message === "Prompt created successfully") {
            toast.success(response.data.message);
            fetchPrompts();
            setNewPrompt({ system_message: '', user_message: '', prompt_type: 'translation' });
            setCreateModalIsOpen(false);
          } else {
            toast.error('Failed to create prompt');
          }
        })
        .catch(error => {
          toast.error('Failed to create prompt');
        });
    } catch (error) {
      toast.error('Failed to create prompt');
    }
  };

  const handleUpdatePrompt = async (id, field, value) => {
    try {
      api().put(`/prompts/${id}`, { [field]: value })
        .then(response => {
          toast.success('Prompt updated successfully');
          fetchPrompts();
          closeModal();
        })
        .catch(error => {
          toast.error('Failed to update prompt');
        });
    } catch (error) {
      toast.error('Failed to update prompt');
    }
  };

  const handleDeletePrompt = (id) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this prompt?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              api().delete(`/prompts/${id}`)
                .then(response => {
                  toast.success('Prompt deleted successfully');
                  fetchPrompts();
                })
                .catch(error => {
                  toast.error('Failed to delete prompt');
                });
            } catch (error) {
              toast.error('Failed to delete prompt');
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const openModal = (prompt, field) => {
    setEditingPrompt(prompt);
    setEditField(field);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingPrompt(null);
    setEditField('');
  };

  const openCreateModal = () => {
    setCreateModalIsOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalIsOpen(false);
    setNewPrompt({ system_message: '', user_message: '', prompt_type: 'translation' });
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(0);
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'PPpp');
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="prompt-manager mt-8 p-4 bg-gray-100 rounded-lg">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Prompt Manager</h2>
      <div className="flex mb-4 justify-between items-center">
        <div className="flex items-center space-x-4">
          <select onChange={handleItemsPerPageChange} value={itemsPerPage} className="p-2 border rounded">
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
          <button onClick={openCreateModal} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
            <FaPlus className="mr-2" /> Add New Prompt
          </button>
        </div>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">System Message</th>
            <th className="border-b p-2 text-left">User Message</th>
            <th className="border-b p-2 text-left">Prompt Type</th>
            <th className="border-b p-2 text-left">Created At</th>
            <th className="border-b p-2 text-left">Updated At</th>
            <th className="border-b p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {prompts.map((prompt) => (
            <tr key={prompt.id}>
              <td onClick={() => openModal(prompt, 'system_message')} className="p-2">{prompt.system_message}</td>
              <td onClick={() => openModal(prompt, 'user_message')} className="p-2">{prompt.user_message}</td>
              <td className="p-2">{prompt.prompt_type}</td>
              <td className="p-2">{formatDate(prompt.created_at)}</td>
              <td className="p-2">{formatDate(prompt.updated_at)}</td>
              <td className="actions p-2">
                <button onClick={() => handleDeletePrompt(prompt.id)} className="bg-white p-1 rounded"><FaTrashAlt /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ReactPaginate
        previousLabel={'previous'}
        nextLabel={'next'}
        breakLabel={'...'}
        pageCount={Math.ceil(totalPrompts / itemsPerPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination mt-4'}
        activeClassName={'active'}
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Prompt"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Edit {editField.replace('_', ' ')}</h2>
        <textarea
          value={editingPrompt ? editingPrompt[editField] : ''}
          onChange={(e) => setEditingPrompt({ ...editingPrompt, [editField]: e.target.value })}
          rows={5}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end mt-4">
          <button onClick={() => handleUpdatePrompt(editingPrompt.id, editField, editingPrompt[editField])} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Save</button>
          <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
        </div>
      </Modal>
      <Modal
        isOpen={createModalIsOpen}
        onRequestClose={closeCreateModal}
        contentLabel="Create New Prompt"
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className="text-xl font-bold mb-4">Create New Prompt</h2>
        <div className="space-y-4">
          <textarea
            placeholder="System Message"
            value={newPrompt.system_message}
            onChange={(e) => setNewPrompt({ ...newPrompt, system_message: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <textarea
            placeholder="User Message"
            value={newPrompt.user_message}
            onChange={(e) => setNewPrompt({ ...newPrompt, user_message: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <select
            value={newPrompt.prompt_type}
            onChange={(e) => setNewPrompt({ ...newPrompt, prompt_type: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="translation">Translation</option>
            <option value="editing">Editing</option>
          </select>
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={handleCreatePrompt} className="bg-green-500 text-white px-4 py-2 rounded mr-2">Create</button>
          <button onClick={closeCreateModal} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default PromptManager;
