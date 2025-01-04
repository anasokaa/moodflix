# MoodFlix 🎬

MoodFlix is an AI-powered movie recommendation app that suggests movies based on your mood! Simply take a selfie, and let our AI analyze your emotions to find the perfect movies for you.

## Features ✨

- 📸 Emotion detection through selfies
- 🎯 Personalized movie recommendations
- 🌍 Multi-language support (English & French)
- 🎨 Beautiful, responsive UI
- 🎭 Real-time emotion analysis
- 🍿 Direct links to streaming platforms

## Tech Stack 🛠️

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Face++ API
- Google Gemini API
- OMDB API

## Getting Started 🚀

1. Clone the repository:
   ```bash
   git clone https://github.com/anasokaa/moodflix.git
   cd moodflix
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.example` and add your API keys:
   ```env
   FACE_API_KEY=your_face_api_key
   FACE_API_SECRET=your_face_api_secret
   GEMINI_API_KEY=your_gemini_api_key
   OMDB_API_KEY=your_omdb_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment 🌐

### Deploying to Vercel

1. Fork this repository
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your forked repository
4. Add the following environment variables in Vercel:
   - `FACE_API_KEY`
   - `FACE_API_SECRET`
   - `GEMINI_API_KEY`
   - `OMDB_API_KEY`
5. Deploy!

## Contributing 🤝

Contributions are welcome! Feel free to open issues and pull requests.

## License 📄

MIT License - feel free to use this project for learning and development! 