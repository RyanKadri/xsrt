How do I want to send recording data if a user is about to unload the current DOM / JS context? Can be caused by navigation, refresh, closing the browser, etc.

## General Issues

Need to resolve asset fetching and async optimizations before page unloads. Can't do this in the unload handler because the browser will close before they're done.

## Possible Approaches

- sendBeacon (fallback to sync ajax)
    - Low-ish browser support (85%)
    - sendBeacon cannot currently set headers (needed for deflate)
    - Requires refactoring code to optimize mutations as they come in
    - Async optimization work may not complete before unload. Need another fallback potentially

- fetch with keepalive (fallback to sync ajax)
    - Low browser support (No Firefox, Safari, etc.)
    - Probably tricky to feature-detect?
    - Does allow setting headers
    - Same last 2 drawbacks as sendBeacon

- serialize to localStorage and send on next load
    - Easier to store. Sync set in localStorage
    - More reliable to send (can tell if it failed)
    - lose access to dom (and associated fetching optimizations)

 - Optimize on the server side
    - Lose access to dom and optimizations 
    - Potentially don't share the same auth context
    