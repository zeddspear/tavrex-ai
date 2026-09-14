import { z } from 'zod';

export const segmentSchema = z.object({
  id: z.string().min(1),
  speakerId: z.string().min(1),
  start: z.number().nonnegative(),
  end: z.number().positive(),
  paragraphs: z.array(z.string().min(1)).min(1),
});

export const summaryTemplateKeySchema = z.enum([
  'general',
  'sales-customer',
  'recruiting-interview',
]);

const sourcedTextSchema = z.object({
  text: z.string().min(1),
  source: z.number().nonnegative(),
});

const summaryTemplateSchema = z.object({
  key: summaryTemplateKeySchema,
  label: z.string().min(1),
  descriptor: z.string().min(1),
  title: z.string().min(1),
  overview: z.string().min(1),
  sections: z
    .array(
      z.object({
        title: z.string().min(1),
        items: z.array(sourcedTextSchema).min(1),
      }),
    )
    .min(2),
});

const actionItemSchema = z.object({
  id: z.string().min(1),
  task: z.string().min(1),
  owner: z.string().min(1).nullable(),
  timing: z.string().min(1).nullable(),
  source: z.number().nonnegative(),
});

const intelligenceSchema = z.object({
  provenance: z.literal('prepared-demo'),
  templates: z.array(summaryTemplateSchema).length(3),
  actions: z.array(actionItemSchema).min(1),
});

export const recordingSchema = z
  .object({
    mediaUrl: z.string().startsWith('/media/'),
    posterUrl: z.string().startsWith('/media/'),
    duration: z.number().positive(),
    speakers: z.array(z.object({ id: z.string(), name: z.string() })).min(1),
    segments: z.array(segmentSchema),
    intelligence: intelligenceSchema,
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
    const templateKeys = new Set(
      recording.intelligence.templates.map((template) => template.key),
    );
    for (const required of summaryTemplateKeySchema.options) {
      if (!templateKeys.has(required)) {
        context.addIssue({
          code: 'custom',
          path: ['intelligence', 'templates'],
          message: `Missing ${required} summary template`,
        });
      }
    }
    recording.intelligence.templates.forEach((template, templateIndex) => {
      template.sections.forEach((section, sectionIndex) => {
        section.items.forEach((item, itemIndex) => {
          if (item.source > recording.duration) {
            context.addIssue({
              code: 'custom',
              path: [
                'intelligence',
                'templates',
                templateIndex,
                'sections',
                sectionIndex,
                'items',
                itemIndex,
                'source',
              ],
              message: 'Summary source exceeds recording duration',
            });
          }
        });
      });
    });
    recording.intelligence.actions.forEach((action, index) => {
      if (action.source > recording.duration) {
        context.addIssue({
          code: 'custom',
          path: ['intelligence', 'actions', index, 'source'],
          message: 'Action source exceeds recording duration',
        });
      }
    });
  });

export type Recording = z.infer<typeof recordingSchema>;
export type Segment = z.infer<typeof segmentSchema>;
export type MeetingIntelligence = Recording['intelligence'];
export type SummaryTemplateKey = z.infer<typeof summaryTemplateKeySchema>;

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
