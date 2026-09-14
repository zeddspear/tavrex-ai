import { z } from 'zod';

export const segmentSchema = z.object({
  id: z.string().min(1),
  speakerId: z.string().min(1),
  start: z.number().nonnegative(),
  end: z.number().positive(),
  paragraphs: z.array(z.string().min(1)).min(1),
});

export const recordingSchema = z
  .object({
    mediaUrl: z.string().startsWith('/media/'),
    posterUrl: z.string().startsWith('/media/'),
    duration: z.number().positive(),
    speakers: z.array(z.object({ id: z.string(), name: z.string() })).min(1),
    segments: z.array(segmentSchema),
  })
  .superRefine((recording, context) => {
    const ids = new Set<string>();
    const speakerIds = new Set(recording.speakers.map((speaker) => speaker.id));
    recording.segments.forEach((segment, index) => {
      if (
        ids.has(segment.id) ||
        !speakerIds.has(segment.speakerId) ||
        segment.start >= segment.end ||
        segment.end > recording.duration ||
        (index > 0 && segment.start < recording.segments[index - 1].end)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['segments', index],
          message: 'Invalid transcript timing or speaker reference',
        });
      }
      ids.add(segment.id);
    });
  });

export type Recording = z.infer<typeof recordingSchema>;
export type Segment = z.infer<typeof segmentSchema>;

export function activeSegment(
  segments: Segment[],
  time: number,
): string | null {
  return (
    segments.find((segment) => time >= segment.start && time < segment.end)
      ?.id ?? null
  );
}

export function boundedTime(time: number, duration: number): number {
  return Math.min(
    Math.max(0, Number.isFinite(time) ? time : 0),
    Math.max(0, duration),
  );
}
