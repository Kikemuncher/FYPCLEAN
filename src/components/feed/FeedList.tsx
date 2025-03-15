// Improve these functions to allow smooth scrolling but snap on release

// 1. Modified handleWheel to accumulate scrolling (restore continuous scrolling)
const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
  e.preventDefault();
  
  // Record this wheel movement time
  lastWheelMovement.current = Date.now();
  
  // Cancel any pending snap
  if (snapTimeout.current) {
    clearTimeout(snapTimeout.current);
  }
  
  // Pass to detector
  detectTrackpad(e.nativeEvent);
  
  if (isSwipeLocked) return;
  
  const delta = e.deltaY;
  
  // For mouse wheel clicks (not trackpad), immediately navigate
  if (Math.abs(delta) > 40 && !isTrackpadScrolling) {
    if (delta > 0 && currentVideoIndex < VIDEOS.length - 1) {
      // Scrolling down - next video
      setIsSwipeLocked(true);
      setCurrentVideoIndex(currentVideoIndex + 1);
      setSwipeProgress(0);
      setTimeout(() => {
        setIsSwipeLocked(false);
      }, 400);
    } else if (delta < 0 && currentVideoIndex > 0) {
      // Scrolling up - previous video
      setIsSwipeLocked(true);
      setCurrentVideoIndex(currentVideoIndex - 1);
      setSwipeProgress(0);
      setTimeout(() => {
        setIsSwipeLocked(false);
      }, 400);
    }
    return;
  }
  
  // For trackpad - CONTINUOUS SCROLLING RESTORED
  // Apply sensitivity for good response
  const progressDelta = -delta * 1.5;
  
  // ACCUMULATE progress (rather than resetting) for continuous scrolling feel
  let newProgress = swipeProgress + progressDelta;
  
  // Apply resistance at the ends
  if ((currentVideoIndex === 0 && newProgress > 0) || 
      (currentVideoIndex === VIDEOS.length - 1 && newProgress < 0)) {
    newProgress = newProgress * 0.3;
  }
  
  // Clamp maximum progress to reasonable limits
  const maxProgress = containerHeight * 0.5;
  newProgress = Math.max(Math.min(newProgress, maxProgress), -maxProgress);
  
  setSwipeProgress(newProgress);
  
  // Set a snap timeout - ONLY triggers when scrolling stops
  snapTimeout.current = setTimeout(() => {
    // Only snap if we haven't scrolled for a moment
    const timeSinceLastMovement = Date.now() - lastWheelMovement.current;
    if (timeSinceLastMovement >= 150) {
      handleScrollEnd();
    }
  }, 160);
}, [swipeProgress, isSwipeLocked, currentVideoIndex, VIDEOS.length, detectTrackpad, isTrackpadScrolling, containerHeight, handleScrollEnd]);

// 2. Improved handleScrollEnd to make decisions based on position
const handleScrollEnd = useCallback(() => {
  if (isSwipeLocked) return;
  
  setIsSwipeLocked(true);
  
  // If we've moved significantly, make a snap decision
  if (Math.abs(swipeProgress) > containerHeight * 0.2) { // 20% threshold for decision
    if (swipeProgress < 0 && currentVideoIndex < VIDEOS.length - 1) {
      // Scrolled down past threshold - next video
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (swipeProgress > 0 && currentVideoIndex > 0) {
      // Scrolled up past threshold - previous video
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  }
  
  // Always reset progress
  setSwipeProgress(0);
  
  // Unlock after animation completes
  setTimeout(() => {
    setIsSwipeLocked(false);
  }, 450);
}, [isSwipeLocked, swipeProgress, currentVideoIndex, VIDEOS.length, containerHeight]);

// 3. Update useEffect for wheel handler with better detection of mousepad release
useEffect(() => {
  // Other existing code...
  
  // IMPROVED: Better detection of when scrolling has completely stopped
  const wheelHandler = () => {
    // Cancel previous timeouts
    if (wheelTimeout.current) {
      clearTimeout(wheelTimeout.current);
    }
    
    // Update the last wheel movement time
    lastWheelMovement.current = Date.now();
    
    // Set timeout that only triggers on complete stop (mousepad release)
    wheelTimeout.current = setTimeout(() => {
      const timeSinceLastMovement = Date.now() - lastWheelMovement.current;
      // Check if it's been long enough since the last movement (mousepad released)
      if (timeSinceLastMovement >= 150 && !isSwipeLocked && Math.abs(swipeProgress) > 0) {
        handleScrollEnd();
      }
    }, 160); // Slightly longer for better detection of mousepad release
  };
  
  window.addEventListener('wheel', wheelHandler, { passive: false });
  
  // Remove the forceSnapInterval - we want to allow positions between videos while scrolling
  
  // Cleanup...
}, [currentVideoIndex, isMuted, handleScrollEnd, swipeProgress, isSwipeLocked]);

// 4. Also update the transition settings to feel smoother during continuous scrolling
const getTransitionSettings = useCallback(() => {
  if (isSwipeLocked) {
    // Smooth animation when snapping to a video
    return {
      type: "spring",
      stiffness: 500,
      damping: 90,
      duration: 0.45,
      restDelta: 0.0001
    };
  } else if (Math.abs(swipeProgress) > 0) {
    // Responsive movement during active scrolling - more fluid
    return {
      type: "spring",
      stiffness: 800,    // Lower than before for smoother motion
      damping: 50,       // Lower for more fluid scrolling
      duration: 0.1      // Slightly slower for more natural feel
    };
  } else {
    // Default state
    return {
      type: "spring",
      stiffness: 500,
      damping: 90,
      duration: 0.45
    };
  }
}, [isSwipeLocked, swipeProgress]);
