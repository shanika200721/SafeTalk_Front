export const wellnessCategories = [
  'Stress Relief',
  'Sleep',
  'Mindfulness',
  'Exam Preparation',
  'Motivation',
  'Relaxation',
  'Self Care',
  'Anxiety',
  'Daily Wellness',
];

export const fallbackVideos = [
  {
    id: 'video-box-breathing',
    title: 'Box Breathing for Study Breaks',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
    duration: '4:20',
    category: 'Stress Relief',
    description: 'A short approved guide for steady breathing between study sessions.',
    provider: 'Campus Wellness Team',
    url: 'https://www.youtube.com/embed/tEmt1Znux58',
    approved: true,
  },
  {
    id: 'video-sleep-wind-down',
    title: 'Evening Wind-down Routine',
    thumbnail: 'https://images.unsplash.com/photo-1455642305367-68834a8eaae0?auto=format&fit=crop&w=900&q=80',
    duration: '8:00',
    category: 'Sleep',
    description: 'A calm routine for putting study work down before sleep.',
    provider: 'Open Wellness Library',
    url: 'https://www.youtube.com/embed/ZToicYcHIOU',
    approved: true,
  },
  {
    id: 'video-exam-reset',
    title: 'Exam Reset: One Manageable Step',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    duration: '5:35',
    category: 'Exam Preparation',
    description: 'A low-pressure reset before or after difficult coursework.',
    provider: 'Student Support Unit',
    url: 'https://www.youtube.com/embed/inpok4MKVLM',
    approved: true,
  },
  {
    id: 'video-mindfulness-basics',
    title: 'Mindfulness Basics',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    duration: '6:15',
    category: 'Mindfulness',
    description: 'A beginner-friendly explanation of present-moment attention.',
    provider: 'Approved Wellness Channel',
    url: 'https://www.youtube.com/embed/ssss7V1_eyA',
    approved: true,
  },
];

export const breathingTechniques = [
  { id: 'box', title: 'Box Breathing', pattern: [4, 4, 4, 4], labels: ['Inhale', 'Hold', 'Exhale', 'Pause'], duration_minutes: 3, category: 'Stress Relief' },
  { id: '478', title: '4-7-8', pattern: [4, 7, 8, 0], labels: ['Inhale', 'Hold', 'Exhale', 'Rest'], duration_minutes: 4, category: 'Sleep' },
  { id: 'triangle', title: 'Triangle Breathing', pattern: [4, 4, 4], labels: ['Inhale', 'Hold', 'Exhale'], duration_minutes: 3, category: 'Relaxation' },
  { id: 'calm', title: 'Calm Breathing', pattern: [5, 0, 5, 0], labels: ['Inhale', 'Rest', 'Exhale', 'Rest'], duration_minutes: 5, category: 'Daily Wellness' },
  { id: 'exam-reset', title: 'Exam Reset', pattern: [4, 2, 6, 0], labels: ['Inhale', 'Hold', 'Exhale', 'Rest'], duration_minutes: 2, category: 'Exam Preparation' },
  { id: 'sleep-relaxation', title: 'Sleep Relaxation', pattern: [4, 4, 8, 0], labels: ['Inhale', 'Hold', 'Exhale', 'Rest'], duration_minutes: 10, category: 'Sleep' },
];

export const meditationTracks = [
  { id: 'med-2-ground', title: 'Two-Minute Grounding', duration: '2 min', category: '2 min', description: 'A brief arrival practice for busy moments.' },
  { id: 'med-5-morning', title: 'Morning Check-in', duration: '5 min', category: 'Morning', description: 'Start the day with a gentle body and mood scan.' },
  { id: 'med-10-exam', title: 'Before an Exam', duration: '10 min', category: 'Exam', description: 'Settle attention and choose one manageable next step.' },
  { id: 'med-15-sleep', title: 'Sleep Wind-down', duration: '15 min', category: 'Sleep', description: 'A longer quiet practice for the end of the day.' },
  { id: 'med-5-relax', title: 'Relaxed Breathing', duration: '5 min', category: 'Relax', description: 'Follow soft visual pacing and simple narration.' },
];

export const ambientSounds = ['Rain', 'Ocean', 'Forest', 'Wind', 'Fireplace', 'White Noise', 'Brown Noise', 'Cafe'];

export const mindfulnessActivities = [
  { id: 'grounding-54321', title: '5-4-3-2-1 grounding', category: 'Anxiety', prompts: ['Name five things you can see.', 'Notice four things you can feel.', 'Listen for three sounds.', 'Notice two scents or the air.', 'Name one thing you appreciate.'] },
  { id: 'gratitude-journal', title: 'Gratitude journal', category: 'Daily Wellness', prompts: ['One small thing that helped today.', 'One person, place, or habit you appreciate.', 'One kind sentence for yourself.'] },
  { id: 'affirmations', title: 'Positive affirmations', category: 'Motivation', prompts: ['I can take one manageable step.', 'I do not need to solve everything now.', 'Support is allowed.'] },
  { id: 'mood-reflection', title: 'Mood reflection', category: 'Self Care', prompts: ['What word fits this moment?', 'What might make the next hour gentler?', 'What can wait until later?'] },
  { id: 'breathing-challenge', title: 'Breathing challenge', category: 'Stress Relief', prompts: ['Follow three comfortable breaths.', 'Relax your shoulders.', 'Return to your next small step.'] },
  { id: 'body-scan', title: 'Body scan', category: 'Relaxation', prompts: ['Notice feet.', 'Notice legs.', 'Notice hands.', 'Notice shoulders.', 'Notice face.'] },
  { id: 'kindness-exercise', title: 'Kindness exercise', category: 'Self Care', prompts: ['What would you say to a friend?', 'Offer one believable kind sentence to yourself.', 'Choose one small caring action.'] },
];

export const fallbackResources = [
  { id: 'article-exam-stress', title: 'Managing Exam Pressure', type: 'Articles', category: 'Exam Preparation', description: 'Practical planning and recovery ideas for exam weeks.', approved: true },
  { id: 'exercise-grounding', title: '5-4-3-2-1 Grounding Exercise', type: 'Exercises', category: 'Anxiety', description: 'A self-paced grounding activity using the senses.', approved: true },
  { id: 'download-sleep-plan', title: 'Sleep Wind-down Checklist', type: 'Downloads', category: 'Sleep', description: 'A simple checklist for preparing for rest.', approved: true },
  { id: 'campus-counseling', title: 'Campus Counseling Unit', type: 'Campus resources', category: 'Support', description: 'University support contact information from the campus directory.', approved: true },
  { id: 'emergency-guidance', title: 'Emergency Guidance', type: 'Emergency guidance', category: 'Support', description: 'How to reach immediate support if you or someone nearby needs urgent help.', approved: true },
];
