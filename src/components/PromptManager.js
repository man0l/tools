import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './PromptManager.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root');

const PromptManager = () => {
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState({ system_message: '', user_message: '', prompt_type: '' });
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/prompts');
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      toast.error('Failed to fetch prompts');
    }
  };

  const handleCreatePrompt = async () => {
    try {
      const response = await fetch('/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrompt),
      });
      if (response.ok) {
        toast.success('Prompt created successfully');
        setNewPrompt({ system_message: '', user_message: '', prompt_type: '' });
        fetchPrompts();
        closeModal();
      } else {
        toast.error('Failed to create prompt');
      }
    } catch (error) {
      toast.error('Failed to create prompt');
    }
  };

  const handleUpdatePrompt = async (id) => {
    try {
      const response = await fetch(`/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPrompt),
      });
      if (response.ok) {
        toast.success('Prompt updated successfully');
        setEditingPrompt(null);
        fetchPrompts();
        closeModal();
      } else {
        toast.error('Failed to update prompt');
      }
    } catch (error) {
      toast.error('Failed to update prompt');
    }
  };

  const handleDeletePrompt = async (id) => {
    try {
      const response = await fetch(`/prompts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Prompt deleted successfully');
        fetchPrompts();
      } else {
        toast.error('Failed to delete prompt');
      }
    } catch (error) {
      toast.error('Failed to delete prompt');
    }
  };

  const openModal = (prompt = null) => {
    setEditingPrompt(prompt);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingPrompt(null);
  };

  return (
    <div className="prompt-manager">
      <ToastContainer />
      <h2>Prompt Manager</h2>
      <button onClick={() => openModal()} className="bg-blue-500 text-white px-4 py-2 rounded">Add New Prompt</button>
      <table className="prompt-table">
        <thead>
          <tr>
            <th>System Message</th>
            <th>User Message</th>
            <th>Prompt Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {prompts.map((prompt) => (
            <tr key={prompt.id}>
              <td>{prompt.system_message}</td>
              <td>{prompt.user_message}</td>
              <td>{prompt.prompt_type}</td>
              <td>
                <button onClick={() => openModal(prompt)}>Edit</button>
                <button onClick={() => handleDeletePrompt(prompt.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Prompt Form"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>{editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}</h2>
        <input
          type="text"
          placeholder="System Message"
          value={editingPrompt ? editingPrompt.system_message : newPrompt.system_message}
          onChange={(e) => editingPrompt ? setEditingPrompt({ ...editingPrompt, system_message: e.target.value }) : setNewPrompt({ ...newPrompt, system_message: e.target.value })}
        />
        <input
          type="text"
          placeholder="User Message"
          value={editingPrompt ? editingPrompt.user_message : newPrompt.user_message}
          onChange={(e) => editingPrompt ? setEditingPrompt({ ...editingPrompt, user_message: e.target.value }) : setNewPrompt({ ...newPrompt, user_message: e.target.value })}
        />
        <input
          type="text"
          placeholder="Prompt Type"
          value={editingPrompt ? editingPrompt.prompt_type : newPrompt.prompt_type}
          onChange={(e) => editingPrompt ? setEditingPrompt({ ...editingPrompt, prompt_type: e.target.value }) : setNewPrompt({ ...newPrompt, prompt_type: e.target.value })}
        />
        <div className="flex justify-end mt-4">
          <button onClick={editingPrompt ? () => handleUpdatePrompt(editingPrompt.id) : handleCreatePrompt} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Save</button>
          <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default PromptManager;
