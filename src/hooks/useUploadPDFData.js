import { useState, useRef } from 'react';
import { useAlert } from './useAlert';
import { usePDFProcessing } from './usePDFProcessing';

export const useUploadPDFData = () => {
  const { alert, setAlert } = useAlert();
  const {
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
  } = usePDFProcessing(setAlert);

  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange({ target: { files } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  return {
    alert,
    file,
    pageCount,
    range,
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
    uploadProgress,
    inputRef,
    dragActive,
    setDragActive,
    handleDrop,
    handleDragOver,
    handleDragLeave
  };
};
