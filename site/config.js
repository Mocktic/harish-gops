// All invitation content lives here. Edit this file to change names, the event or the timing.

export default {
  bride: { name: 'Gopika', ta: 'கோபிகா', home: 'Chennai', homeTa: 'சென்னை' },
  groom: { name: 'Harish', ta: 'ஹரீஷ்', home: 'Trichy', homeTa: 'திருச்சி' },

  event: {
    title: 'Reception',
    titleTa: 'திருமண வரவேற்பு',
    date: '2027-01-19',
    // 24-hour IST. Only the countdown uses it. PLACEHOLDER until the reception time is confirmed.
    start: '19:00',
    venue: 'The Savera',
    area: 'Mylapore, Chennai',
    map: 'https://maps.app.goo.gl/kBxr4ChZmVJtroEg8',
  },

  // Seconds each chapter plays: Trichy → Chennai (names) → The Savera (save the date).
  // After the last one the invite stays on the Save the Date screen.
  chapters: [4, 4.5, 5],

  musicVolume: 0.85,
};
