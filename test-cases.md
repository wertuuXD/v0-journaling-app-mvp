# Unwind Journal App - Test Cases

## Test Case 1: Core Journaling Workflow
**Objective**: Verify basic journal entry creation, editing, and deletion

### Test Steps:
1. **Create Entry**
   - Click "New entry" button (pen icon)
   - Write test content: "Today was a productive day at work"
   - Select mood: Happy (emoji)
   - Save using Ctrl+Enter or Save button
   - Verify entry appears in timeline

2. **Edit Entry**
   - Click on the newly created entry in timeline
   - Modify content: "Today was a productive day at work. Finished the project!"
   - Change mood to different emoji
   - Save changes
   - Verify updates appear in timeline

3. **Delete Entry**
   - Open the entry again
   - Click delete button
   - Confirm deletion
   - Verify entry is removed from timeline

### Expected Results:
- Entries save correctly with mood and timestamp
- Edits preserve original ID but update timestamp
- Deletion removes entry permanently
- Timeline updates reflect all changes immediately

---

## Test Case 2: Search and Filter Functionality
**Objective**: Test search capabilities and mood-based filtering

### Test Steps:
1. **Text Search**
   - Create multiple entries with different content
   - Go to timeline view
   - Search for specific words from entries
   - Verify search results highlight matching entries
   - Test with partial words and case sensitivity

2. **Mood Search**
   - Create entries with different moods (happy, sad, anxious, etc.)
   - Click on mood emojis in search
   - Verify only entries with that mood appear
   - Test mood filtering combined with text search

3. **Search Edge Cases**
   - Search for non-existent terms
   - Search with empty query
   - Search with special characters
   - Verify empty state handling

### Expected Results:
- Search returns relevant entries quickly
- Mood filtering works independently and combined
- Empty states show helpful messages
- Search is case-insensitive and handles partial matches

---

## Test Case 3: Import/Export Functionality
**Objective**: Test data backup and restore capabilities

### Test Steps:
1. **Export JSON**
   - Create 5+ test entries with different dates and moods
   - Go to Settings (gear icon)
   - Click "Backup JSON"
   - Verify file downloads with correct format
   - Check JSON structure in text editor

2. **Export Date Range**
   - Use date picker to select specific date range
   - Export filtered entries as JSON, PDF, and Text
   - Verify exported files contain only entries from selected range
   - Test with single day and multi-day ranges

3. **Import Data**
   - Clear existing data (localStorage clear)
   - Import the previously exported JSON file
   - Verify all entries restore correctly
   - Test importing duplicate entries (should merge, not duplicate)

4. **Import Edge Cases**
   - Try importing invalid JSON
   - Try importing empty file
   - Try importing file with missing required fields
   - Verify error handling

### Expected Results:
- Export files contain proper data structure
- Date filtering works correctly
- Import restores data without duplicates
- Invalid imports are handled gracefully with user feedback

---

## Test Case 4: UI/UX and Responsive Design
**Objective**: Test user interface across different devices and interactions

### Test Steps:
1. **Desktop Experience**
   - Test all navigation buttons (write, timeline, settings)
   - Verify hover states and transitions
   - Test keyboard navigation (Tab, Enter, Escape)
   - Check dark/light theme toggle functionality

2. **Mobile Experience**
   - Resize browser to mobile width (< 768px)
   - Test touch interactions and button sizes
   - Verify responsive layout and text readability
   - Test mobile keyboard interactions

3. **Accessibility**
   - Test with screen reader (if available)
   - Verify ARIA labels and semantic HTML
   - Test keyboard-only navigation
   - Check color contrast ratios

4. **Visual Design**
   - Verify consistent spacing and typography
   - Test loading states and animations
   - Check empty states and micro-interactions
   - Verify theme consistency across all views

### Expected Results:
- Smooth transitions and micro-interactions
- Fully functional mobile experience
- Proper accessibility support
- Consistent visual design

---

## Test Case 5: Data Persistence and Edge Cases
**Objective**: Test data storage, performance, and error handling

### Test Steps:
1. **Data Persistence**
   - Create entries and refresh page
   - Close browser and reopen
   - Verify data persists across sessions
   - Test with different browsers (Chrome, Firefox, Brave)

2. **Performance Testing**
   - Create 100+ test entries using script
   - Test timeline scrolling performance
   - Test search performance with large dataset
   - Verify memory usage doesn't grow excessively

3. **Storage Limits**
   - Fill localStorage near capacity (5MB limit)
   - Test behavior when storage is full
   - Verify graceful degradation
   - Test quota exceeded error handling

4. **Error Scenarios**
   - Test with corrupted localStorage data
   - Test with disabled localStorage
   - Test network failures during export
   - Verify error boundaries prevent app crashes

### Expected Results:
- Data persists reliably across sessions
- Performance remains good with large datasets
- Storage limits are handled gracefully
- Error scenarios don't crash the app

---

## Test Execution Checklist

### Pre-Test Setup:
- [ ] Clear existing data: `localStorage.removeItem("unwind-journal-entries")`
- [ ] Generate test data with multiple dates and moods
- [ ] Open developer tools for console monitoring
- [ ] Have test files ready for import/export testing

### During Testing:
- [ ] Document any bugs or unexpected behavior
- [ ] Take screenshots of UI issues
- [ ] Note performance bottlenecks
- [ ] Record error messages from console

### Post-Test:
- [ ] Summarize findings
- [ ] Prioritize bugs by severity
- [ ] Create improvement recommendations
- [ ] Update test cases based on findings

---

## Automated Testing Script (Optional)

```javascript
// Automated test runner for basic functionality
(function runTests() {
  console.log("Starting Unwind Journal automated tests...");
  
  // Test 1: Create entry
  console.log("Test 1: Creating entry...");
  // Add automated test code here
  
  // Test 2: Search functionality
  console.log("Test 2: Testing search...");
  // Add automated test code here
  
  // Test 3: Export/Import
  console.log("Test 3: Testing export/import...");
  // Add automated test code here
  
  console.log("Automated tests completed!");
})();
```

These test cases cover the core functionality and edge cases of your Unwind journal app. Run through each test case systematically to identify any issues before expanding features.
