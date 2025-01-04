# MoodFlix 🎬

MoodFlix is a magical movie recommendation app that suggests films based on your emotional state, captured through your webcam! Using advanced AI technology, it analyzes your facial expressions and curates a personalized list of movies that match or complement your current mood.

## Features ✨

- 📸 Real-time emotion detection through webcam
- 🎯 Personalized movie recommendations based on your mood
- 🌍 Multilingual support (English, French, Spanish)
- 🎨 Beautiful, responsive UI with dark/light mode
- ✨ Delightful animations and interactions
- 🎬 Movie details including streaming platforms

## Tech Stack 🛠️

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Face++ API for emotion detection
- Google Gemini API for movie recommendations
- OMDB API for movie details

## Getting Started 🚀

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/moodflix.git
   cd moodflix
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your API keys:
     - Face++ API credentials
     - Google Gemini API key
     - OMDB API key

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables 🔑

Create a `.env` file with the following variables:

```env
FACE_API_KEY=your_face_api_key_here
FACE_API_SECRET=your_face_api_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
OMDB_API_KEY=your_omdb_api_key_here
```

## Deployment 🌐

The app is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel's project settings
4. Deploy!

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 