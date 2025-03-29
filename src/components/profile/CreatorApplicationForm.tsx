"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createCreatorApplication } from '@/lib/userService';

interface CreatorApplicationFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function CreatorApplicationForm({ onComplete, onCancel }: CreatorApplicationFormProps) {
  const { currentUser, userProfile } = useAuth();
  const [reason, setReason] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    youtube: '',
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !userProfile) {
      setError('You must be logged in to apply');
      return;
    }
    
    if (!reason.trim()) {
      setError('Please provide a reason for becoming a creator');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createCreatorApplication(currentUser.uid, {
        username: userProfile.username,
        displayName: userProfile.displayName,
        email: currentUser.email || '',
        reason,
        socialLinks: {
          instagram: socialLinks.instagram || undefined,
          twitter: socialLinks.twitter || undefined,
          youtube: socialLinks.youtube || undefined,
          website: socialLinks.website || undefined
        }
      });
      
      onComplete();
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Apply to Become a Creator</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-400">
            Why do you want to become a creator?
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
            rows={4}
            placeholder="Tell us about your content and goals..."
            required
          />
        </div>
        
        <div className="border-t border-zinc-800 pt-4">
          <h3 className="text-lg font-medium text-white mb-2">Social Links</h3>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-400">
                Instagram
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-700 bg-zinc-800 text-gray-400">
                  instagram.com/
                </span>
                <input
                  type="text"
                  id="instagram"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                  className="flex-1 block w-full px-3 py-2 rounded-none rounded-r-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink"
                  placeholder="username"
                />
              </div>
            </div>
            
            {/* Add similar fields for Twitter, YouTube, and Website */}
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 border border-zinc-700 rounded-md shadow-sm text-white bg-transparent hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-tiktok-pink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiktok-pink disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
