// Update these specific functions in your FeedList.tsx

// 1. Increase sensitivity in handleWheel function
const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
  e.preventDefault();
  
  // Record this wheel movement time
  lastWheelMovement.current = Date.now();
  
  // Pass to detector
  detectTrackpad(e.nativeEvent);
  
  if (isSwipeLocked) return;
  
  const delta = e.deltaY;
  
  // Determine if this is likely a discrete mouse wheel "click"
  const isDiscreteWheel = Math.abs(delta) > 30 && !isTrackpadScrolling;
  
  // For discrete mouse wheel, move directly to next/prev video
  if (isDiscreteWheel) {
    if (delta > 0 && currentVideoIndex < VIDEOS.length - 1) {
      // Scrolling down - next video
      setIsSwipeLocked(true);
      setCurrentVideoIndex(currentVideoIndex + 1);
      setSwipeProgress(0);
      setTimeout(() => {
        setIsSwipeLocked(false);
      }, 300);
    } else if (delta < 0 && currentVideoIndex > 0) {
      // Scrolling up - previous video
      setIsSwipeLocked(true);
      setCurrentVideoIndex(currentVideoIndex - 1);
      setSwipeProgress(0);
      setTimeout(() => {
        setIsSwipeLocked(false);
      }, 300);
    }
    return;
  }
  
  // For trackpad or continuous scrolling, SIGNIFICANTLY INCREASE sensitivity
  // Increased from 0.7 to 1.8 for much more responsive scrolling
  const progressDelta = -delta * 1.8;
  
  // Update progress for visual feedback
  let newProgress = swipeProgress + progressDelta;
  
  // Apply resistance at the ends
  if ((currentVideoIndex === 0 && newProgress > 0) || 
      (currentVideoIndex === VIDEOS.length - 1 && newProgress < 0)) {
    newProgress = newProgress * 0.3; // Resistance factor
  }
  
  // Clamp the progress to reasonable limits - increased maximum limit
  const maxProgress = containerHeight * 0.4; // Increased from 0.3 to 0.4
  newProgress = Math.max(Math.min(newProgress, maxProgress), -maxProgress);
  
  setSwipeProgress(newProgress);
}, [swipeProgress, isSwipeLocked, currentVideoIndex, VIDEOS.length, detectTrackpad, isTrackpadScrolling, containerHeight]);

// 2. Lower the threshold needed to trigger a video change in handleScrollEnd
const handleScrollEnd = useCallback(() => {
  if (isSwipeLocked) return;
  
  // If there's any scroll progress at all, make a decision
  if (swipeProgress !== 0) {
    setIsSwipeLocked(true);
    
    // Calculate how far we've scrolled relative to a threshold
    // REDUCED threshold to make it easier to trigger navigation
    const threshold = containerHeight * 0.08; // Reduced from 0.12 to 0.08
    
    if (Math.abs(swipeProgress) > threshold) {
      // We've scrolled enough to trigger a video change
      if (swipeProgress < 0 && currentVideoIndex < VIDEOS.length - 1) {
        // Progress is negative (scrolling down) - go to next video
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else if (swipeProgress > 0 && currentVideoIndex > 0) {
        // Progress is positive (scrolling up) - go to previous video
        setCurrentVideoIndex(currentVideoIndex - 1);
      }
    }
    
    // ALWAYS reset progress to 0 to avoid stuck state
    setSwipeProgress(0);
    
    // Unlock after animation completes
    setTimeout(() => {
      setIsSwipeLocked(false);
    }, 300);
  }
}, [isSwipeLocked, swipeProgress, currentVideoIndex, VIDEOS.length, containerHeight]);

// 3. Reduce the wait time to check for scrolling end
const handleWheelEndEvent = useCallback(() => {
  // Reduced the time check from 100ms to 70ms to respond faster
  const timeSinceLastMovement = Date.now() - lastWheelMovement.current;
  
  if (isTrackpadScrolling && !isSwipeLocked && Math.abs(swipeProgress) > 0 && timeSinceLastMovement >= 70) {
    handleScrollEnd();
  }
}, [isTrackpadScrolling, isSwipeLocked, swipeProgress, handleScrollEnd]);

// 4. Update the wheel event handler to use the reduced timing
useEffect(() => {
  // Other existing code...
  
  const wheelHandler = () => {
    // Cancel previous timeouts
    if (wheelTimeout.current) {
      clearTimeout(wheelTimeout.current);
    }
    
    // Update the last wheel movement time
    lastWheelMovement.current = Date.now();
    
    // Reduced timeout from 100ms to 70ms
    wheelTimeout.current = setTimeout(() => {
      const timeSinceLastMovement = Date.now() - lastWheelMovement.current;
      if (timeSinceLastMovement >= 70) {
        handleWheelEndEvent();
      }
    }, 70);
  };
  
  window.addEventListener('wheel', wheelHandler, { passive: false });
  
  // Cleanup...
}, [currentVideoIndex, isMuted, isTrackpadScrolling, handleScrollEnd, swipeProgress, isSwipeLocked, handleWheelEndEvent]);

// 5. For touch events, increase sensitivity as well
const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
  if (isSwipeLocked) return;
  
  const currentY = e.touches[0].clientY;
  const diff = touchStartY.current - currentY;
  touchMoveY.current = currentY;
  
  // For touch, significantly increase sensitivity
  // Increased from 1.5 to 2.5 for much more responsive touch scrolling
  const swipeDistance = diff * 2.5;
  
  // Calculate progress
  let newProgress = -(swipeDistance / containerHeight) * 100;
  
  // Apply resistance at the ends
  if ((currentVideoIndex === 0 && newProgress > 0) || 
      (currentVideoIndex === VIDEOS.length - 1 && newProgress < 0)) {
    newProgress = newProgress * 0.3;
  }
  
  // Clamp to reasonable limits - increased maximum
  const maxProgress = containerHeight * 0.4; // Increased from 0.3 to 0.4
  newProgress = Math.max(Math.min(newProgress, maxProgress), -maxProgress);
  
  setSwipeProgress(newProgress);
}, [isSwipeLocked, currentVideoIndex, VIDEOS.length, containerHeight]);
