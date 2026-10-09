export const getSportTheme = (sport) => {
  const normalizedSport = sport?.toLowerCase();
  
  switch (normalizedSport) {
    case 'cricket':
      return {
        primary: '#4ade80', // Glowing Green
        secondary: '#0f172a',
        subNavbar: '#1e293b',
        accent: '#4ade80',
        glow: '0 0 15px rgba(74, 222, 128, 0.4)'
      };
    case 'football':
      return {
        primary: '#38bdf8', // Glowing Blue
        secondary: '#0f172a',
        subNavbar: '#1e293b',
        accent: '#38bdf8',
        glow: '0 0 15px rgba(56, 189, 248, 0.4)'
      };
    case 'badminton':
      return {
        primary: '#f472b6', // Glowing Pink
        secondary: '#0f172a',
        subNavbar: '#1e293b',
        accent: '#f472b6',
        glow: '0 0 15px rgba(244, 114, 182, 0.4)'
      };
    case 'basketball':
      return {
        primary: '#fb923c', // Glowing Orange
        secondary: '#0f172a',
        subNavbar: '#1e293b',
        accent: '#fb923c',
        glow: '0 0 15px rgba(251, 146, 60, 0.4)'
      };
    default:
      return {
        primary: '#00ff85', // Default Neon Green
        secondary: '#0f172a',
        subNavbar: '#1e293b',
        accent: '#00ff85',
        glow: '0 0 15px rgba(0, 255, 133, 0.4)'
      };
  }
};

