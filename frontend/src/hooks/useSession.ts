import { client } from "../lib/client";
import { useCallback } from "react";

export function useSession() {
  const startSession = useCallback(async (topicId: string, subjectId: string): Promise<string> => {
    const session = await (client as any).records.create("sessions", {
      topic_id: topicId,
      subject_id: subjectId,
      started_at: new Date().toISOString(),
      pomodoro_cycles: 0,
    });
    return session.id;
  }, []);

  return { startSession };
}
