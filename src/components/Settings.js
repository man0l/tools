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
  const [apiKey, setApiKey] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [validatingKey, setValidatingKey] = useState(false);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await api.get('/user/settings');
      setSelectedModel(GPT_MODELS.find(model => model.id === response.data.preferred_model) || GPT_MODELS[0]);
      setApiKey(response.data.openai_api_key || '');
    } catch (error) {
      toast.error('Failed to fetch user settings');
    }
  };

  const validateApiKey = async (key) => {
    try {
      const response = await api.post('/user/validate-api-key', { api_key: key });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  };

  const handleModelChange = (event) => {
    const newModelId = event.target.value;
    const newModel = GPT_MODELS.find(model => model.id === newModelId);
    setSelectedModel(newModel);
    setHasChanges(true);
  };

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (apiKey) {
      setValidatingKey(true);
      const isValid = await validateApiKey(apiKey);
      setValidatingKey(false);

      if (!isValid) {
        toast.error('Invalid OpenAI API key');
        return;
      }
    }

    try {
      await api.post('/user/settings', {
        preferred_model: selectedModel.id,
        openai_api_key: apiKey
      });
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="settings-container">
      <ToastContainer />
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

      <div className="setting-group">
        <label htmlFor="api-key">OpenAI API Key</label>
        <input
          type="password"
          id="api-key"
          value={apiKey}
          onChange={handleApiKeyChange}
          className="api-key-input"
          placeholder="sk-..."
        />
      </div>

      {hasChanges && (
        <button 
          onClick={handleSave}
          className="save-button"
          disabled={validatingKey}
        >
          {validatingKey ? 'Validating...' : 'Save Changes'}
        </button>
      )}
    </div>
  );
};

export default Settings;
