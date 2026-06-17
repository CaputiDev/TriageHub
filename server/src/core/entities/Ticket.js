export const STRESS_KEYWORDS = ['procon', 'cancelar', 'urgente', 'ruim', 'advogado'];

export class Ticket {
  static realizarTriagem(description) {
    const textLower = description.toLowerCase();
    const keywordsEncontradas = STRESS_KEYWORDS.filter(keyword => textLower.includes(keyword));
    const isStress = keywordsEncontradas.length > 0;

    if (isStress) {
      const priority = Math.random() > 0.5 ? 'critical' : 'high';
      return { priority, stressLevel: 5, detectedKeywords: keywordsEncontradas };
    } else {
      const priority = Math.random() > 0.5 ? 'medium' : 'low';
      const stressLevel = Math.floor(Math.random() * 3) + 1; // 1 a 3
      return { priority, stressLevel, detectedKeywords: [] };
    }
  }
}
