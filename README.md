# Gau Gyan - AI Animal Classification

This is a Next.js application that uses AI to analyze images of cattle and buffalo, providing an Animal Type Classification (ATC) score and other key traits for dairy farming. This project was prototyped in Firebase Studio.

## Features

- **Image Upload**: Upload images of animals for analysis.
- **AI-Powered Analysis**: The app uses a generative AI model to extract key physical traits from the image, such as body length, chest width, and udder shape.
- **ATC Scoring**: Based on the extracted traits, an overall Animal Type Classification (ATC) score is generated.
- **Trait Identification**: The AI also identifies the animal's breed and assesses its suitability for breeding.
- **Scorecard**: The results are displayed in a comprehensive scorecard, which can be downloaded as a report.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository** (or download the code):
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Environment Variables

The application uses Google's Generative AI models. To enable this, you need to provide an API key.

1.  Create a new file named `.env.local` in the root of your project.
2.  Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  Add the following line to your `.env.local` file, replacing `<your-api-key>` with the key you obtained:

    ```
    GEMINI_API_KEY=<your-api-key>
    ```

### Running the Application

1.  **Start the development server**:
    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to [http://localhost:9003](http://localhost:9003) to see the application in action.

## How It Works

1.  **Upload**: On the main page, upload an image of a cow or buffalo.
2.  **Analyze**: Click the "Analyze" button to send the image to the AI model.
3.  **View Results**: The application will process the image and display a detailed scorecard with the ATC score, extracted traits, breed identification, and breeding suitability.
4.  **Download**: You can download a printable PDF report of the analysis.
