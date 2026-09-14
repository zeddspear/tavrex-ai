import { meetingSearchDocumentsSchema } from '../../../../packages/shared/search';
import { meetings } from './meetings';

export const searchDocuments = meetingSearchDocumentsSchema.parse([
  {
    meetingId: 'recording-walkthrough',
    transcript: [
      {
        id: 'recording-start',
        speaker: 'Presenter',
        start: 2.7,
        text: "If you don't, you'll see a Fathom panel also on your screen with a Start Recording button. Go ahead and click that button so that Fathom can join this meeting now.",
      },
      {
        id: 'recording-presence',
        speaker: 'Presenter',
        start: 14,
        text: "Here is where the magic happens. Fathom has your back. You don't have to click a single button or take a single note.",
      },
      {
        id: 'recording-capture',
        speaker: 'Presenter',
        start: 22,
        text: 'Fathom will capture all of the important moments and action items and then will deliver them to your inbox within 30 seconds of the meeting ending.',
      },
      {
        id: 'recording-highlight',
        speaker: 'Presenter',
        start: 33,
        text: "You don't have to click a thing. But say that a really special moment on the call does happen that you know you want to go back and rewatch.",
      },
      {
        id: 'recording-panel-highlight',
        speaker: 'Presenter',
        start: 50,
        text: "There's a highlight button on that Fathom panel. Go ahead and click that and you'll see it highlighted on the call recording page, which I'm also going to show you in a minute.",
      },
      {
        id: 'recording-stop',
        speaker: 'Presenter',
        start: 57,
        text: 'Anytime you want Fathom to stop recording, there is an end button on that Fathom panel. You can click that and Fathom will stop recording or when all participants.',
      },
      {
        id: 'recording-summary',
        speaker: 'Presenter',
        start: 64,
        text: 'Participants leave the meeting. Fathom will also stop recording. Once the call is done being recorded, that control panel will flip to a new screen and will have a big blue button that says view recording and summary.',
      },
      {
        id: 'recording-handoff',
        speaker: 'Presenter',
        start: 78,
        text: "When you click that button, it will take you to the call recording page. Alright, now go ahead, end this meeting, and then click that view recording and summary button, and I'll see you over on the call recording page.",
      },
      {
        id: 'recording-goodbye',
        speaker: 'Presenter',
        start: 95,
        text: 'See you there! Thanks, thanks.',
      },
      {
        id: 'recording-issue',
        speaker: 'Participant',
        start: 97.17,
        text: 'But my video is not getting recorded. Okay, let me end this meeting.',
      },
    ],
  },
  {
    meetingId: 'product-direction',
    transcript: [
      {
        id: 'product-first-five',
        speaker: 'Sam Rivera',
        start: 128,
        text: 'If we want the pilot to teach us anything, the first five minutes need one useful project and one completed workflow.',
      },
      {
        id: 'product-activation',
        speaker: 'Alex Morgan',
        start: 421,
        text: 'The activation signal should be the first completed workflow, not the number of setup steps.',
      },
    ],
  },
  {
    meetingId: 'customer-discovery',
    transcript: [
      {
        id: 'customer-context',
        speaker: 'Taylor Chen',
        start: 312,
        text: 'The problem is not a lack of notes. Context gets scattered across messages, so the next team cannot see who owns the handoff.',
      },
      {
        id: 'customer-pilot',
        speaker: 'Alex Morgan',
        start: 744,
        text: 'A useful pilot would prove that a team can find the decision and next step without booking another meeting.',
      },
    ],
  },
  {
    meetingId: 'design-review',
    transcript: [
      {
        id: 'design-context',
        speaker: 'Jordan Lee',
        start: 185,
        text: 'The activity feed needs less noise and enough context to understand why an update matters.',
      },
      {
        id: 'design-keyboard',
        speaker: 'Casey Park',
        start: 638,
        text: 'Keep the next action close to its source and make keyboard navigation part of the review.',
      },
    ],
  },
]);

for (const document of searchDocuments) {
  const meeting = meetings.find((item) => item.id === document.meetingId);
  if (
    !meeting ||
    document.transcript.some((segment) => segment.start > meeting.duration)
  ) {
    throw new Error(`Invalid public search document for ${document.meetingId}`);
  }
}
