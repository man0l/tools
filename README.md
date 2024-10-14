# Getting Started with the Application on macOS

This project includes both a React frontend and a Flask backend. Follow these steps to set up and run the application on macOS.

## Prerequisites

- **Homebrew**: A package manager for macOS. Install it using:
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```

- **Node.js and npm**: Install using Homebrew:
  ```bash
  brew install node
  ```

- **Python and pip**: Install using Homebrew:
  ```bash
  brew install python
  ```

- **Flask**: Install Flask using pip:
  ```bash
  pip install flask
  ```

## Setup Instructions

1. **Clone the Repository**:  
   Open Terminal and clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Backend Dependencies**:  
   Use pip to install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Frontend Dependencies**:  
   Use npm to install the Node.js dependencies:
   ```bash
   npm install
   ```

4. **Set Up the Database**:  
   Initialize and migrate the database using Flask-Migrate:
   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```

5. **Set Up Environment Variables**:  
   Create a `.env` file in the root of your project directory and add your OpenAI API key:
   ```plaintext
   OPENAI_API_KEY=your_openai_api_key_here
   ```

6. **Create the Database File**:  
   Create the `storage.db` file in the `instance` directory:
   ```bash
   touch instance/storage.db
   ```

## Running the Application

### Frontend

- **Start the React App**:  
  Run the following command to start the React development server:
  ```bash
  npm start
  ```
  Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Backend

- **Start the Flask Server**:  
  Run the following command to start the Flask backend server:
  ```bash
  python app.py
  ```

## Learn More

- **React**: [React documentation](https://reactjs.org/)
- **Flask**: [Flask documentation](https://flask.palletsprojects.com/)

These instructions should help you set up and run the application on macOS, including setting up the necessary environment variables for the OpenAI API and creating the database file.
