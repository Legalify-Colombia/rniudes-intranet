
// Utility functions for position validation and management
export const VALID_POSITIONS = [
  'Director DRNI',
  'Coordinador de Campus', 
  'Director de Programa',
  'Gestor de Internacionalización'
] as const;

export type Position = typeof VALID_POSITIONS[number];

export const validatePosition = (position: unknown): position is Position => {
  return typeof position === 'string' && 
         position.trim().length > 0 && 
         VALID_POSITIONS.includes(position.trim() as Position);
};

export const getValidPositions = (): Position[] => {
  // Return a clean copy with strict validation to prevent empty strings
  return VALID_POSITIONS.filter(position => 
    position && 
    typeof position === 'string' && 
    position.trim().length > 0 &&
    validatePosition(position)
  );
};

export const getRoleFromPosition = (position: string): string => {
  if (!validatePosition(position)) {
    console.log('positionUtils - getRoleFromPosition: Invalid position:', position);
    return '';
  }
  
  switch (position.trim()) {
    case 'Director DRNI':
    case 'Coordinador de Campus':
      return 'Administrador';
    case 'Director de Programa':
      return 'Coordinador';
    case 'Gestor de Internacionalización':
      return 'Gestor';
    default:
      console.log('positionUtils - getRoleFromPosition: Unknown position:', position);
      return '';
  }
};
