export const rainConfig = {
  // Hur låg sannolikhet vi vill upptäcka
  detectionThreshold: 10,

  // Gränser för hur risken beskrivs i UI:t
  riskLevels: {
    veryLow: 10,
    low: 30,
    moderate: 50,
    high: 80,
  },

  // Hur långt mellan prognospunkter vi accepterar
  // innan vi delar upp en regnperiod
  maxGapHours: 3,
};