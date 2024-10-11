import React from 'react';
import { useFileOperations } from '../hooks/useFileOperations';

const FileList = () => {
  const { files, loading, error, updateFile, deleteFile } = useFileOperations();

  const handleEdit = (index, field, value) => {
    const updatedFiles = [...files];
    updatedFiles[index][field] = value;
    updateFile(updatedFiles[index]);
  };

  return (
    <div className="file-list mt-8">
      {loading && <p>Loading files...</p>}
      {error && <p className="text-red-500">{error}</p>}
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
                <input
                  type="text"
                  value={file.system_prompt || ''}
                  onChange={(e) => handleEdit(index, 'system_prompt', e.target.value)}
                />
              </td>
              <td className="border px-4 py-2">
                <input
                  type="text"
                  value={file.user_prompt || ''}
                  onChange={(e) => handleEdit(index, 'user_prompt', e.target.value)}
                />
              </td>
              <td className="border px-4 py-2">
                <button onClick={() => updateFile(file)}>Save</button>
                <button onClick={() => deleteFile(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;
