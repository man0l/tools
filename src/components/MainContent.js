import React from 'react';
import UploadPDF from './UploadPDF';

function MainContent() {
  return (
    <main className="flex-grow container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4 text-center text-dark-blue">Welcome to the App</h1>
      <UploadPDF />
    </main>
  );
}

export default MainContent;
