# Time Machine Feature - Implementation Summary

## Overview
The Time Machine feature allows users to view financial news and events from specific dates by clicking on calendar dates. This feature integrates RSS feeds from Bloomberg and Yahoo Finance to provide historical news data.

## Architecture

### Backend Components

#### 1. RSS Feed API (`/app/api/rss-feeds/route.ts`)
- **Endpoint**: `/api/rss-feeds?date=YYYY-MM-DD`
- **Functionality**:
  - Fetches RSS feeds from Yahoo Finance and Bloomberg
  - Parses XML content using `xml2js` library
  - Filters news by date
  - Returns normalized data structure
- **Response Format**:
  ```json
  {
    "success": true,
    "count": 15,
    "date": "2025-10-19",
    "items": [
      {
        "title": "Article Title",
        "description": "Article description",
        "link": "https://...",
        "pubDate": "2025-10-19T10:30:00Z",
        "formattedDate": "2025-10-19",
        "source": "Yahoo Finance",
        "category": "Markets",
        "guid": "unique-id"
      }
    ]
  }
  ```

### Frontend Components

#### 1. DatePicker (`/components/date-picker.tsx`)
- **Props**: `selectedDate`, `onDateChange`
- **Features**:
  - Calendar-based date selection
  - Visual indicator (Clock icon) when time machine is active
  - Shows "Time Machine active" text when a date is selected
- **Behavior**: When user selects a date, it triggers the Time Machine modal

#### 2. TimeMachineModal (`/components/time-machine-modal.tsx`)
- **Props**: `selectedDate`, `onClose`
- **Features**:
  - Full-screen modal overlay
  - Displays news articles from the selected date
  - Auto-fetches RSS data when date changes
  - Loading states with spinning clock icon
  - Error handling with retry option
  - Empty state when no news found
  - Article cards with:
    - Title
    - Description (HTML stripped)
    - Source badge
    - Category badge (if available)
    - Publication time
    - External link icon
  - Click to open article in new tab
  - Refresh button to reload data
  - Article count and source badges at top
- **Styling**: 
  - Glass morphism design (backdrop-blur)
  - Animated article cards with staggered entrance
  - Responsive layout

#### 3. MapView (`/components/map-view.tsx`)
- **Integration**:
  - Added state: `timeMachineDate`
  - Handler: `handleDateSelect()` - Opens Time Machine when date selected
  - Handler: `handleCloseTimeMachine()` - Closes modal
  - Renders `<TimeMachineModal>` when date is selected

### Hooks

#### useRSSFeeds (`/lib/hooks/use-rss-feeds.ts`)
- **Returns**: `{ items, loading, error, fetchByDate }`
- **Functions**:
  - `fetchByDate(date: string)`: Fetches RSS feeds for specific date
- **State Management**:
  - Manages loading state
  - Error handling
  - Items array

## User Flow

1. **Date Selection**:
   - User clicks on DatePicker button in sidebar
   - Calendar popup appears
   - User selects a date

2. **Time Machine Activation**:
   - DatePicker shows "Time Machine active" indicator
   - Time Machine modal opens automatically
   - Modal displays selected date in human-readable format

3. **News Loading**:
   - Modal shows loading spinner with "Traveling through time..." message
   - RSS feeds API is called with selected date
   - Articles are fetched and parsed

4. **News Display**:
   - Articles appear with staggered animation
   - Each card shows title, description, source, category, and time
   - User can click any article to open in new tab

5. **Interaction Options**:
   - **Refresh**: Reload news for the same date
   - **Close**: Exit Time Machine and return to map view
   - **Retry**: If error occurred, attempt to fetch again

## Technical Details

### Dependencies Installed
```json
{
  "xml2js": "^0.6.2",
  "@types/xml2js": "^0.4.14",
  "@types/three": "^0.180.0",
  "framer-motion": "^12.23.24"
}
```

### Date Handling
- API expects: `YYYY-MM-DD` format
- Filters RSS items within 24-hour window of selected date
- Timezone-aware date comparisons
- Formatted display: "Monday, October 19, 2025"

### RSS Sources
Currently configured:
- Yahoo Finance (`https://finance.yahoo.com/news/rssindex`)
- Bloomberg (commented out due to CORS/auth issues)

To add more sources, update `RSS_FEEDS` object in `/app/api/rss-feeds/route.ts`

### Caching
- RSS API uses Next.js cache: `revalidate: 300` (5 minutes)
- Prevents excessive API calls
- Fresh data every 5 minutes

## Error Handling

1. **Network Errors**: Graceful fallback with error message and retry button
2. **RSS Parse Errors**: Logged but don't crash - continues with other feeds
3. **Empty Results**: Shows "No news found" message with date
4. **Invalid Dates**: Handled by date filter logic

## Future Enhancements

### Recommended Improvements
1. **Add More Sources**:
   - Financial Times RSS
   - Reuters RSS
   - CNBC RSS
   - MarketWatch RSS

2. **Advanced Filtering**:
   - Filter by source
   - Filter by category
   - Search within articles
   - Stock symbol filtering

3. **Data Persistence**:
   - Cache fetched articles in localStorage
   - Offline support
   - Faster subsequent loads

4. **Enhanced UI**:
   - Article images (if available in RSS)
   - Sentiment indicators
   - Related articles grouping
   - Timeline view

5. **Analytics**:
   - Track popular dates
   - Most-read articles
   - User engagement metrics

6. **Export Features**:
   - Download articles as PDF
   - Share article collections
   - Bookmark articles

## Testing the Feature

1. Start the dev server: `pnpm run dev`
2. Navigate to the map view
3. Click the DatePicker in the sidebar
4. Select any date
5. Time Machine modal should open automatically
6. Verify news articles are displayed
7. Click an article to open in new tab
8. Test the refresh button
9. Close modal and verify state resets

## API Endpoints

### GET /api/rss-feeds
**Query Parameters**:
- `date` (optional): YYYY-MM-DD format
- `source` (optional): Filter by source name

**Example**:
```
GET /api/rss-feeds?date=2025-10-19
GET /api/rss-feeds?source=yahoo
```

## File Modifications

### New Files
- `/app/api/rss-feeds/route.ts` - RSS feed API endpoint
- `/components/time-machine-modal.tsx` - Time Machine modal UI
- `/lib/hooks/use-rss-feeds.ts` - RSS data fetching hook
- `/lib/stock-data.ts` - Stock data utilities (supporting file)

### Modified Files
- `/components/date-picker.tsx` - Added time machine indicator
- `/components/map-view.tsx` - Integrated Time Machine modal
- `/package.json` - Added new dependencies

## Known Limitations

1. **Bloomberg Feeds**: Currently commented out due to potential CORS/authentication issues
2. **Historical Data**: RSS feeds may only have recent articles (depends on feed provider)
3. **Rate Limiting**: No built-in rate limiting for API calls
4. **Mobile View**: Modal may need responsive adjustments for small screens

## Security Considerations

1. RSS URLs are hardcoded server-side (not user input)
2. HTML in descriptions is stripped before display
3. External links open in new tabs with proper security
4. No sensitive data stored in localStorage

---

**Last Updated**: October 19, 2025
**Version**: 1.0.0
