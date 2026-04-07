// Test Data Generator for Unwind Journal
// Run this script in the browser console to populate your journal with test data

(function generateTestData() {
  const testEntries = [
    {
      content: "Today was really productive! I finished the project I've been working on for weeks. The client loved the design and we're moving forward with implementation. Feeling accomplished and excited about what's next.",
      mood: "happy",
      emoji: "happy",
      dateOffset: 0 // Today
    },
    {
      content: "Had a deep conversation with an old friend today. It's amazing how some connections just stand the test of time. We talked about our dreams, fears, and how much we've grown since college. Grateful for these moments of genuine connection.",
      mood: "thoughtful",
      emoji: "thoughtful",
      dateOffset: -1 // Yesterday
    },
    {
      content: "Work was stressful today. Deadlines are piling up and I feel like I'm drowning in tasks. Took a walk during lunch to clear my head and it helped a bit. Tomorrow will be better.",
      mood: "anxious",
      emoji: "anxious",
      dateOffset: -2 // 2 days ago
    },
    {
      content: "Spent the evening reading a book I've been meaning to finish. There's something magical about getting lost in a story. Made myself a cup of tea and just enjoyed the quiet moment. Simple pleasures are the best.",
      mood: "calm",
      emoji: "calm",
      dateOffset: -3 // 3 days ago
    },
    {
      content: "Big presentation today! I was nervous but it went really well. My boss said it was one of the best presentations she's seen. The team was supportive and everything clicked. Celebrated with lunch at my favorite cafe.",
      mood: "excited",
      emoji: "excited",
      dateOffset: -5 // 5 days ago
    },
    {
      content: "Feeling a bit melancholic today. Sometimes memories hit you unexpectedly. Found old photos and spent the afternoon reminiscing. It's beautiful to look back but also reminds me how much things change.",
      mood: "sad",
      emoji: "sad",
      dateOffset: -7 // 1 week ago
    },
    {
      content: "Weekend adventure! Went hiking on a trail I've never explored before. The views were breathtaking and the fresh air was exactly what I needed. Nature has a way of putting everything into perspective.",
      mood: "happy",
      emoji: "happy",
      dateOffset: -8 // 8 days ago
    },
    {
      content: "Productive morning workout followed by a healthy breakfast. I'm trying to build better habits and it's starting to feel natural. Small changes really do make a big difference over time.",
      mood: "motivated",
      emoji: "motivated",
      dateOffset: -10 // 10 days ago
    },
    {
      content: "Had a creative breakthrough today! Been stuck on a problem for days and suddenly the solution just clicked. Those 'aha!' moments are the best. Can't wait to implement this new idea.",
      mood: "excited",
      emoji: "excited",
      dateOffset: -12 // 12 days ago
    },
    {
      content: "Quiet evening reflecting on the past month. So much has happened, both good and challenging. Growth isn't always comfortable, but looking back, I can see how far I've come. Ready for whatever comes next.",
      mood: "thoughtful",
      emoji: "thoughtful",
      dateOffset: -14 // 2 weeks ago
    },
    {
      content: "Family dinner tonight! Everyone gathered at my place and we cooked together. So much laughter and good food. These moments remind me what's truly important in life.",
      mood: "happy",
      emoji: "happy",
      dateOffset: -16 // 16 days ago
    },
    {
      content: "Feeling overwhelmed with all the things I need to do. Sometimes it feels like there aren't enough hours in the day. Taking it one step at a time and trying to be kind to myself.",
      mood: "anxious",
      emoji: "anxious",
      dateOffset: -18 // 18 days ago
    },
    {
      content: "Watched the sunrise this morning. There's something peaceful about being awake while the rest of the world is still sleeping. The colors were incredible - pinks, oranges, and purples painting the sky.",
      mood: "calm",
      emoji: "calm",
      dateOffset: -20 // 20 days ago
    },
    {
      content: "Mistakes were made today, but that's okay. I'm learning to be less hard on myself when things don't go perfectly. Every misstep is a learning opportunity. Tomorrow is a new chance to do better.",
      mood: "thoughtful",
      emoji: "thoughtful",
      dateOffset: -22 // 22 days ago
    },
    {
      content: "Completed a challenging project at work! It pushed me out of my comfort zone and I learned so much. My confidence is growing and I'm proud of what I accomplished.",
      mood: "excited",
      emoji: "excited",
      dateOffset: -25 // 25 days ago
    }
  ];

  // Function to create entries with specific dates
  function createTestEntry(entry, offset) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    date.setHours(Math.floor(Math.random() * 12) + 8); // Random hour between 8 AM and 8 PM
    date.setMinutes(Math.floor(Math.random() * 60));
    
    // Map text moods to emoji moods used in the app
    const moodEmojiMap = {
      "happy": "happy",
      "thoughtful": "thoughtful", 
      "anxious": "anxious",
      "calm": "calm",
      "excited": "excited",
      "sad": "sad",
      "motivated": "motivated"
    };
    
    return {
      id: crypto.randomUUID(),
      content: entry.content,
      mood: moodEmojiMap[entry.emoji] || "happy",
      createdAt: date.toISOString(),
      updatedAt: date.toISOString()
    };
  }

  // Generate all test entries
  const generatedEntries = testEntries.map(entry => createTestEntry(entry, entry.dateOffset));

  // Load existing entries
  let existingEntries = [];
  try {
    const stored = localStorage.getItem("unwind-journal-entries");
    if (stored) {
      existingEntries = JSON.parse(stored);
    }
  } catch (error) {
    console.log("No existing entries found, starting fresh");
  }

  // Combine existing with test entries
  const allEntries = [...generatedEntries, ...existingEntries];

  // Sort by date (newest first)
  allEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Save to localStorage
  localStorage.setItem("unwind-journal-entries", JSON.stringify(allEntries));

  console.log(`Generated ${generatedEntries.length} test entries spanning 25 days`);
  console.log("Total entries in journal:", allEntries.length);
  console.log("Refresh the page to see the test data!");
  
  return generatedEntries;
})();
