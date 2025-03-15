// Updated scrolling implementation for FeedList.tsx

// 1. Modified handleScrollEnd function to ensure videos always snap properly
const handleScrollEnd = useCallback(() => {
  if (isSwipeLocked) return;
  
  // If there's any scroll progress at all, make a decision
  if (swipeProgress !== 0) {
    setIsSwipeLocked(true);
    
    // IMPORTANT: Always snap to the nearest video instead of using a threshold
    // This prevents getting stuck between videos
    if (Math.abs(swipeProgress) > containerHeight * 0.01) {  // Just need minimal movement
      // Decision based on direction and how far we've scrolled
      if (swipeProgress < 0) {
        // Scrolling down - next video if past halfway point
        if (Math.abs(swipeProgress) > containerHeight * 0.25) {
          setCurrentVideoIndex(Math.min(currentVideoIndex + 1, VIDEOS.length - 1));
        }
      } else {
        // Scrolling up - previous video if past halfway point
        if (Math.abs(swipeProgress) > containerHeight * 0.25) {
          setCurrentVideoIndex(Math.max(currentVideoIndex - 1, 0));
        }
      }
    }
    
    // ALWAYS reset progress to 0 
    setSwipeProgress(0);
    
    // Longer unlock duration for smoother transitions
    setTimeout(() => {
      setIsSwipeLocked(false);
    }, 400);
  }
}, [isSwipeLocked, swipeProgress, currentVideoIndex, VIDEOS.length, containerHeight]);

// 2. Modified handleWheel function to better handle trackpad scrolling
const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
  e.preventDefault();
  
  // Record this wheel movement time
  lastWheelMovement.current = Date.now();
  
  // Pass to detector
  detectTrackpad(e.nativeEvent);
  
  if (isSwipeLocked) return;
  
  const delta = e.deltaY;
  
  // For mouse wheel clicks (not trackpad)
  if (Math.abs(delta) > 30 && !isTrackpadScrolling) {
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
  
  // For trackpad scrolling, accumulate progress but with dampening
  // to prevent skipping videos
  
  // Apply non-linear scaling to prevent skipping with fast swipes
  // This ensures even fast swipes are manageable
  let progressDelta = -delta;
  if (Math.abs(progressDelta) > 20) {
    // Apply logarithmic scaling to dampen large movements
    const direction = progressDelta < 0 ? -1 : 1;
    progressDelta = direction * (20 + Math.log10(Math.abs(progressDelta)) * 5);
  }
  
  // Apply sensitivity multiplier after dampening
  progressDelta = progressDelta * 1.2;
  
  // Update progress with the dampened delta
  let newProgress = swipeProgress + progressDelta;
  
  // Apply resistance at the ends
  if ((currentVideoIndex === 0 && newProgress > 0) || 
      (currentVideoIndex === VIDEOS.length - 1 && newProgress < 0)) {
    newProgress = newProgress * 0.3;
  }
  
  // Clamp maximum progress to prevent overshooting
  const maxProgress = containerHeight * 0.5; // 50% of screen height
  newProgress = Math.max(Math.min(newProgress, maxProgress), -maxProgress);
  
  setSwipeProgress(newProgress);
}, [swipeProgress, isSwipeLocked, currentVideoIndex, VIDEOS.length, detectTrackpad, isTrackpadScrolling, containerHeight]);

// 3. Improved wheel end detection with debouncing
const handleWheelEndEvent = useCallback(() => {
  // Use a consistent timing approach for all scroll types
  const timeSinceLastMovement = Date.now() - lastWheelMovement.current;
  
  // Only trigger after a longer pause in scrolling to improve reliability
  if (!isSwipeLocked && Math.abs(swipeProgress) > 0 && timeSinceLastMovement >= 120) {
    handleScrollEnd();
  }
}, [isSwipeLocked, swipeProgress, handleScrollEnd]);

// 4. Update the wheel event handler with better timing
useEffect(() => {
  // Other existing code...
  
  const wheelHandler = () => {
    // Cancel previous timeouts
    if (wheelTimeout.current) {
      clearTimeout(wheelTimeout.current);
    }
    
    // Update the last wheel movement time
    lastWheelMovement.current = Date.now();
    
    // Use a longer timeout to ensure we only trigger when scrolling has actually stopped
    // This prevents premature navigation while the user is still actively scrolling
    wheelTimeout.current = setTimeout(() => {
      const timeSinceLastMovement = Date.now() - lastWheelMovement.current;
      if (timeSinceLastMovement >= 120) { // Increased from 70ms to 120ms
        handleWheelEndEvent();
      }
    }, 120); // Match the timeout to the check
  };
  
  window.addEventListener('wheel', wheelHandler, { passive: false });
  
  // Cleanup...
}, [currentVideoIndex, isMuted, handleScrollEnd, swipeProgress, isSwipeLocked, handleWheelEndEvent]);

// 5. Custom transition settings for smoother animations
const getTransitionSettings = useCallback(() => {
  if (isSwipeLocked) {
    // Slower, smoother animation when snapping to a video
    return {
      type: "spring",
      stiffness: 600,   // Reduced from 700 for smoother motion
      damping: 90,      // Increased from 80 for less bounce
      duration: 0.4,    // Increased from 0.3 for smoother transition
      restDelta: 0.0001
    };
  } else if (Math.abs(swipeProgress) > 0) {
    // Very responsive during active scrolling
    return {
      type: "spring",
      stiffness: 2000,  // Increased for more immediate response
      damping: 120,     // Increased for more control
      duration: 0.05    
    };
  } else {
    // Default state - match the locked state for consistency
    return {
      type: "spring",
      stiffness: 600,
      damping: 90,
      duration: 0.4
    };
  }
}, [isSwipeLocked, swipeProgress]);
