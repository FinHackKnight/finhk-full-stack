# Sidebar Resize Handle Fix

## Issue
The horizontal drag handle for resizing the event list sidebar was not usable when a user clicked on an event to view its details in the EventDetailModal.

## Root Cause
The `EventDetailModal` component was using `absolute inset-0` with `z-50`, which covered the entire sidebar area including the drag handle that was positioned at `z-20`. This made the drag handle unreachable when the modal was open.

## Solution

### 1. Adjusted EventDetailModal Layout
**File**: `/components/event-detail-modal.tsx`

Changed the modal positioning from:
```tsx
className="absolute inset-0 ... z-50"
```

To:
```tsx
className="absolute inset-y-0 left-0 right-2 ... z-10"
```

**Changes**:
- `inset-0` → `inset-y-0 left-0 right-2`: Leaves 2px space on the right for the drag handle
- `z-50` → `z-10`: Matches the sidebar's z-index layer
- Modal now doesn't overlap the drag handle area

### 2. Increased Drag Handle Z-Index
**File**: `/components/map-view.tsx`

Changed the drag handle z-index from:
```tsx
className="... z-20 ..."
```

To:
```tsx
className="... z-50 ..."
```

**Changes**:
- `z-20` → `z-50`: Ensures drag handle is always on top, even when modal is open
- Added `group` class for enhanced hover effects
- Added visual indicator dots that appear on hover

### 3. Enhanced Visual Feedback
Added visual indicator dots to the drag handle:
```tsx
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
  <div className="w-0.5 h-0.5 bg-foreground rounded-full"></div>
  <div className="w-0.5 h-0.5 bg-foreground rounded-full"></div>
  <div className="w-0.5 h-0.5 bg-foreground rounded-full"></div>
</div>
```

**Benefits**:
- Three small dots indicate the drag handle
- Dots become more visible on hover (opacity 50% → 100%)
- Makes it clear the handle is interactive

## Technical Details

### Z-Index Hierarchy (after fix)
- Globe: `z-0`
- Sidebar container: `z-10`
- EventDetailModal: `z-10` (within sidebar)
- Sidebar header elements: `z-10`
- **Drag handle: `z-50`** ✅ (always on top)

### Layout Changes
- Modal content area: Uses `right-2` (8px gap) instead of `right-0`
- This creates visual and functional space for the drag handle
- Modal still covers most of the sidebar for full content display

## Testing
1. ✅ Open the application
2. ✅ Click on any event in the sidebar
3. ✅ Verify EventDetailModal opens
4. ✅ Move mouse to the right edge of the sidebar
5. ✅ Verify cursor changes to resize cursor (col-resize)
6. ✅ Click and drag to resize the sidebar
7. ✅ Verify sidebar resizes while modal is open
8. ✅ Verify visual indicator dots appear on hover

## User Experience Improvements
1. **Consistent Behavior**: Users can resize the sidebar at any time
2. **Visual Clarity**: Dots indicator shows the handle is interactive
3. **Better UX**: No need to close the modal to resize the sidebar
4. **Smooth Transitions**: Hover effects provide visual feedback

## Files Modified
- `/components/event-detail-modal.tsx` - Adjusted positioning and z-index
- `/components/map-view.tsx` - Increased drag handle z-index and added visual indicators

---

**Last Updated**: October 19, 2025
**Issue**: Fixed
**Status**: ✅ Complete
