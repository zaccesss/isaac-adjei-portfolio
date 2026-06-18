// I store the music section data: featured artists and genre constants.

export const artists: { name: string; genre: string; note: string; youtubeId?: string }[] = [
  { name: "Dave (Santan Dave)", genre: "UK Rap / Spoken Word", note: "My most-played artist this year. Chapter 16, Affection, The Boy Who Played the Harp and the Power 106 freestyle are all on repeat.", youtubeId: "-q66T2dNml0" },
  { name: "Central Cee",        genre: "UK Rap",               note: "Limitless is an incredible video. The production is clean.",                                                                             youtubeId: "Ag2fJaNbw3Q" },
  { name: "Jim Legxacy",        genre: "UK Rap",               note: "The 3x collab with Dave is different. Real artistry.",                                                                                   youtubeId: "wkZC8oE8R7M" },
]

export const genres: { label: string; description: string; color: string }[] = [
  { label: "Gospel and CCM",         description: "What I start most mornings with. Keeps me grounded when everything else is loud.",        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { label: "Afrobeats and Highlife", description: "Ghana in my veins. CULTUR FM, hometown sounds, the full culture.",                       color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  { label: "UK Rap",                 description: "Dave, Central Cee, Jim Legxacy. London music for a London-based life.",                  color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  { label: "Lo-fi",                  description: "The background for every deep work session. Pairs with the study videos above.",          color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  { label: "Piano",                  description: "Learning and listening. Chopin, cinematic pieces and whatever I find to practise.",       color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
]
