// Small, static feature gates - flip a value here rather than deleting the code it guards.
// Consumed already has enough volume to justify its Year/Month filters, so it is not gated here.

// Blog, TIL, Projects and Newsletter each got a Year/Month filter built alongside the Consumed
// rebuild, but none of them have enough content yet for the filter to do anything useful - most
// buttons would just show "1 item" or sit empty. The filtering logic and UI stay in place; this
// flag just keeps them hidden until each page has enough volume across enough years/months to be
// worth the extra control. Flip to true (or split per page if one grows faster than the others)
// once that changes.
export const CONTENT_YEAR_MONTH_FILTERS = false
