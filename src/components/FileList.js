import React, { useState } from 'react';
import { useFileOperations } from '../hooks/useFileOperations';
import { FaSave, FaTrash, FaLanguage } from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Modal from 'react-modal';
import './FileList.css';
import { useAlert } from '../hooks/useAlert';

Modal.setAppElement('#root');

const FileList = () => {
  const { files, loading, error, updateFile, deleteFile } = useFileOperations();
  const { alert, setAlert } = useAlert();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(null);

  const handleEdit = (index, field, value) => {
    const updatedFiles = [...files];
    updatedFiles[index][field] = value;
    updateFile(updatedFiles[index]);
  };

  const handleDelete = (index) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this file?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => deleteFile(index)
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleTranslate = (file) => {
    // Call the init_translation endpoint
    fetch(`http://localhost:5000/init_translation/${file.id}`, {
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        setAlert({ message: data.message, type: 'success' });
      } else {
        setAlert({ message: 'Translation failed', type: 'error' });
      }
    })
    .catch(() => setAlert({ message: 'Translation failed', type: 'error' }));
  };

  const openModal = (index, field, value) => {
    setCurrentIndex(index);
    setCurrentField(field);
    setCurrentValue(value);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const saveChanges = () => {
    handleEdit(currentIndex, currentField, currentValue);
    setAlert({ message: 'File saved successfully', type: 'success' });
    closeModal();
  };

  return (
    <div className="file-list mt-8">
      {loading && <p>Loading files...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {alert.message && (
        <div className={`alert ${alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} p-2 mb-4 rounded`}>
          {alert.message}
        </div>
      )}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">File Name</th>
            <th className="py-2">File Path</th>
            <th className="py-2">Page Count</th>
            <th className="py-2">Page Range</th>
            <th className="py-2">System Prompt</th>
            <th className="py-2">User Prompt</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{file.filename}</td>
              <td className="border px-4 py-2">{file.file_path}</td>
              <td className="border px-4 py-2">
                <input
                  type="number"
                  value={file.page_count || ''}
                  onChange={(e) => handleEdit(index, 'page_count', e.target.value)}
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={file.page_range || ''}
                  onChange={(e) => handleEdit(index, 'page_range', e.target.value)}
                />
              </td>
              <td className="border px-4 py-2">
                <span onClick={() => openModal(index, 'system_prompt', file.system_prompt || '')}>
                  {file.system_prompt || ''}
                </span>
              </td>
              <td className="border px-4 py-2">
                <span onClick={() => openModal(index, 'user_prompt', file.user_prompt || '')}>
                  {file.user_prompt || ''}
                </span>
              </td>
              <td className="border px-4 py-2">
                <button onClick={() => updateFile(file)}>
                  <FaSave />
                </button>
                <button onClick={() => handleDelete(index)}>
                  <FaTrash />
                </button>
                <button onClick={() => handleTranslate(file)}>
                  <FaLanguage />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Prompt"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Edit {currentField.replace('_', ' ')}</h2>
        <textarea
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          rows={5}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end mt-4">
          <button onClick={saveChanges} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Save</button>
          <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default FileList;
