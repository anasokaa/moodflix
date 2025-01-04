export type Language = 'en' | 'fr' | 'es'

export const translations = {
  en: {
    language: {
      select: 'Select language',
      en: 'English',
      fr: 'French',
      es: 'Spanish'
    },
    welcome: {
      title: 'MoodFlix',
      subtitle: 'Your Magical Movie Matchmaker! ✨',
      description: "Let's turn that mood into movie magic! 🎬 Snap a selfie and we'll find your perfect movie match."
    },
    camera: {
      start: 'Start Camera',
      error: 'Camera access denied. Please allow camera access and try again.',
      instructions: 'Position your face in the frame and smile! The photo will be taken automatically after the countdown.'
    },
    loading: {
      analyzing: 'Analyzing your mood... 🎭',
      regenerating: 'Finding more movies... 🎬'
    },
    movies: {
      title: 'Your Movie Matches! 🎬',
      error: 'Could not find movie suggestions. Please try again.',
      dominantEmotion: 'Dominant emotion:',
      availableOn: 'Available on:',
      generateMore: 'Generate More Movies',
      noMovies: 'No movies found. Please try again.'
    },
    buttons: {
      letsRoll: "Let's Roll! 🎲 ⭐",
      tryAgain: 'Try Again',
      back: 'Back'
    }
  },
  fr: {
    language: {
      select: 'Choisir la langue',
      en: 'Anglais',
      fr: 'Français',
      es: 'Espagnol'
    },
    welcome: {
      title: 'MoodFlix',
      subtitle: 'Votre Magicien du Cinéma! ✨',
      description: 'Transformons votre humeur en magie cinématographique! 🎬 Prenez un selfie et nous trouverons vos films parfaits.'
    },
    camera: {
      start: 'Démarrer la Caméra',
      error: "Accès à la caméra refusé. Veuillez autoriser l'accès et réessayer.",
      instructions: 'Placez votre visage dans le cadre et souriez! La photo sera prise automatiquement après le compte à rebours.'
    },
    loading: {
      analyzing: 'Analyse de votre humeur... 🎭',
      regenerating: 'Recherche de nouveaux films... 🎬'
    },
    movies: {
      title: 'Vos Films Recommandés! 🎬',
      error: 'Impossible de trouver des suggestions de films. Veuillez réessayer.',
      dominantEmotion: 'Émotion dominante:',
      availableOn: 'Disponible sur:',
      generateMore: 'Plus de Films',
      noMovies: 'Aucun film trouvé. Veuillez réessayer.'
    },
    buttons: {
      letsRoll: 'Allons-y! 🎲 ⭐',
      tryAgain: 'Réessayer',
      back: 'Retour'
    }
  },
  es: {
    language: {
      select: 'Seleccionar idioma',
      en: 'Inglés',
      fr: 'Francés',
      es: 'Español'
    },
    welcome: {
      title: 'MoodFlix',
      subtitle: '¡Tu Mago del Cine! ✨',
      description: '¡Convirtamos ese estado de ánimo en magia cinematográfica! 🎬 Toma un selfie y encontraremos tus películas perfectas.'
    },
    camera: {
      start: 'Iniciar Cámara',
      error: 'Acceso a la cámara denegado. Por favor, permite el acceso e inténtalo de nuevo.',
      instructions: '¡Coloca tu rostro en el marco y sonríe! La foto se tomará automáticamente después de la cuenta regresiva.'
    },
    loading: {
      analyzing: 'Analizando tu estado de ánimo... 🎭',
      regenerating: 'Buscando más películas... 🎬'
    },
    movies: {
      title: '¡Tus Películas Recomendadas! 🎬',
      error: 'No se pudieron encontrar sugerencias de películas. Por favor, inténtalo de nuevo.',
      dominantEmotion: 'Emoción dominante:',
      availableOn: 'Disponible en:',
      generateMore: 'Más Películas',
      noMovies: 'No se encontraron películas. Por favor, inténtalo de nuevo.'
    },
    buttons: {
      letsRoll: '¡Vamos! 🎲 ⭐',
      tryAgain: 'Intentar de Nuevo',
      back: 'Volver'
    }
  }
} 