import { describe, expect, it } from 'vitest';
import fixture from '../../apps/web/public/recordings/recording-walkthrough.json';
import { activeSegment, boundedTime, recordingSchema } from './recording';

describe('recording contract and timing', () => {
  it('validates the actual imported fixture', () => {
    expect(recordingSchema.safeParse(fixture).success).toBe(true);
  });
  it('rejects overlapping turns, unknown speakers and out-of-bounds timestamps', () => {
    for (const change of [
      { start: 0 },
      { speakerId: 'missing' },
      { end: 999 },
    ]) {
      expect(
        recordingSchema.safeParse({
          ...fixture,
          segments: [
            fixture.segments[0],
            { ...fixture.segments[1], ...change },
          ],
        }).success,
      ).toBe(false);
    }
  });
  it('accepts an empty transcript so the recording remains usable', () => {
    expect(
      recordingSchema.safeParse({ ...fixture, segments: [] }).success,
    ).toBe(true);
  });
  it('selects the active speaker at exact boundaries and leaves silence unselected', () => {
    expect(activeSegment(fixture.segments, 0)).toBeNull();
    expect(activeSegment(fixture.segments, 2.7)).toBe('presenter-turn');
    expect(activeSegment(fixture.segments, 97.169)).toBe('presenter-turn');
    expect(activeSegment(fixture.segments, 97.17)).toBe('participant-turn');
    expect(activeSegment(fixture.segments, 103.8)).toBeNull();
  });
  it('clamps seeks to playable bounds', () => {
    expect(boundedTime(-5, 103.8)).toBe(0);
    expect(boundedTime(500, 103.8)).toBe(103.8);
    expect(boundedTime(NaN, 103.8)).toBe(0);
  });
});
