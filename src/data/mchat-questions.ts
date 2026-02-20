export interface MChatQuestion {
  id: number
  text: string
  example: string
  /** The answer that indicates risk (true = "Yes" is risky, false = "No" is risky) */
  riskOnYes: boolean
}

export const MCHAT_QUESTIONS: MChatQuestion[] = [
  {
    id: 1,
    text: 'If you point at something across the room, does your child look at it?',
    example: 'If you point at a toy or an animal, does your child look at the toy or animal?',
    riskOnYes: false,
  },
  {
    id: 2,
    text: 'Have you ever wondered if your child might be deaf?',
    example: '',
    riskOnYes: true,
  },
  {
    id: 3,
    text: 'Does your child play pretend or make-believe?',
    example: 'Pretend to drink from an empty cup, pretend to talk on a phone, or pretend to feed a doll or stuffed animal?',
    riskOnYes: false,
  },
  {
    id: 4,
    text: 'Does your child like climbing on things?',
    example: 'Furniture, playground equipment, or stairs.',
    riskOnYes: false,
  },
  {
    id: 5,
    text: 'Does your child make unusual finger movements near his or her eyes?',
    example: 'Does your child wiggle his or her fingers close to his or her eyes?',
    riskOnYes: true,
  },
  {
    id: 6,
    text: 'Does your child point with one finger to ask for something or to get help?',
    example: 'Pointing to a snack or toy that is out of reach.',
    riskOnYes: false,
  },
  {
    id: 7,
    text: 'Does your child point with one finger to show you something interesting?',
    example: 'Pointing to an airplane in the sky or a big truck in the road.',
    riskOnYes: false,
  },
  {
    id: 8,
    text: 'Is your child interested in other children?',
    example: 'Does your child watch other children, smile at them, or go to them?',
    riskOnYes: false,
  },
  {
    id: 9,
    text: 'Does your child show you things by bringing them to you or holding them up for you to see — not to get help, but just to share?',
    example: 'Showing you a flower, a stuffed animal, or a toy truck.',
    riskOnYes: false,
  },
  {
    id: 10,
    text: 'Does your child respond when you call his or her name?',
    example: 'Does he or she look up, talk or babble, or stop what he or she is doing when you call his or her name?',
    riskOnYes: false,
  },
  {
    id: 11,
    text: 'When you smile at your child, does he or she smile back at you?',
    example: '',
    riskOnYes: false,
  },
  {
    id: 12,
    text: 'Does your child get upset by everyday noises?',
    example: 'Does your child scream or cry to noise such as a vacuum cleaner or loud music?',
    riskOnYes: true,
  },
  {
    id: 13,
    text: 'Does your child walk?',
    example: '',
    riskOnYes: false,
  },
  {
    id: 14,
    text: 'Does your child look you in the eye when you are talking to him or her, playing with him or her, or dressing him or her?',
    example: '',
    riskOnYes: false,
  },
  {
    id: 15,
    text: 'Does your child try to copy what you do?',
    example: 'Wave bye-bye, clap, or make a funny noise when you do.',
    riskOnYes: false,
  },
  {
    id: 16,
    text: 'If you turn your head to look at something, does your child look around to see what you are looking at?',
    example: '',
    riskOnYes: false,
  },
  {
    id: 17,
    text: 'Does your child try to get you to watch him or her?',
    example: 'Does your child look at you for praise, or say "look" or "watch me"?',
    riskOnYes: false,
  },
  {
    id: 18,
    text: 'Does your child understand when you tell him or her to do something?',
    example: 'If you don\'t point, can your child understand "put the book on the chair" or "bring me the blanket"?',
    riskOnYes: false,
  },
  {
    id: 19,
    text: 'If something new happens, does your child look at your face to see how you feel about it?',
    example: 'If he or she hears a strange or funny noise, or sees a new toy, will he or she look at your face?',
    riskOnYes: false,
  },
  {
    id: 20,
    text: 'Does your child like movement activities?',
    example: 'Being swung or bounced on your knee.',
    riskOnYes: false,
  },
]

export type RiskLevel = 'low' | 'medium' | 'high'

export function scoreMChat(answers: Record<number, boolean>): { score: number; riskLevel: RiskLevel } {
  let riskCount = 0

  for (const q of MCHAT_QUESTIONS) {
    const answer = answers[q.id]
    if (answer === undefined) continue
    // answer is true for "Yes", false for "No"
    const isRisky = q.riskOnYes ? answer : !answer
    if (isRisky) riskCount++
  }

  let riskLevel: RiskLevel = 'low'
  if (riskCount >= 8) riskLevel = 'high'
  else if (riskCount >= 3) riskLevel = 'medium'

  return { score: riskCount, riskLevel }
}
