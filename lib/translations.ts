export type Language = 'en' | 'fr' | 'es'

export const translations = {
  en: {
    welcome: {
      title: 'MoodFlix',
      description: 'Discover movies that match your mood! 🎬',
      feature1: 'Take a selfie and let us analyze your mood',
      feature2: 'Get personalized movie recommendations',
      feature3: 'Find the perfect movie for your current vibe',
      start: 'Let\'s Roll'
    },
    camera: {
      start: 'Take a Photo',
      instructions: 'Center your face in the frame and show us how you feel!',
      error: 'Oops! Camera access failed. Please try again.',
      processing: 'Processing your photo...'
    },
    movies: {
      title: 'Your Movie Matches',
      dominantEmotion: 'Based on your mood:',
      availableOn: 'Available on:',
      generateMore: 'Show Me More Movies!',
      error: 'Could not find movie suggestions. Please try again.'
    },
    buttons: {
      letsRoll: 'Let\'s Roll! 🎬',
      tryAgain: 'Try Again 🔄',
      takePicture: 'Take Picture 📸',
      showMore: 'Show More Movies 🍿'
    }
  },
  fr: {
    welcome: {
      title: 'MoodFlix',
      description: 'Découvrez des films qui correspondent à votre humeur ! 🎬',
      feature1: 'Prenez un selfie et laissez-nous analyser votre humeur',
      feature2: 'Obtenez des recommandations personnalisées',
      feature3: 'Trouvez le film parfait pour votre mood actuel',
      start: 'C\'est Parti'
    },
    camera: {
      start: 'Prendre une Photo',
      instructions: 'Centrez votre visage et montrez-nous votre humeur !',
      error: 'Oups ! L\'accès à la caméra a échoué. Veuillez réessayer.',
      processing: 'Traitement de votre photo...'
    },
    movies: {
      title: 'Vos Films Recommandés',
      dominantEmotion: 'Selon votre humeur :',
      availableOn: 'Disponible sur :',
      generateMore: 'Plus de Films !',
      error: 'Impossible de trouver des suggestions de films. Veuillez réessayer.'
    },
    buttons: {
      letsRoll: 'C\'est Parti ! 🎬',
      tryAgain: 'Réessayer 🔄',
      takePicture: 'Prendre une Photo 📸',
      showMore: 'Plus de Films 🍿'
    }
  },
  es: {
    welcome: {
      title: 'MoodFlix',
      description: '¡Descubre películas que coincidan con tu estado de ánimo! 🎬',
      feature1: 'Toma un selfie y deja que analicemos tu humor',
      feature2: 'Obtén recomendaciones personalizadas',
      feature3: 'Encuentra la película perfecta para tu mood actual',
      start: 'Empecemos'
    },
    camera: {
      start: 'Tomar Foto',
      instructions: '¡Centra tu cara y muéstranos cómo te sientes!',
      error: '¡Ups! El acceso a la cámara falló. Por favor, inténtalo de nuevo.',
      processing: 'Procesando tu foto...'
    },
    movies: {
      title: 'Tus Películas Recomendadas',
      dominantEmotion: 'Según tu estado de ánimo:',
      availableOn: 'Disponible en:',
      generateMore: '¡Más Películas!',
      error: 'No se pudieron encontrar sugerencias de películas. Por favor, inténtalo de nuevo.'
    },
    buttons: {
      letsRoll: '¡Empecemos! 🎬',
      tryAgain: 'Intentar de Nuevo 🔄',
      takePicture: 'Tomar Foto 📸',
      showMore: 'Más Películas 🍿'
    }
  }
} 