export interface ActionPresetGroup {
  id: string
  label: string
  description: string
  actions: string[]
}

export const ACTION_PRESET_GROUPS: ActionPresetGroup[] = [
  {
    id: "save",
    label: "Save & stash",
    description: "Grow the tree house fund",
    actions: [
      "Put $5 in savings",
      "Deposit half of allowance at the bank",
      "Start a labeled jar for the house goal",
      "Skip a snack run and move $3 to savings",
      "Negotiate extra chores for allowance",
      "Round up purchases mentally and save the difference",
    ],
  },
  {
    id: "spend",
    label: "Spend & trade-offs",
    description: "Choices with a price tag",
    actions: [
      "Spend $5 at the mall on a keychain",
      "Buy the deluxe game pass for the month",
      "Treat friends to slushies after school",
      "Replace a lost water bottle with a fancy one",
      "Order delivery instead of packing lunch once",
      "Buy the limited poster before it sells out",
    ],
  },
  {
    id: "give",
    label: "Give & community",
    description: "Money that leaves your pocket on purpose",
    actions: [
      "Help a friend with $2 for lunch",
      "Donate $1 to the class fundraiser",
      "Buy extra canned goods for the food drive",
      "Spot a sibling half their goal for a small toy",
      "Pay back a borrowed dollar with a thank-you note",
      "Chip in for a group gift for a teacher",
    ],
  },
  {
    id: "learn",
    label: "Learn & plan",
    description: "Research, mistakes, and grown-up stuff",
    actions: [
      "Ask a parent to explain the bank receipt",
      "Compare three prices online before buying",
      "Track every dollar in a notebook for one week",
      "Say no to an impulse buy and write why",
      "Research what 'interest' means with Grandpa",
      "Plan a no-spend weekend with friends",
    ],
  },
  {
    id: "curveballs",
    label: "Plot twists",
    description: "Let the story surprise you",
    actions: [
      "Find $10 on the sidewalk—what does Penny do?",
      "Lose a $20 gift card the same day fees are due",
      "Get invited to two parties the same weekend",
      "Break a phone screen—repair or live with cracks?",
      "Win a small contest prize—save, spend, or split?",
      "A friend pressures Penny to 'just borrow' money",
    ],
  },
]
