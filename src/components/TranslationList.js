import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaLanguage, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Modal from 'react-modal';
import './TranslationList.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Collapse } from 'react-collapse';

Modal.setAppElement('#root');

const TranslationList = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetch('http://localhost:5000/files')
      .then(response => response.json())
      .then(data => setFiles(data))
      .catch(() => toast.error('Failed to fetch files'));
  }, []);

  const handleFileChange = (event) => {
    const fileId = event.target.value;
    setSelectedFile(fileId);
    fetch(`http://localhost:5000/translations/${fileId}`)
      .then(response => response.json())
      .then(data => setTranslations(data))
      .catch(() => toast.error('Failed to fetch translations'));
  };

  const handleEdit = (index, field, value) => {
    const updatedTranslations = [...translations];
    updatedTranslations[index][field] = value;
    setTranslations(updatedTranslations);
    const translationId = translations[index].id;
    const updateField = field === 'translated_text' ? 'translated_text' : 'edited_text';
    fetch(`http://localhost:5000/edit/${translationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [updateField]: value }),
    })
      .then(response => response.json())
      .then(() => toast.success('Text edited successfully'))
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
        setTranslations(updatedTranslations);
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
      .then(response => response.json())
      .then(data => {
        const updatedTranslations = [...translations];
        updatedTranslations[index].translated_text = data.translated_text;
        setTranslations(updatedTranslations);
        toast.success('Text translated successfully');
      })
      .catch(() => toast.error('Failed to translate text'));
  };

  const handleEditAction = (index, field) => {
    const translationId = translations[index].id;
    toast.info('Editing in progress...');

    fetch(`http://localhost:5000/edit-text/${translationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ }),
    })
      .then(response => response.json())
      .then(data => {
        const updatedTranslations = [...translations];
        updatedTranslations[index].edited_text = data.edited_text;
        setTranslations(updatedTranslations);
        toast.success('Text edited successfully');
      })
      .catch(() => toast.error('Failed to edit text'));
  };


  const toggleRow = (index) => {
    setExpandedRows(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
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
                <tr onClick={() => toggleRow(index)}>
                  <td className="border px-4 py-2">
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
                    <button onClick={() => handleEditAction(index, 'translated_text')}><FaEdit /></button>
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
      )}
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
