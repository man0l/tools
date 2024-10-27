import React, { useState } from 'react';
import ReactPaginate from 'react-paginate';
import { FaSave, FaTrash, FaLanguage, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Modal from 'react-modal';
import './FileList.css';
import { Collapse } from 'react-collapse';
import { useFileListData } from '../hooks/useFileListData';
import api from '../utils/api';

Modal.setAppElement('#root');

const FileList = () => {
  const {
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
  } = useFileListData();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const backendPort = process.env.REACT_APP_BACKEND_PORT || 5000;

  const handleEdit = (index, field, value) => {
    const updatedFiles = [...files];
    updatedFiles[index][field] = value;
    debouncedUpdateFile(updatedFiles[index]);
  };

  const handleDelete = (index) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this file?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => deleteFile(files[index].id) // Pass the correct file ID
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleTranslate = (file) => {
    api().post(`/init_translation/${file.id}`)
      .then(response => {
        if (response.data.message) {
          setAlert({ message: response.data.message, type: 'success' });
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

  const toggleRow = (index) => {
    setExpandedRows(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return (
    <div className="file-list mt-8">
      {loading && <div className="spinner">Loading files...</div>}
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
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <React.Fragment key={file.id}>
              <tr onClick={() => toggleRow(index)}>
                <td className="border px-4 py-2">
                  {file.filename}
                  {expandedRows[index] ? <FaChevronUp /> : <FaChevronDown />}
                </td>
                <td className="border px-4 py-2">{file.file_path}</td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    value={file.page_count || ''}
                    onChange={(e) => handleEdit(index, 'page_count', e.target.value)}
                    onFocus={(e) => e.target.select()}
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
                  <button onClick={() => debouncedUpdateFile(file)} className="mr-2"><FaSave /></button>
                  <button onClick={() => handleDelete(index)} className="mr-2"><FaTrash /></button>
                  <button onClick={() => handleTranslate(file)}><FaLanguage /></button>
                </td>
              </tr>
              <tr>
                <td colSpan="5" className="border px-4 py-2">
                  <Collapse isOpened={expandedRows[index]} initialStyle={{ height: 0, overflow: 'hidden' }}>
                    <div className="flex">
                      <div className="w-1/3">
                        {file.system_prompt}
                      </div>
                      <div className="w-1/3">
                        {file.user_prompt}
                      </div>
                    </div>
                  </Collapse>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <ReactPaginate
        previousLabel={'previous'}
        nextLabel={'next'}
        breakLabel={'...'}
        pageCount={Math.ceil(totalFiles / itemsPerPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />
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
