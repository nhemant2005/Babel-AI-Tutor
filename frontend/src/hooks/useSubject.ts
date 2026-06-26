import { client } from "../lib/client";
import { useState, useCallback } from "react";

export function useSubject(subjectId: string | null) {
  const [subject, setSubject] = useState<any>(null);

  const refresh = useCallback(async () => {
    if (!subjectId) return;
    const rec = await (client as any).records.get("subjects", subjectId);
    setSubject(rec);
  }, [subjectId]);

  const createRecord = useCallback(async (data: Record<string, unknown>) => {
    const rec = await (client as any).records.create("subjects", data);
    setSubject(rec);
    return rec;
  }, []);

  const updateRecord = useCallback(async (id: string, data: Record<string, unknown>) => {
    const rec = await (client as any).records.update("subjects", id, data);
    setSubject(rec);
    return rec;
  }, []);

  return { subject, createRecord, updateRecord, refresh };
}
