# Mobile Vertical Video Player UI/UX Specification

## 1. Introduction

This document outlines the UI/UX specifications for a mobile, short-form vertical video player interface. The design prioritizes user engagement, intuitive interaction, and a seamless viewing experience optimized for portrait mode.

## 2. Core Video Display & Playback

*   **Layout:**
    *   Full-bleed, edge-to-edge vertical video display.
    *   Occupies the entire mobile screen viewport, maximizing content visibility.
*   **Orientation:**
    *   Strictly enforce portrait mode. Landscape orientation is not supported.
*   **Playback:**
    *   **Auto-play:** Videos begin playing automatically with audio enabled as soon as they are sufficiently buffered.
    *   **Seamless Looping:** Videos loop continuously without any interruption, pause, or visible buffering indicator between loops.
    *   **Buffering:** Minimize initial load time. If buffering occurs mid-playback, display a subtle, centered loading indicator (e.g., spinner) that disappears immediately upon resumption.

## 3. Right-Side Interactive Control Stack

A vertically aligned stack of interactive icons positioned along the right edge of the screen.

*   **Placement:** Respects platform-specific safe area margins (e.g., avoiding notches, dynamic islands, system navigation bars).
*   **Usability:**
    *   Adequate spacing between icons to prevent accidental taps.
    *   Minimum tap target size of 44x44dp for each icon.
*   **Feedback:** All interactions provide clear visual feedback (e.g., state change, animation) and optional haptic feedback (subtle vibration) on supported devices.

```mermaid
graph TD
    subgraph Right Control Stack
        direction TB
        A[User Profile Pic / Follow +] --> B(Like Count <br> Like ♡ / ♥)
        B --> C(Comment Count <br> Comment 💬)
        C --> D(Share Count (Optional) <br> Share 🔗)
        D --> E(Save/Bookmark 🔖 (Optional))
    end
    style A text-align:center
    style B text-align:center
    style C text-align:center
    style D text-align:center
    style E text-align:center
```

*   **3.1. User Profile Picture:**
    *   **Position:** Topmost element in the stack.
    *   **Visual:** Circular avatar of the video creator.
    *   **Interaction:** Tapping navigates the user to the creator's profile screen/page.
    *   **Follow Indicator:**
        *   If the viewer is *not* following the creator: Display a small circular "+" icon overlaid on the bottom edge of the profile picture.
        *   Tapping the "+": Initiates the follow action. Upon success, the "+" icon animates (e.g., transforms smoothly) into a checkmark icon (✓) and provides visual/haptic feedback.
        *   If the viewer *is* following the creator: No "+" icon is displayed. Tapping the profile picture still navigates to the profile. (Unfollowing typically occurs on the profile page itself).
    ```mermaid
    stateDiagram-v2
        [*] --> NotFollowing : Initial State
        NotFollowing --> Following : Tap '+' Icon
        Following --> NotFollowing : Unfollow Action (on Profile)

        state NotFollowing {
            Icon: Profile Pic + '+' Overlay
            Action: Tap '+' -> Follow User
        }
        state Following {
            Icon: Profile Pic (No Overlay)
            Action: Tap -> View Profile
        }
    ```

*   **3.2. Like Button:**
    *   **Icon:** Outlined heart symbol (♡) when not liked, filled heart symbol (♥) when liked.
    *   **Behavior:**
        *   **Single Tap (Icon):** Toggles the like state (Like/Unlike).
        *   **Double Tap (Video Area):** Triggers the like action (only likes, does not unlike).
    *   **Feedback:**
        *   **State Change:** Icon fills/unfills with a defined primary color (e.g., red).
        *   **Icon Tap Animation:** Brief, expressive animation (e.g., scale-up/down bounce ~1.2x).
        *   **Double Tap Animation:** A larger heart icon animates (e.g., scales up and fades out) momentarily in the center of the video overlay.
        *   **Particle Effect (Optional):** Subtle particle burst effect originating from the heart icon on like action.
    *   **Display:** Numeric like count displayed directly below the icon, updating in real-time (or near real-time). Format large numbers concisely (e.g., 1.2k, 5M).
    ```mermaid
    stateDiagram-v2
        [*] --> NotLiked
        NotLiked --> Liked : Single Tap Icon / Double Tap Video
        Liked --> NotLiked : Single Tap Icon

        state NotLiked {
            Icon: ♡ (Outlined)
            Animation: Bounce on tap
        }
        state Liked {
            Icon: ♥ (Filled, Red)
            Animation: Bounce + Particles on tap
        }
    ```

*   **3.3. Comment Button:**
    *   **Icon:** Speech bubble symbol (💬).
    *   **Behavior:** Tapping opens a comments section overlay.
    *   **Overlay Presentation:** The overlay (e.g., modal bottom sheet) slides smoothly into view from the bottom or side of the screen, partially covering the video. The video may pause or continue playing dimmed in the background based on design choice.
    *   **Feedback:** Subtle scale animation (e.g., icon scales to 1.1x and back) on tap.
    *   **Display:** Numeric comment count displayed directly below the icon. Format large numbers concisely.

*   **3.4. Share Button:**
    *   **Icon:** Standard share symbol (e.g., iOS share icon, Android share icon, or a custom consistent icon like an arrow pointing out of a box 🔗).
    *   **Behavior:** Tapping opens a share interface.
    *   **Share Interface:** Preferably use the native OS share sheet for familiarity. Alternatively, a custom modal displaying options like "Copy Link," direct sharing to specific social media apps, etc.
    *   **Feedback:** Minimalist feedback, such as a brief highlight effect on the icon or a slight rotation on tap.
    *   **Display:** Show the numeric share count below the icon (optional, based on priority/space) or just the icon itself.

*   **3.5. Save/Bookmark Button (Optional):**
    *   **Placement:** Consider placement based on feature priority (e.g., bottom of the stack or integrated elsewhere).
    *   **Icon:** Bookmark ribbon symbol (🔖). Outlined when not saved, filled when saved.
    *   **Behavior:** Tapping toggles the save state of the video within the user's private collection/bookmarks.
    *   **Feedback:** Simple icon fill/unfill transition with a primary or distinct color. Brief highlight on tap.

## 4. Bottom Information Overlay

Textual and graphical elements layered over the bottom portion of the video.

*   **Readability:** Ensure high contrast and legibility against varying video content. Use techniques like:
    *   A subtle vertical gradient/scrim fading from transparent at the top to semi-transparent black/dark color at the bottom edge.
    *   Soft text shadows or outlines on text elements.
*   **Placement:** Respect safe area margins at the bottom.

```mermaid
graph TD
    subgraph Bottom Info Overlay Area
        direction TB
        A[@username (Bold)] --> B(Caption: First 1-2 lines... [more])
        B -- Contains --> C(#hashtag)
        B -- Contains --> D(@mention)
        A --> E(♫ Sound Name - Artist... (Scrolling Marquee))
        E --> F(Rotating Sound Icon 💿 (Bottom Right))
    end
    style A fill:none,stroke:none
    style B fill:none,stroke:none
    style C fill:none,stroke:none,color:#007bff,font-style:italic
    style D fill:none,stroke:none,color:#007bff,font-style:italic
    style E fill:none,stroke:none
    style F fill:none,stroke:none
```

*   **4.1. User Information:**
    *   **Username:** Display the creator's username prominently (e.g., `@creator_handle`).
    *   **Font:** Use a bold, highly legible sans-serif font.
    *   **Interaction:** Tapping the username navigates to the creator's profile.
    *   **Overflow:** Truncate with an ellipsis (...) if the username exceeds the available horizontal space.

*   **4.2. Video Description & Context:**
    *   **Caption:** Display the video description text provided by the creator.
    *   **Visibility:** Show 1-2 lines initially.
    *   **Expansion:** Implement a mechanism to view the full caption (e.g., a subtle "more" link/button, or tapping the caption area expands it within the overlay or in a separate view).
    *   **Overflow:** Handle text overflow gracefully within the initial lines (e.g., fade out, ellipsis).
    *   **Hashtags & Mentions:** Render `#hashtags` and `@mentions` within the caption text as interactive elements.
        *   **Visual:** Style differently (e.g., distinct color, underline) to indicate interactivity.
        *   **Interaction:** Tapping a hashtag navigates to a feed/search results page for that tag. Tapping a mention navigates to the mentioned user's profile.

*   **4.3. Sound/Audio Information:**
    *   **Display Text:** Show "Original Audio - @username" if it's an original sound, or the track name and artist (e.g., "Song Title - Artist Name") if it's a licensed track.
    *   **Marquee:** If the text exceeds the available width, it should scroll horizontally (marquee effect) at a comfortable reading speed.
    *   **Interaction:** Tapping this text area navigates to a dedicated "sound page" displaying a feed of other videos using the same audio track.
    *   **Visual Icon:** Include a small, circular visual element representing the sound (e.g., a vinyl record, album art thumbnail, music note icon).
        *   **Placement:** Typically near the bottom-right corner of the screen, potentially overlapping slightly with the right control stack area but visually distinct.
        *   **Animation:** The icon rotates continuously at a slow, constant speed while the video's audio is playing. It pauses its rotation when the video is paused.

## 5. Interaction & Navigation

*   **5.1. Playback Control (Tap to Pause/Play):**
    *   **Target Area:** A single tap anywhere on the main video area (excluding the explicitly defined interactive elements like buttons, username, caption, sound info) toggles the video's playback state (Pause/Play).
    *   **Feedback:** A clear visual indicator (e.g., a large Play ▶ or Pause ⏸ icon) fades in briefly in the center of the screen upon state change and then fades out.

*   **5.2. Navigation (Vertical Swipe):**
    *   **Swipe Up:** Transitions to the next video in the feed.
    *   **Swipe Down:** Transitions to the previous video in the feed (if applicable).
    *   **Transition Animation:** Use a smooth vertical transition effect (e.g., the current video slides up/down off-screen as the next/previous one slides in, or a cross-fade effect). Ensure the animation is fluid and non-jarring.
    *   **Pre-loading:** Pre-fetch/buffer content for the next (and potentially previous) video(s) in the feed to ensure instantaneous playback and seamless transitions upon swipe completion.

*   **5.3. Volume Control:**
    *   Audio volume is controlled via the device's physical volume buttons.
    *   Optionally, display a transient, custom volume level indicator overlay on the screen briefly when the volume is adjusted via hardware buttons.

*   **5.4. Progress Indicator:**
    *   **Visual:** A thin, unobtrusive progress bar displayed along the absolute bottom edge of the screen.
    *   **Behavior:** Indicates the current playback position within the video's total duration. Fills from left to right.
    *   **Visibility:**
        *   Appears when playback starts or when the user interacts with the screen (e.g., tap to pause/play).
        *   Automatically hides after a short period of inactivity (e.g., 2-3 seconds).
        *   Reappears immediately on the next screen interaction.

*   **5.5. Control Visibility:**
    *   All overlay elements (Right Control Stack, Bottom Information Overlay) should remain persistently visible during video playback by default.
    *   Consider accessibility settings or potential future user preferences to allow hiding overlays for a more immersive view, perhaps triggered by a long press or a specific gesture (outside the scope of this initial spec unless requested).

## 6. Visual Design System & Guidelines

*   **6.1. Aesthetics:**
    *   Modern, clean, immersive, and content-forward.
    *   UI elements should complement, not obstruct, the video content.
*   **6.2. Iconography:**
    *   Use a single, consistent icon set (e.g., outlined style preferred for clarity).
    *   Maintain uniform stroke weight and visual style across all icons.
    *   Ensure icons are universally recognizable or standard within the social media context. Provide text labels via accessibility features.
*   **6.3. Typography:**
    *   **Font:** Choose highly legible, modern sans-serif fonts (e.g., Inter, Roboto, San Francisco).
    *   **Hierarchy:** Establish a clear visual hierarchy:
        *   Username: Most prominent (bold, larger size).
        *   Caption/Description: Standard weight, readable size.
        *   Counts (Likes, Comments): Smaller size, potentially slightly lighter weight or opacity.
        *   Sound Info: Readable size, potentially distinct style.
    *   **Contrast:** Ensure high text contrast against potential video backgrounds using techniques outlined in Section 4 (scrim, shadows).
*   **6.4. Color Palette:**
    *   **Primary Interactive Color:** Define a specific color for key interactive states (e.g., Liked heart fill, Follow button state). This color should be vibrant but accessible.
    *   **Neutrals:** Use white, black, and shades of gray for icons, text, and background elements (like scrims) primarily.
    *   **Accessibility:** All color combinations (text on background, icon states) must meet WCAG AA contrast ratio standards at minimum.
*   **6.5. Animation & Micro-interactions:**
    *   **Philosophy:** Animations should enhance usability, provide feedback, and add delight without being distracting or slowing down the interaction.
    *   **Timing & Easing:** Use smooth, fluid motion principles (e.g., ease-in-out, ease-out curves) with appropriate durations (typically 150-300ms for UI feedback animations).
    *   **Examples:** Button presses, state changes (like/follow), overlay transitions, loading indicators, double-tap heart animation.
*   **6.6. Responsiveness & Adaptation:**
    *   Layout must adapt gracefully to various mobile screen sizes and aspect ratios within the portrait constraint.
    *   Maintain relative proportions, spacing, and readability.
    *   Strictly adhere to platform-specific safe area guidelines (iOS notch/Dynamic Island/Home Indicator, Android status/navigation bars) to prevent UI elements from being obscured.
*   **6.7. Accessibility (WCAG Compliance):**
    *   **Contrast:** Meet WCAG AA contrast requirements for text and meaningful non-text elements (icons).
    *   **Tap Targets:** Ensure all interactive elements meet the minimum 44x44dp size requirement.
    *   **Screen Readers:** Provide appropriate alternative text descriptions or labels for all icons and interactive elements (e.g., "Like button, 1.2k likes", "User Profile for @username").
    *   **Focus Order:** Ensure a logical focus order for navigation using assistive technologies.
    *   **Reduced Motion:** Respect device settings for reduced motion where possible, providing simpler transitions or disabling non-essential animations.

## 7. Overall Layout Visualization

```mermaid
graph TD
    subgraph Screen Viewport (Portrait, Edge-to-Edge)
        direction TB

        A[Video Content Area]

        subgraph Right Control Stack (Vertical, Right Edge, Safe Area Aware)
            RC1(Profile Pic / Follow +) --> RC2(Like Count <br> Like ♡/♥)
            RC2 --> RC3(Comment Count <br> Comment 💬)
            RC3 --> RC4(Share Count <br> Share 🔗)
            RC4 --> RC5(Bookmark 🔖 (Opt.))
        end

        subgraph Bottom Info Overlay (Over Video, Bottom Edge, Safe Area Aware)
            BI1(@username) --> BI2(Caption...)
            BI2 -- Contains --> BI3(#hashtag)
            BI2 -- Contains --> BI4(@mention)
            BI1 --> BI5(♫ Sound Info Marquee...)
            BI5 --> BI6(Rotating Sound Icon 💿)
        end

        subgraph Implicit Elements
           IE1(Tap Video -> Play/Pause Overlay)
           IE2(Swipe Up/Down -> Navigation)
           IE3(Bottom Edge Progress Bar (Auto-hides))
        end

        A -- Overlays --> Right Control Stack
        A -- Overlays --> Bottom Info Overlay
        A -- Interaction Area For --> IE1
        A -- Gesture Area For --> IE2
        A -- Contains --> IE3

        style A fill:#ddd,stroke:#666,stroke-width:1px
        style Right Control Stack fill:rgba(0,0,0,0.1),stroke:none,padding:5px
        style Bottom Info Overlay fill:rgba(0,0,0,0.2),stroke:none,padding:5px
        style Implicit Elements fill:none,stroke:none
        style RC2 text-align:center
        style RC3 text-align:center
        style RC4 text-align:center
        style RC5 text-align:center
        style BI6 align:right
    end