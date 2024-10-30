import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaLanguage, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Modal from 'react-modal';
import './TranslationList.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Collapse } from 'react-collapse';
import ReactPaginate from 'react-paginate';
import { useTranslationData } from '../hooks/useTranslationData';
import { api } from '../utils/api';
import { useActionQueue } from '../hooks/useActionQueue';

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
    setItemsPerPage,
    setTranslations,
    fetchTranslations
  } = useTranslationData();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const {
    queue,
    addToQueue,
    processQueue,
    isProcessing,
    clearQueue
  } = useActionQueue();

  const handleFileChange = (event) => {
    const fileId = event.target.value;
    setSelectedFile(fileId);
    setCurrentPage(0); // Reset to first page when file changes
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(0); // Reset to first page when items per page changes
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const currentPageIndexes = translations.map((_, index) => index);
      setSelectedRows(currentPageIndexes);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (index) => {
    setSelectedRows(prevSelectedRows =>
      prevSelectedRows.includes(index)
        ? prevSelectedRows.filter(i => i !== index)
        : [...prevSelectedRows, index]
    );
  };

  useEffect(() => {
    setSelectedRows([]);
  }, [currentPage]);

  const handleBulkAction = (action) => {
    const selectedTranslations = selectedRows.map(index => translations[index]).filter(Boolean);
    
    switch (action) {
      case 'extract':
        addToQueue(selectedTranslations.map(translation => ({
          action: 'extract',
          translation
        })));
        break;
      case 'translate':
        addToQueue(selectedTranslations.map(translation => ({
          action: 'translate',
          translation
        })));
        break;
      case 'edit':
        addToQueue(selectedTranslations.map(translation => ({
          action: 'edit',
          translation
        })));
        break;
      case 'download_csv':
        handleDownloadCSV(selectedTranslations);
        break;
      case 'download_doc':
        handleDownloadDOC(selectedTranslations);
        break;
      default:
        break;
    }
    setBulkAction('');
  };

  const handleDownloadCSV = (rows) => {
    const selectedTranslations = rows.map(index => translations[index]);
    const csvHeader = "Edited Text\n";
    const csvContent = selectedTranslations.map(t => `${t.edited_text}`).join(";");
    const csvData = csvHeader + csvContent;
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvData);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "edited_texts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDOC = (rows) => {
    const selectedTranslations = rows.map(index => translations[index]);
    const docContent = selectedTranslations.map(t => `${t.edited_text}\n\n`).join("");
    const blob = new Blob([docContent], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "edited_texts.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCSVAll = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      const { translations: allTranslations } = await fetchTranslations({ download_all: true });
      const csvHeader = "Edited Text\n";
      const csvContent = allTranslations.map(t => `${t.edited_text}`).join(";");
      const csvData = csvHeader + csvContent;
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvData);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "edited_texts.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV downloaded successfully');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Failed to download CSV');
    }
  };

  const handleDownloadDOCAll = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      const { translations: allTranslations } = await fetchTranslations({ download_all: true });
      const docContent = allTranslations.map(t => `${t.edited_text}\n\n`).join('');
      const blob = new Blob([docContent], { type: 'application/msword' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'all_translations.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleEdit = async (index, field, value) => {
    const translationId = translations[index].id;
    try {
      const response = await api.post(`/update-translation/${translationId}`, { [field]: value });
      const updatedTranslations = [...translations];
      updatedTranslations[index][field] = response.data[field];
      setTranslations(updatedTranslations);
      toast.success('Text edited successfully');
    } catch (error) {
      console.error('Error editing text:', error.message);
      toast.error('Failed to edit the text by AI: ' + error.response.data.error);
    }
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

  const saveChanges = async () => {
    await handleEdit(currentIndex, currentField, currentValue);
    closeModal();
  };

  const handleExtract = async (translation) => {
    try {
      const response = await api.post(`/perform_extraction/${translation.id}`);
      
      // Find the index of the translation to update
      const index = translations.findIndex(t => t.id === translation.id);
      if (index === -1) return; // Translation not found
      
      // Create new array with only the necessary update
      const updatedTranslations = [
        ...translations.slice(0, index),
        { ...translations[index], extracted_text: response.data.extracted_text },
        ...translations.slice(index + 1)
      ];
      
      setTranslations(updatedTranslations);
      toast.success('Text extracted successfully');
    } catch (error) {
      toast.error('Failed to extract text');
    }
  };

  const handleTranslate = async (translation) => {    
    
    try {
      const response = await api.post(`/translate/${translation.id}`);
      
      // Find the index of the translation to update
      const index = translations.findIndex(t => t.id === translation.id);
      if (index === -1) return; // Translation not found
      
      // Create new array with only the necessary update
      const updatedTranslations = [
        ...translations.slice(0, index),
        { ...translations[index], translated_text: response.data.translated_text },
        ...translations.slice(index + 1)
      ];
      
      setTranslations(updatedTranslations);
      toast.success('Text translated successfully');
    } catch (error) {
      toast.error('Failed to translate text: ' + error.response.data.error);
    }
  };

  const handleEditAction = async (translation) => {
    console.log('Editing translation with ID:', translation.id);

    try {
      const response = await api.post(`/edit/${translation.id}`);
      
      // Find the index of the translation to update
      const index = translations.findIndex(t => t.id === translation.id);
      if (index === -1) return; // Translation not found
      
      // Create new array with only the necessary update
      const updatedTranslations = [
        ...translations.slice(0, index),
        { ...translations[index], edited_text: response.data.edited_text },
        ...translations.slice(index + 1)
      ];
      
      setTranslations(updatedTranslations);
      toast.success('Text edited successfully');
    } catch (error) {
      console.error('Error editing text:', error.message);
      toast.error('Failed to edit the text by AI: ' + error.response.data.error);
    }
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

  useEffect(() => {
    const processQueueItem = async (item) => {
      switch (item.action) {
        case 'extract':
          await handleExtract(item.translation);
          break;
        case 'translate':
          await handleTranslate(item.translation);
          break;
        case 'edit':
          await handleEditAction(item.translation);
          break;
        default:
          break;
      }
    };

    if (queue.length > 0 && !isProcessing) {
      processQueue(processQueueItem);
    }
  }, [queue, isProcessing]);

  return (
    <div className="translation-list mt-8">
      <ToastContainer />
      <div className="flex mb-4 justify-between">
        <div className="flex">
          <select onChange={handleFileChange} value={selectedFile || ''} className="p-2 border rounded mr-4">
            <option value="" disabled>Select a file</option>
            {files.map(file => (
              <option key={file.id} value={file.id}>{file.filename}</option>
            ))}
          </select>
          <select onChange={handleItemsPerPageChange} value={itemsPerPage} className="p-2 border rounded mr-4">
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
          {selectedRows.length > 0 && (
            <>
              <select value={bulkAction} onChange={(e) => handleBulkAction(e.target.value)} className="p-2 border rounded mr-4">
                <option value="" disabled>Select Bulk Action</option>
                <option value="extract">Extract</option>
                <option value="translate">Translate</option>
                <option value="edit">Edit</option>
                <option value="download_csv">Download CSV</option>
                <option value="download_doc">Download DOC</option>
              </select>
              <div className="p-2">
                Selected Rows: {selectedRows.length}
                {queue.length > 0 && (
                  <span className="ml-2">
                    <span className="text-blue-500">(Queue: {queue.length} remaining)</span>
                    <button 
                      onClick={clearQueue}
                      className="ml-2 text-red-500 hover:text-red-700 text-sm underline"
                    >
                      clear queue
                    </button>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex">
          <button onClick={handleDownloadCSVAll} className="bg-purple-500 text-white px-4 py-2 rounded mr-2">Download CSV All</button>
          <button onClick={handleDownloadDOCAll} className="bg-red-500 text-white px-4 py-2 rounded">Download DOC All</button>
        </div>
      </div>
      {selectedFile && (
        <div style={{ minHeight: '400px' }}> {/* Set a minimum height for consistency */}
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={translations.length > 0 && selectedRows.length === translations.length}
                  />
                </th>
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
                    <td className="border px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(index)}
                        onChange={() => handleSelectRow(index)}
                      />
                    </td>
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
                      <button onClick={() => handleExtract(translation)} className="mr-2"><FaFileAlt /></button>
                      <button onClick={() => handleTranslate(translation)} className="mr-2"><FaLanguage /></button>
                      <button onClick={() => handleEditAction(translation)}><FaEdit /></button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="border px-4 py-2">
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
