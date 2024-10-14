import React from 'react';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import { FaTrash } from 'react-icons/fa';
import { useUploadPDFData } from '../hooks/useUploadPDFData';

function UploadPDF() {
  const {
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
  } = useUploadPDFData();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center max-w-3xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Welcome to the App</h1>
      <div
        onClick={() => inputRef.current.click()}
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
          <label htmlFor="pageRange" className="block text-center mb-2 font-semibold">
            Select page range: {range[0]} - {range[1]}
          </label>
          <Slider
            range
            min={1}
            max={pageCount}
            value={range}
            onChange={handleRangeChange}
            className="w-full"
            disabled={loading || extracting}
          />
          <div className="flex justify-between text-sm">
            <span>1</span>
            <span>{pageCount}</span>
          </div>
        </div>
      )}
      <div className="mb-4 w-full">
        <label htmlFor="systemPrompt" className="block text-center mb-2 font-semibold">
          System Prompt
        </label>
        <textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={handleSystemPromptChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4 w-full">
        <label htmlFor="userPrompt" className="block text-center mb-2 font-semibold">
          User Prompt
        </label>
        <textarea
          id="userPrompt"
          value={userPrompt}
          onChange={handleUserPromptChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}
      <div className="flex justify-between w-full mb-4">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-1/2 mr-2">Upload PDF</button>
        <button type="button" onClick={handleTestTranslation} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors w-1/2 ml-2" disabled={numTokens > maxTokens / 2}>
          {loading ? 'Translating...' : 'Test Translation'}
        </button>
      </div>
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
              <p><strong>Token Count:</strong> {numTokens} / {maxTokens/2}</p>
              <p>{extractedText}</p>
            </div>
          )}
          {translatedText && (
            <div className="w-1/2 p-2">
              <h3 className="text-lg font-bold mb-2">Translated Text</h3>
              <p><strong>Completion Tokens:</strong> {completionTokens}</p>
              <p><strong>Prompt Tokens:</strong> {promptTokens}</p>
              <p><strong>Token Usage:</strong> {completionTokens + promptTokens} / {maxTokens}</p>
              <p>{translatedText}</p>
            </div>
          )}
          <button onClick={handleClearTranslation} className="ml-2 text-red-500 hover:text-red-700 transition-colors">
            <FaTrash />
          </button>
        </div>
      )}
    </form>
  );
}

export default UploadPDF;
