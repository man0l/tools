import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

export const usePDFProcessing = (setAlert) => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(null);
  const [range, setRange] = useState([1, 1]);
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [numTokens, setNumTokens] = useState(0);
  const [completionTokens, setCompletionTokens] = useState(0);
  const [promptTokens, setPromptTokens] = useState(0);
  const [maxTokens, setMaxTokens] = useState(16384);
  const [systemPrompt, setSystemPrompt] = useState(localStorage.getItem('systemPrompt') || 'Act as a translator and translate the given text.');
  const [userPrompt, setUserPrompt] = useState(localStorage.getItem('userPrompt') || 'Translate the text and dont be lazy, translate the whole given text.');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const debounceTimeout = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const backendPort = process.env.REACT_APP_BACKEND_PORT || 5000;

  const fetchExtractedText = async (file, range) => {
    console.log('Fetching extracted text for range:', range);
    setExtracting(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('startPage', range[0]);
    formData.append('endPage', range[1]);

    try {
      const response = await fetch(`http://localhost:${backendPort}/extract-text`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        setExtractedText(result.extractedText);
        setNumTokens(result.numTokens);
        setAlert({ message: 'Text extracted successfully', type: 'success' });

        if (result.numTokens > maxTokens / 2) {
          setAlert({ message: `Extracted tokens exceed half of the maximum allowed (${maxTokens / 2}). Translation not allowed.`, type: 'error' });
        }
      } else {
        const errorResult = await response.json();
        setAlert({ message: errorResult.error || 'Failed to extract text', type: 'error' });
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      setAlert({ message: 'Error extracting text', type: 'error' });
    } finally {
      setExtracting(false);
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        const pdfDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
        const totalPages = pdfDoc.getPageCount();
        setPageCount(totalPages);
        setRange([1, Math.min(2, totalPages)]); // Default to 2 pages if possible
        setAlert({ message: `File loaded with ${totalPages} pages.`, type: 'success' });
        // Trigger text extraction after setting the file and page count
        fetchExtractedText(selectedFile, [1, Math.min(2, totalPages)]);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setAlert({ message: 'Error loading PDF', type: 'error' });
      }
    }
  };

  const handleRangeChange = (value) => {
    console.log('Range changed to:', value);
    setRange(value);
    if (file) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        fetchExtractedText(file, value);
      }, 500);
    }
  };

  const handleTestTranslation = async () => {
    if (!file) {
      setAlert({ message: 'No file selected', type: 'error' });
      return;
    }

    if (!systemPrompt || !userPrompt) {
      setAlert({ message: 'System prompt and user prompt are required.', type: 'error' });
      return;
    }

    if (numTokens > maxTokens / 2) {
      setAlert({ message: `Extracted tokens exceed half of the maximum allowed (${maxTokens / 2}). Translation not allowed.`, type: 'error' });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('startPage', range[0]);
    formData.append('endPage', range[1]);
    formData.append('systemPrompt', systemPrompt);
    formData.append('userPrompt', userPrompt);

    try {
      const response = await fetch(`http://localhost:${backendPort}/test-translation`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        setTranslatedText(result.translation);
        setCompletionTokens(result.completionTokens);
        setPromptTokens(result.promptTokens);
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
    setNumTokens(0);
    setCompletionTokens(0);
    setPromptTokens(0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('startPage', range[0]);
    formData.append('endPage', range[1]);
    formData.append('page_count', pageCount);
    formData.append('page_range', `${range[0]}-${range[1]}`);
    formData.append('system_prompt', systemPrompt);
    formData.append('user_prompt', userPrompt);

    try {
      const response = await fetch(`http://localhost:${backendPort}/upload`, {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      if (response.ok) {
        setAlert({ message: 'File uploaded successfully. Proceed to the next step.', type: 'success' });
      } else {
        const errorResult = await response.json();
        setAlert({ message: errorResult.error || 'File upload failed', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Error uploading file', type: 'error' });
      console.error('Error uploading file:', error);
    }
  };

  const handleSystemPromptChange = (e) => {
    const value = e.target.value;
    setSystemPrompt(value);
    localStorage.setItem('systemPrompt', value);
  };

  const handleUserPromptChange = (e) => {
    const value = e.target.value;
    setUserPrompt(value);
    localStorage.setItem('userPrompt', value);
  };

  return {
    file,
    setFile,
    pageCount,
    range,
    setRange,
    extractedText,
    translatedText,
    numTokens,
    completionTokens,
    promptTokens,
    maxTokens,
    systemPrompt,
    userPrompt,
    loading,
    extracting,
    handleFileChange,
    handleRangeChange,
    handleTestTranslation,
    handleClearTranslation,
    handleSubmit,
    handleSystemPromptChange,
    handleUserPromptChange,
    uploadProgress
  };
};
