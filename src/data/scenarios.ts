export type AgeGroup = 'under3' | 'older'

export interface Scenario {
  id: string
  title: string
  description: string
  ageGroup: AgeGroup
  icon: string
  analyzableViaVideo: boolean
  alternativeNote?: string
  parentScript: string[]
  aiPrompt: string
}

export const AGE_GROUPS: { id: AgeGroup; label: string; icon: string; subtitle: string }[] = [
  {
    id: 'under3',
    label: 'Under 3 Years',
    icon: '👶',
    subtitle: 'Babies & toddlers',
  },
  {
    id: 'older',
    label: 'Older Children',
    icon: '🧒',
    subtitle: '3 years and above',
  },
]

export const SCENARIOS: Scenario[] = [
  // ── Babies & Toddlers Under 3 ──────────────────────────────────

  {
    id: 'name-response',
    title: 'Response to Name',
    description: 'Does your child respond when you call their name?',
    ageGroup: 'under3',
    icon: '📣',
    analyzableViaVideo: true,
    parentScript: [
      'Find a quiet moment when your child is calmly playing or sitting.',
      'Position yourself about 3–6 feet away from your child.',
      'Start recording the video so we can see your child clearly.',
      'Call your child\'s name in a normal, clear voice.',
      'Wait about 5 seconds and watch for any response — turning their head, looking at you, or any reaction.',
      'If there\'s no response, call their name again (up to 3 times).',
      'Keep recording throughout all attempts.',
    ],
    aiPrompt: `You are an expert child development specialist analyzing a video for an autism screening scenario: **Response to Name**.

The parent was instructed to call the child's name from 3–6 feet away, up to 3 times, and observe responses.

Analyze the video and provide your assessment in this format:

## Brief Summary
2–3 sentence overview of what you observed regarding the child's name response.

## Detailed Observations

### Name Response Analysis
- Did the child turn their head or look toward the caller?
- How many attempts were needed to get a response (if any)?
- Was the response immediate, delayed, or absent?
- Did the child make eye contact after hearing their name?

### Quality of Response
- Describe the nature of the response (head turn, eye contact, verbal response, smile, etc.)
- Note any partial responses (e.g., brief glance but quick return to activity)

### Contextual Factors
- What was the child doing before being called? (engaged in activity, idle, etc.)
- Were there any distracting sounds or stimuli?

## Key Observations
List the most significant findings.

## Developmental Notes
Provide context about typical name-response development for this age range.

## Recommendations
Specific suggestions for the caregiver. Be supportive and avoid diagnostic language.

Focus strictly on observable behaviors. Do NOT diagnose — only describe what you see.`,
  },

  {
    id: 'sharing-interest',
    title: 'Sharing & Interest',
    description: 'Does your child show, give, or share objects of interest with you?',
    ageGroup: 'under3',
    icon: '🧸',
    analyzableViaVideo: true,
    parentScript: [
      'Sit on the floor or at a table with your child.',
      'Have a new or interesting toy or object ready that they haven\'t seen before.',
      'Start recording the video.',
      'Offer the toy to your child and watch how they interact with it.',
      'After a moment, point at something interesting nearby and see if they follow your point.',
      'Gently ask "Can you show me?" and see if they hold up the toy to show you.',
      'Observe whether they try to share, give, or show you the object.',
      'Record for about 2–3 minutes.',
    ],
    aiPrompt: `You are an expert child development specialist analyzing a video for an autism screening scenario: **Sharing & Interest in Objects**.

The parent was instructed to present a new toy and observe sharing behaviors — showing objects, following a point, giving/sharing items.

Analyze the video and provide your assessment in this format:

## Brief Summary
2–3 sentence overview of the child's sharing and joint attention behaviors.

## Detailed Observations

### Joint Attention
- Did the child follow the parent's point or gaze?
- Did the child initiate showing objects to the parent?
- Were there moments of shared enjoyment or looking back and forth?

### Sharing Behavior
- Did the child offer, give, or show the toy to the parent?
- How did the child respond to "Can you show me?"
- Was there any spontaneous sharing or giving?

### Object Interest
- How did the child engage with the new object?
- Was the interest shared with the parent or kept private?

## Key Observations
List the most significant findings.

## Developmental Notes
Context about typical joint attention development for this age.

## Recommendations
Supportive suggestions for the caregiver. Avoid diagnostic language.

Focus strictly on observable behaviors. Do NOT diagnose.`,
  },

  {
    id: 'affection-response',
    title: 'Response to Affection',
    description: 'How does your child respond to "I love you" and hugs?',
    ageGroup: 'under3',
    icon: '💛',
    analyzableViaVideo: true,
    parentScript: [
      'Find a calm, quiet moment with your child.',
      'Sit facing your child at their eye level.',
      'Start recording the video.',
      'Say "I love you" with a warm, affectionate tone.',
      'Open your arms and offer a hug.',
      'Observe their reaction — do they respond, lean in, smile, look away, or seem indifferent?',
      'Try a gentle pat on the back or head.',
      'Record for about 1–2 minutes.',
    ],
    aiPrompt: `You are an expert child development specialist analyzing a video for an autism screening scenario: **Response to Affection**.

The parent was instructed to say "I love you," offer a hug, and observe the child's reaction.

Analyze the video and provide your assessment in this format:

## Brief Summary
2–3 sentence overview of the child's response to affection.

## Detailed Observations

### Verbal Affection Response
- How did the child respond to "I love you"?
- Any verbal or vocal response?
- Facial expression changes?

### Physical Affection Response
- Did the child accept, lean into, or reciprocate the hug?
- Did the child pull away, stiffen, or show avoidance?
- Response to gentle touch (pat on back/head)?

### Emotional Expression
- Were there signs of comfort or enjoyment?
- Any signs of distress or indifference?

## Key Observations
List the most significant findings.

## Developmental Notes
Context about typical affection responses for this age.

## Recommendations
Supportive suggestions for the caregiver. Avoid diagnostic language.

Focus strictly on observable behaviors. Do NOT diagnose.`,
  },

  {
    id: 'gesture-use',
    title: 'Use of Gestures',
    description: 'Does your child point, wave, or use gestures to communicate?',
    ageGroup: 'under3',
    icon: '👋',
    analyzableViaVideo: true,
    parentScript: [
      'Sit with your child in a comfortable, familiar space.',
      'Start recording the video.',
      'Place a favorite toy or snack just out of reach and observe if they point at it or gesture toward it.',
      'Wave "bye-bye" and see if they wave back.',
      'Point to something interesting (a picture, pet, or toy) and see if they follow your point.',
      'Ask "Where is [toy name]?" and observe if they point.',
      'Try to engage them in a "peekaboo" or clapping game.',
      'Record for about 2–3 minutes.',
    ],
    aiPrompt: `You are an expert child development specialist analyzing a video for an autism screening scenario: **Use of Gestures**.

The parent was instructed to observe the child's use of communicative gestures — pointing, waving, reaching, and responding to gestures.

Analyze the video and provide your assessment in this format:

## Brief Summary
2–3 sentence overview of the child's gestural communication.

## Detailed Observations

### Pointing
- Did the child use pointing to request objects?
- Did the child point to show or share interest (proto-declarative pointing)?
- Did the child follow the parent's point?

### Other Gestures
- Did the child wave, clap, or use other social gestures?
- Were gestures used to communicate wants or needs?
- Any imitation of the parent's gestures?

### Communicative Intent
- Were gestures accompanied by eye contact or vocalizations?
- Did the child use gestures to initiate interaction?

## Key Observations
List the most significant findings.

## Developmental Notes
Context about typical gesture development for this age.

## Recommendations
Supportive suggestions for the caregiver. Avoid diagnostic language.

Focus strictly on observable behaviors. Do NOT diagnose.`,
  },

  {
    id: 'solitary-play',
    title: 'Preference for Solitary Play',
    description: 'Does your child prefer playing alone rather than with others?',
    ageGroup: 'under3',
    icon: '🧩',
    analyzableViaVideo: false,
    alternativeNote: 'This is best evaluated through ongoing observation over time. We recommend keeping a journal or using our chat logs feature to track play patterns.',
    parentScript: [],
    aiPrompt: '',
  },

  {
    id: 'first-words',
    title: 'First Words (18 months)',
    description: 'Has your child spoken their first word by 18 months?',
    ageGroup: 'under3',
    icon: '🗣️',
    analyzableViaVideo: false,
    alternativeNote: 'This milestone is tracked over time rather than in a single video. Please note in your child\'s profile when first words appear.',
    parentScript: [],
    aiPrompt: '',
  },

  {
    id: 'two-word-phrases',
    title: 'Two-Word Phrases',
    description: 'Can your child (2+ years) say two-word phrases like "more milk" or "go bye-bye"?',
    ageGroup: 'under3',
    icon: '💬',
    analyzableViaVideo: true,
    parentScript: [
      'Sit with your child in a quiet space where they feel comfortable.',
      'Start recording the video.',
      'Try prompting your child to say these common phrases:',
      '  • "more milk" — during a snack or drink',
      '  • "mine" — while playing with a toy',
      '  • "no" — offer something they don\'t want',
      '  • "go bye-bye" — when getting ready to leave',
      '  • "me do it" — during a simple activity',
      'You can start a phrase and let them finish it (e.g., "more..." and wait).',
      'Don\'t pressure them — keep it playful and natural.',
      'Record for about 2–3 minutes.',
    ],
    aiPrompt: `You are an expert child development specialist analyzing a video for an autism screening scenario: **Two-Word Phrases**.

The parent was instructed to prompt the child (2+ years) to produce two-word phrases like "more milk," "mine," "no," "go bye-bye," and "me do it."

Analyze the video and provide your assessment in this format:

## Brief Summary
2–3 sentence overview of the child's verbal output.

## Detailed Observations

### Verbal Output
- What words or phrases did the child produce?
- Were any two-word combinations observed?
- List each phrase attempt and whether it was spontaneous or prompted.

### Language Characteristics
- Was speech clear or difficult to understand?
- Were there any echolalic patterns (repeating exactly what was said)?
- Any non-word vocalizations or babbling?

### Communication Context
- Did the child use language to request, label, or comment?
- Was language paired with gestures, eye contact, or emotion?

## Key Observations
List the most significant findings.

## Developmental Notes
Context about typical language milestones for 2-year-olds.

## Recommendations
Supportive suggestions for the caregiver. Avoid diagnostic language.

Focus strictly on observable behaviors. Do NOT diagnose.`,
  },

  // ── Older Children ──────────────────────────────────────────────

  {
    id: 'conversation',
    title: 'Back-and-Forth Conversation',
    description: 'Can your child carry a reciprocal, back-and-forth conversation?',
    ageGroup: 'older',
    icon: '🗨️',
    analyzableViaVideo: true,
    parentScript: [
      'Sit facing your child in a quiet, comfortable space.',
      'Start recording the video.',
      'Begin a conversation about something your child enjoys (favorite show, game, animal).',
      'Ask an open-ended question like "What do you like about it?"',
      'Listen to their response and ask a follow-up question based on what they said.',
      'Try to maintain a natural back-and-forth exchange for 2–3 minutes.',
      'Notice if your child asks you questions back, stays on topic, or changes subjects.',
      'Keep the tone relaxed and playful.',
    ],
    aiPrompt: `You are an expert child development specialist analyzing a video for an autism screening scenario: **Back-and-Forth Conversation**.

The parent was instructed to engage the child in a reciprocal conversation for 2–3 minutes.

Analyze the video and provide your assessment in this format:

## Brief Summary
2–3 sentence overview of the child's conversational abilities.

## Detailed Observations

### Reciprocity
- Did the child respond to questions appropriately?
- Did the child ask questions back or add to the conversation?
- Was there a natural turn-taking flow?

### Topic Maintenance
- Did the child stay on topic or frequently change subjects?
- Were responses relevant to what was asked?
- Any scripted or rehearsed-sounding responses?

### Pragmatic Language
- Did the child use appropriate eye contact during conversation?
- Were there appropriate pauses and timing?
- Any unusual prosody (tone, volume, rhythm of speech)?

## Key Observations
List the most significant findings.

## Developmental Notes
Context about typical conversational development for this age.

## Recommendations
Supportive suggestions for the caregiver. Avoid diagnostic language.

Focus strictly on observable behaviors. Do NOT diagnose.`,
  },

  {
    id: 'eye-contact',
    title: 'Eye Contact',
    description: 'Does your child make and maintain appropriate eye contact?',
    ageGroup: 'older',
    icon: '👁️',
    analyzableViaVideo: true,
    parentScript: [
      'Sit facing your child at their eye level.',
      'Start recording the video — make sure your child\'s face is clearly visible.',
      'Engage them in a conversation or show them something interesting.',
      'Talk about a topic they enjoy to keep them engaged.',
      'Notice when they look at your eyes, how long they hold eye contact, and how often.',
      'Try calling their name and observe if they look at your face.',
      'Record for about 2–3 minutes of natural interaction.',
    ],
    aiPrompt: `You are an expert child development specialist analyzing a video for an autism screening scenario: **Eye Contact**.

The parent was instructed to engage the child in conversation while recording, focusing on capturing the child's face for eye contact analysis.

Analyze the video and provide your assessment in this format:

## Brief Summary
2–3 sentence overview of the child's eye contact patterns.

## Detailed Observations

### Eye Contact Frequency
- How often did the child make eye contact during the interaction?
- Was eye contact initiated by the child or only in response to being addressed?

### Eye Contact Quality
- How long did the child hold eye contact (brief glances vs. sustained)?
- Was eye contact natural or appeared effortful/avoidant?
- Did the child look at the parent's face during conversation?

### Gaze Patterns
- Where did the child tend to look (parent's face, objects, away)?
- Any unusual gaze patterns (looking through the person, peripheral gaze)?
- Did eye contact coordinate with speech and gestures?

## Key Observations
List the most significant findings.

## Developmental Notes
Context about typical eye contact development.

## Recommendations
Supportive suggestions for the caregiver. Avoid diagnostic language.

Focus strictly on observable behaviors. Do NOT diagnose.`,
  },

  {
    id: 'body-language',
    title: 'Reading Body Language',
    description: 'Can your child understand and use body language in social situations?',
    ageGroup: 'older',
    icon: '🤷',
    analyzableViaVideo: false,
    alternativeNote: 'This skill is difficult to assess in a single video. It\'s best evaluated through ongoing observation in social settings and through our chat-based assessments.',
    parentScript: [],
    aiPrompt: '',
  },

  {
    id: 'emotion-recognition',
    title: 'Recognizing Emotions',
    description: 'Can your child recognize and respond to others\' emotions appropriately?',
    ageGroup: 'older',
    icon: '🎭',
    analyzableViaVideo: false,
    alternativeNote: 'Emotion recognition is best assessed through ongoing interactions and structured activities. Use our chat logs feature to track observations over time.',
    parentScript: [],
    aiPrompt: '',
  },

  {
    id: 'affection-older',
    title: 'Response to Affection',
    description: 'How does your child respond to displays of love and affection?',
    ageGroup: 'older',
    icon: '🤗',
    analyzableViaVideo: true,
    parentScript: [
      'Find a calm moment when your child is relaxed.',
      'Start recording the video.',
      'Tell your child "I love you" in your usual warm way.',
      'Offer a hug or your usual display of affection.',
      'Observe their reaction — do they reciprocate, smile, respond verbally, pull away, or seem uncomfortable?',
      'Try a high-five or gentle touch if hugs aren\'t their thing.',
      'Record for about 1–2 minutes.',
    ],
    aiPrompt: `You are an expert child development specialist analyzing a video for an autism screening scenario: **Response to Affection (Older Child)**.

The parent was instructed to express affection ("I love you," hug, touch) and observe the child's response.

Analyze the video and provide your assessment in this format:

## Brief Summary
2–3 sentence overview of the child's response to affection.

## Detailed Observations

### Verbal Affection Response
- How did the child respond to "I love you"?
- Any verbal reciprocation or acknowledgment?

### Physical Affection Response
- Did the child accept, reciprocate, or initiate physical affection?
- Was there any discomfort, avoidance, or rigidity?
- How did the child respond to alternative affection (high-five, touch)?

### Emotional Expression
- Were there genuine signs of warmth or enjoyment?
- Was the response typical for the child's age?

## Key Observations
List the most significant findings.

## Developmental Notes
Context about typical affection responses for this age.

## Recommendations
Supportive suggestions for the caregiver. Avoid diagnostic language.

Focus strictly on observable behaviors. Do NOT diagnose.`,
  },
]

export function getScenariosByAge(ageGroup: AgeGroup): Scenario[] {
  return SCENARIOS.filter((s) => s.ageGroup === ageGroup)
}

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id)
}
