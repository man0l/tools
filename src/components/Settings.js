import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../utils/api';
import { useEffect } from 'react';
import './Settings.css';

const GPT_MODELS = [
  {
    name: "GPT-4o",
    id: "gpt-4o",
    description: "Our high-intelligence flagship model for complex, multi-step tasks. GPT-4o is cheaper and faster than GPT-4 Turbo.",
    contextWindow: "128,000 tokens",
    maxOutput: "16,384 tokens",
    trainingData: "Up to Oct 2023",
    version: "gpt-4o-2024-08-06"
  },
  {
    name: "ChatGPT-4o Latest",
    id: "chatgpt-4o-latest",
    description: "Dynamic model continuously updated to the current version of GPT-4o in ChatGPT",
    contextWindow: "128,000 tokens",
    maxOutput: "16,384 tokens",
    trainingData: "Up to Oct 2023",
    researchOnly: true
  },
  {
    name: "GPT-4o mini",
    id: "gpt-4o-mini",
    description: "Our affordable and intelligent small model for fast, lightweight tasks. GPT-4o mini is cheaper and more capable than GPT-3.5 Turbo",
    contextWindow: "128,000 tokens",
    maxOutput: "16,384 tokens",
    trainingData: "Up to Oct 2023",
    version: "gpt-4o-mini-2024-07-18"
  },
  {
    name: "GPT-4 Turbo",
    id: "gpt-4-turbo",
    description: "The latest GPT-4 Turbo model with vision capabilities",
    contextWindow: "128,000 tokens",
    maxOutput: "4,096 tokens",
    trainingData: "Up to Dec 2023",
    version: "gpt-4-turbo-2024-04-09"
  },
  {
    name: "GPT-4",
    id: "gpt-4",
    description: "Base GPT-4 model",
    contextWindow: "8,192 tokens",
    maxOutput: "8,192 tokens",
    trainingData: "Up to Sep 2021",
    version: "gpt-4-0613"
  }
];

const Settings = () => {
  const [selectedModel, setSelectedModel] = useState(GPT_MODELS[0]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await api.get('/user/settings');
      setSelectedModel(response.data.preferred_model);
    } catch (error) {
      toast.error('Failed to fetch user settings');
    }
  };

  const handleModelChange = (event) => {
    const newModelId = event.target.value;
    const newModel = GPT_MODELS.find(model => model.id === newModelId);
    setSelectedModel(newModel);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await api.post('/user/settings', { preferred_model: selectedModel.id });
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="settings-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h2>Settings</h2>
      <div className="setting-group">
        <label htmlFor="model-select">OpenAI Model</label>
        <select
          id="model-select"
          value={selectedModel.id}
          onChange={handleModelChange}
          className="model-select"
        >
          {GPT_MODELS.map(model => (
            <option key={model.id} value={model.id}>
              {model.name} - Context: {model.contextWindow}, Max Output: {model.maxOutput}
            </option>
          ))}
        </select>
      </div>
      {hasChanges && (
        <button 
          onClick={handleSave}
          className="save-button"
        >
          Save Changes
        </button>
      )}
    </div>
  );
};

export default Settings;
