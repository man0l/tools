import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import { FaTrash } from 'react-icons/fa';
import { Tiktoken, get_encoding } from 'tiktoken';

function UploadPDF() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [pageCount, setPageCount] = useState(null);
  const [range, setRange] = useState([1, 1]);
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ message: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setAlert({ message: '', type: '' });
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdfDoc = await PDFDocument.load(e.target.result);
        const totalPages = pdfDoc.getPageCount();
        setPageCount(totalPages);
        setRange([1, Math.min(Math.ceil(totalPages * 0.1), 20)]);
        await fetchExtractedText(selectedFile, [1, Math.min(Math.ceil(totalPages * 0.1), 20)]);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setAlert({ message: 'Please select a valid PDF file.', type: 'error' });
    }
  };

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setAlert({ message: '', type: '' });
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdfDoc = await PDFDocument.load(e.target.result);
        const totalPages = pdfDoc.getPageCount();
        setPageCount(totalPages);
        setRange([1, Math.min(Math.ceil(totalPages * 0.1), 20)]);
        await fetchExtractedText(droppedFile, [1, Math.min(Math.ceil(totalPages * 0.1), 20)]);
      };
      reader.readAsArrayBuffer(droppedFile);
    } else {
      setAlert({ message: 'Please drop a valid PDF file.', type: 'error' });
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleClick = () => {
    inputRef.current.click();
  };

  const fetchExtractedText = async (file, range) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('startPage', range[0]);
    formData.append('endPage', range[1]);

    try {
      const response = await fetch('http://localhost:5000/extract-text', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        setExtractedText(result.extractedText);

        // Calculate token count
        const encoder = get_encoding('o200k_base');
        const tokens = encoder.encode(result.extractedText);
        setTokenCount(tokens.length);

        setAlert({ message: 'Text extracted successfully', type: 'success' });
      } else {
        const errorResult = await response.json();
        setAlert({ message: errorResult.error || 'Failed to extract text', type: 'error' });
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      setAlert({ message: 'Error extracting text', type: 'error' });
    }
  };

  const handleRangeChange = async (value) => {
    setRange(value);
    if (file) {
      await fetchExtractedText(file, value);
    }
  };

  const handleTestTranslation = async () => {
    if (!file) {
      setAlert({ message: 'No file selected', type: 'error' });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('startPage', range[0]);
    formData.append('endPage', range[1]);

    try {
      const response = await fetch('http://localhost:5000/test-translation', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        setTranslatedText(result.translation);
        setAlert({ message: 'Translation successful', type: 'success' });
      } else {
        const errorResult = await response.json();
        setAlert({ message: errorResult.error || 'Test translation failed', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Error testing translation', type: 'error' });
      console.error('Error testing translation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearTranslation = () => {
    setExtractedText('');
    setTranslatedText('');
    setTokenCount(0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('startPage', range[0]);
    formData.append('endPage', range[1]);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      if (response.ok) {
        setAlert({ message: 'File uploaded successfully', type: 'success' });
      } else {
        const errorResult = await response.json();
        setAlert({ message: errorResult.error || 'File upload failed', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Error uploading file', type: 'error' });
      console.error('Error uploading file:', error);
    }
  };

  const maxPages = pageCount ? Math.min(Math.ceil(pageCount * 0.1), 20) : 10;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed p-4 mb-4 w-full text-center cursor-pointer ${dragActive ? 'border-blue-500' : 'border-gray-300'}`}
      >
        {file ? file.name : 'Drag and drop a PDF file here or click to select'}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
          ref={inputRef}
        />
      </div>
      {pageCount && (
        <div className="mb-4">
          <strong>Page Count:</strong> {pageCount}
        </div>
      )}
      {pageCount && (
        <div className="mb-4 w-full">
          <label htmlFor="pageRange" className="block text-center mb-2">
            Select page range: {range[0]} - {range[1]}
          </label>
          <Slider
            range
            min={1}
            max={maxPages}
            value={range}
            onChange={handleRangeChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span>1</span>
            <span>{maxPages}</span>
          </div>
        </div>
      )}
      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mb-2">Upload PDF</button>
      {pageCount && (
        <button type="button" onClick={handleTestTranslation} className="bg-green-500 text-white px-4 py-2 rounded mb-2">
          {loading ? 'Translating...' : 'Test Translation'}
        </button>
      )}
      {alert.message && (
        <div className={`mt-4 p-2 w-full text-center rounded ${alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {alert.message}
        </div>
      )}
      {(extractedText || translatedText) && (
        <div className="flex w-full mt-4">
          {extractedText && (
            <div className="w-1/2 p-2 border-r">
              <h3 className="text-lg font-bold mb-2">Extracted Text</h3>
              <p>{extractedText}</p>
              <p><strong>Token Count:</strong> {tokenCount}</p>
            </div>
          )}
          {translatedText && (
            <div className="w-1/2 p-2">
              <h3 className="text-lg font-bold mb-2">Translated Text</h3>
              <p>{translatedText}</p>
            </div>
          )}
          <button onClick={handleClearTranslation} className="ml-2 text-red-500">
            <FaTrash />
          </button>
        </div>
      )}
    </form>
  );
}

export default UploadPDF;
