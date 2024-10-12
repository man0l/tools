import React, { useState } from 'react';
import { FaFileAlt, FaLanguage, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Modal from 'react-modal';
import './TranslationList.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Collapse } from 'react-collapse';
import ReactPaginate from 'react-paginate';
import { useTranslationData } from '../hooks/useTranslationData';

Modal.setAppElement('#root');

const TranslationList = () => {
  const {
    files,
    translations,
    totalTranslations,
    selectedFile,
    setSelectedFile,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setTranslations
  } = useTranslationData();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const handleFileChange = (event) => {
    const fileId = event.target.value;
    setSelectedFile(fileId);
    setCurrentPage(0); // Reset to first page when file changes
  };

  const handleEdit = (index, field, value) => {
    const updatedTranslations = [...translations];
    updatedTranslations[index][field] = value;
    const translationId = translations[index].id;
    fetch(`http://localhost:5000/update-translation/${translationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: value }), // Use the correct field
    })
      .then(response => response.json())
      .then(data => {
        updatedTranslations[index][field] = data[field]; // Use dynamic field
        setTranslations(updatedTranslations); // Update the state
        toast.success('Text edited successfully');
      })
      .catch(() => toast.error('Failed to edit text'));
  };

  const openModal = (index, field, value) => {
    setCurrentIndex(index);
    setCurrentField(field);
    setCurrentValue(value || '');
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const saveChanges = () => {
    handleEdit(currentIndex, currentField, currentValue);
    closeModal();
  };

  const handleExtract = (index) => {
    const translationId = translations[index].id;
    fetch(`http://localhost:5000/perform_extraction/${translationId}`, {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        const updatedTranslations = [...translations];
        updatedTranslations[index].extracted_text = data.extracted_text;
        setTranslations(updatedTranslations); // Update the state
        toast.success('Text extracted successfully');
      })
      .catch(() => toast.error('Failed to extract text'));
  };

  const handleTranslate = (index) => {
    toast.info('Translation in progress...');
    const translationId = translations[index].id;
    fetch(`http://localhost:5000/translate/${translationId}`, {
      method: 'POST',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to translate text');
        }
        return response.json();
      })
      .then(data => {
        const updatedTranslations = [...translations];
        updatedTranslations[index].translated_text = data.translated_text;
        setTranslations(updatedTranslations); // Update the state
        toast.success('Text translated successfully');
      })
      .catch((e) => {
        toast.error('Failed to translate text ' + e.message);
      });
  };

  const handleEditAction = (index) => {
    const translationId = translations[index].id;
    console.log('Editing translation with ID:', translationId); // Log the translation ID
    toast.info('Editing in progress...');

    fetch(`http://localhost:5000/edit/${translationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
      })
      .then(data => {
        const updatedTranslations = [...translations];
        updatedTranslations[index].edited_text = data.edited_text; // Use dynamic field
        setTranslations(updatedTranslations); // Update the state
        toast.success('Text edited successfully');
      })
      .catch((e) => {
        console.error('Error editing text:', e.message);
        toast.error('Failed to edit the text by AI: ' + e.message);
      });
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
    <div className="translation-list mt-8">
      <ToastContainer />
      <select onChange={handleFileChange} value={selectedFile || ''} className="mb-4 p-2 border rounded">
        <option value="" disabled>Select a file</option>
        {files.map(file => (
          <option key={file.id} value={file.id}>{file.filename}</option>
        ))}
      </select>
      {selectedFile && (
        <div style={{ minHeight: '400px' }}> {/* Set a minimum height for consistency */}
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2">Page Range</th>
                <th className="py-2">Extracted Text</th>
                <th className="py-2">Translated Text</th>
                <th className="py-2">Edited Text</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {translations.map((translation, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td className="border px-4 py-2" onClick={() => toggleRow(index)}>
                      {translation.page_range}
                      {expandedRows[index] ? <FaChevronUp /> : <FaChevronDown />}
                    </td>
                    <td className="border px-4 py-2" onClick={() => openModal(index, 'extracted_text', translation.extracted_text)}>
                      {(translation.extracted_text || '').substring(0, 50)}...
                    </td>
                    <td className="border px-4 py-2" onClick={() => openModal(index, 'translated_text', translation.translated_text)}>
                      {(translation.translated_text || '').substring(0, 50)}...
                    </td>
                    <td className="border px-4 py-2" onClick={() => openModal(index, 'edited_text', translation.edited_text)}>
                      {(translation.edited_text || '').substring(0, 50)}...
                    </td>
                    <td className="border px-4 py-2">
                      <button onClick={() => handleExtract(index)} className="mr-2"><FaFileAlt /></button>
                      <button onClick={() => handleTranslate(index)} className="mr-2"><FaLanguage /></button>
                      <button onClick={() => handleEditAction(index)}><FaEdit /></button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="5" className="border px-4 py-2">
                      <Collapse isOpened={expandedRows[index]} initialStyle={{ height: 0, overflow: 'hidden' }}>
                        <div className="flex">
                          <div className="w-1/3">
                            {translation.extracted_text}
                          </div>
                          <div className="w-1/3">
                            {translation.translated_text}
                          </div>
                          <div className="w-1/3">
                            {translation.edited_text}
                          </div>
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ReactPaginate
        previousLabel={'previous'}
        nextLabel={'next'}
        breakLabel={'...'}
        pageCount={Math.ceil(totalTranslations / itemsPerPage)} // Calculate total pages
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Translation"
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

export default TranslationList;
