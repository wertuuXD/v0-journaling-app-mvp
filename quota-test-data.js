// localStorage Quota Test Data Generator
// Run this script to fill localStorage and test quota handling

(function generateQuotaTestData() {
  console.log("Starting localStorage quota test...");
  
  // Generate large text content to quickly fill storage
  const generateLargeContent = (sizeKB = 50) => {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ";
    
    let content = "";
    const targetSize = sizeKB * 1024; // Convert KB to bytes
    while (content.length < targetSize) {
      content += lorem + "\n\n";
    }
    return content.substring(0, targetSize);
  };

  const testEntries = [
    {
      content: generateLargeContent(100), // 100KB entry
      mood: "thoughtful",
      emoji: "thoughtful",
      dateOffset: 0
    },
    {
      content: generateLargeContent(150), // 150KB entry
      mood: "anxious",
      emoji: "anxious", 
      dateOffset: -1
    },
    {
      content: generateLargeContent(200), // 200KB entry
      mood: "calm",
      emoji: "calm",
      dateOffset: -2
    },
    {
      content: generateLargeContent(250), // 250KB entry
      mood: "happy",
      emoji: "happy",
      dateOffset: -3
    },
    {
      content: generateLargeContent(300), // 300KB entry
      mood: "excited",
      emoji: "excited",
      dateOffset: -4
    },
    {
      content: generateLargeContent(400), // 400KB entry
      mood: "sad",
      emoji: "sad",
      dateOffset: -5
    },
    {
      content: generateLargeContent(500), // 500KB entry
      mood: "motivated",
      emoji: "motivated",
      dateOffset: -6
    },
    {
      content: generateLargeContent(600), // 600KB entry
      mood: "happy",
      emoji: "happy",
      dateOffset: -7
    },
    {
      content: generateLargeContent(800), // 800KB entry
      mood: "thoughtful",
      emoji: "thoughtful",
      dateOffset: -8
    },
    {
      content: generateLargeContent(1000), // 1MB entry
      mood: "calm",
      emoji: "calm",
      dateOffset: -9
    }
  ];

  function createTestEntry(entry, dateOffset) {
  const date = new Date();
  date.setDate(date.getDate() + dateOffset);
  date.setHours(Math.floor(Math.random() * 12) + 8);
  date.setMinutes(Math.floor(Math.random() * 60));
  
  return {
    id: crypto.randomUUID(),
    content: entry.content,
    mood: entry.emoji,
    createdAt: date.toISOString(),
    updatedAt: date.toISOString()
  };
}

  // Load existing entries
  let existingEntries = [];
  try {
    const stored = localStorage.getItem("unwind-journal-entries");
    if (stored) {
      existingEntries = JSON.parse(stored);
    }
  } catch (error) {
    console.log("No existing entries found");
  }

  // Generate large test entries
  const generatedEntries = testEntries.map(entry => createTestEntry(entry, entry.dateOffset));
  
  // Combine with existing entries
  const allEntries = [...generatedEntries, ...existingEntries];
  
  // Sort by date (newest first)
  allEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Calculate total storage size
  const dataStr = JSON.stringify(allEntries);
  const storageSize = new Blob([dataStr]).size;
  const storageSizeMB = (storageSize / (1024 * 1024)).toFixed(2);
  
  // Save to localStorage
  try {
    localStorage.setItem("unwind-journal-entries", dataStr);
    
    console.log(`Generated ${generatedEntries.length} large test entries`);
    console.log(`Total entries: ${allEntries.length}`);
    console.log(`Storage used: ${storageSizeMB} MB`);
    console.log(`Storage quota: 5.00 MB`);
    console.log(`Remaining: ${(5 - parseFloat(storageSizeMB)).toFixed(2)} MB`);
    
    // Check quota status
    if (storageSize > 5 * 1024 * 1024) {
      console.log("QUOTA EXCEEDED - This should trigger error handling");
    } else if (storageSize > 4 * 1024 * 1024) {
      console.log("WARNING - Approaching quota limit (80%+ used)");
    } else {
      console.log("OK - Within safe storage limits");
    }
    
    console.log("Refresh the page to see the quota handling in action!");
    console.log("Try creating a new entry to test quota warnings/errors");
    
  } catch (error) {
    console.error("Failed to save test data:", error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.log("QUOTA EXCEEDED ERROR - Test successful!");
    }
  }
  
  return {
    entriesGenerated: generatedEntries.length,
    totalEntries: allEntries.length,
    storageSizeMB: parseFloat(storageSizeMB),
    quotaStatus: storageSize > 5 * 1024 * 1024 ? 'EXCEEDED' : 
                  storageSize > 4 * 1024 * 1024 ? 'WARNING' : 'OK'
  };
})();
