// In src/app/profile/[username]/page.tsx, modify the useEffect hook

useEffect(() => {
  const fetchProfileData = async () => {
    if (!username) return;
    
    setLoading(true);
    try {
      // For mock auth, check if we're looking at the current user's profile
      if (USE_MOCK_AUTH) {
        // If we're using mock auth, check if this is the current user's profile
        const { currentUser, userProfile } = useAuth();
        
        if (
          (userProfile && userProfile.username === username) || 
          (currentUser && currentUser.uid === username)
        ) {
          // We're viewing our own profile
          setProfile(userProfile);
          setLoading(false);
          return;
        }
        
        // If we're trying to access another user's profile in mock mode,
        // check localStorage for this user
        const mockProfiles = localStorage.getItem('mock-profiles');
        if (mockProfiles) {
          const profiles = JSON.parse(mockProfiles);
          const foundProfile = profiles.find(
            (p: UserProfile) => p.username === username || p.uid === username
          );
          
          if (foundProfile) {
            setProfile(foundProfile);
            setLoading(false);
            return;
          }
        }
        
        // If we get here, no profile was found
        setProfile(null);
        setLoading(false);
        return;
      }
      
      // Normal Firebase flow for real auth
      const profileData = await getUserProfileByUsername(username as string);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchProfileData();
}, [username]);
