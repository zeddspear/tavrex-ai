import { z } from 'zod';
import { meetingSchema } from '../../../../packages/shared/meeting';

// One permissioned reference recording plus original synthetic examples.
export const meetings = z.array(meetingSchema).parse([
  {
    id: 'recording-walkthrough',
    title: 'From conversation to recording',
    category: 'Product',
    date: '2026-09-13T12:00:00Z',
    duration: 104,
    participants: ['Presenter', 'Participant'],
    summary:
      'A real reference demo of recording controls, marking important moments, and returning to the conversation after a call.',
    takeaways: [],
    actions: [],
    provenance: 'reference-recording',
  },
  {
    id: 'product-direction',
    title: 'A simpler first five minutes',
    category: 'Product',
    date: '2026-09-11T10:00:00Z',
    duration: 1472,
    participants: ['Alex Morgan', 'Sam Rivera', 'Jordan Lee'],
    summary:
      'The team aligned on a shorter onboarding flow, a focused pilot, and a clearer definition of activation.',
    takeaways: [
      'Start with one useful project instead of a lengthy setup checklist.',
      'Measure activation by the first completed workflow.',
      'Run a small pilot before opening the new experience to everyone.',
    ],
    actions: [
      { task: 'Map the three-step onboarding flow', owner: 'Sam Rivera' },
      { task: 'Define the pilot success measures', owner: 'Alex Morgan' },
      { task: 'Prepare the prototype for review', owner: 'Jordan Lee' },
    ],
    provenance: 'synthetic',
  },
  {
    id: 'customer-discovery',
    title: 'Making handoffs feel effortless',
    category: 'Customer',
    date: '2026-09-10T14:30:00Z',
    duration: 1938,
    participants: ['Alex Morgan', 'Taylor Chen'],
    summary:
      'A discovery conversation about lost context between teams, shared ownership, and what a successful pilot should prove.',
    takeaways: [
      'Context is scattered across messages and meeting notes.',
      'A shared handoff should identify an owner and a next step.',
      'The pilot should test whether teams can find decisions without another meeting.',
    ],
    actions: [
      { task: 'Draft a sample handoff checklist', owner: 'Alex Morgan' },
      { task: 'Identify two workflows for the pilot', owner: 'Taylor Chen' },
    ],
    provenance: 'synthetic',
  },
  {
    id: 'design-review',
    title: 'Less noise. More context.',
    category: 'Design',
    date: '2026-09-09T09:00:00Z',
    duration: 1105,
    participants: ['Sam Rivera', 'Jordan Lee', 'Casey Park'],
    summary:
      'A design review of the activity feed, with an emphasis on readable updates and bringing decisions closer to their source.',
    takeaways: [
      'Group activity by project so updates have context.',
      'Make the next action visible without opening a second panel.',
      'Use a restrained visual hierarchy for status and ownership.',
    ],
    actions: [
      { task: 'Revise the activity feed prototype', owner: 'Jordan Lee' },
      {
        task: 'Check keyboard navigation in the prototype',
        owner: 'Casey Park',
      },
    ],
    provenance: 'synthetic',
  },
]);
