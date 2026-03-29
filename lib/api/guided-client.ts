import { postJson } from "@/lib/api/flask-client"
import type { GuidedProfile, GuidedScenePayload } from "@/lib/types/guided"

export async function postGuidedStart(
  profile: GuidedProfile
): Promise<GuidedScenePayload> {
  return postJson<GuidedScenePayload>("/api/guided/start", { profile })
}

export async function postGuidedStep(
  sessionId: string,
  kidResponse: string
): Promise<GuidedScenePayload> {
  return postJson<GuidedScenePayload>("/api/guided/step", {
    sessionId,
    kidResponse,
  })
}
