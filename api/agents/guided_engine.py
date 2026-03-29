from __future__ import annotations

import hashlib
import json
import uuid
from typing import Any

from api.agents.dsg_money_tree_script import (
    CARTOON_IMAGE_STYLE_PREFIX,
    SYSTEM_PROMPT,
)
from api.clients.gemini_image_client import generate_guided_scene_image_data_url
from api.clients.openai_client import get_api_key, message_json_object

SESSIONS: dict[str, dict[str, Any]] = {}


def _placeholder_image_url(session_id: str, turn: int) -> str:
    seed = hashlib.sha256(f"{session_id}:{turn}".encode()).hexdigest()[:12]
    return f"https://picsum.photos/seed/{seed}/1200/900"


def _resolve_scene_image_url(
    session_id: str, turn: int, full_image_prompt: str
) -> str:
    data_url = generate_guided_scene_image_data_url(full_image_prompt)
    if data_url:
        return data_url
    return _placeholder_image_url(session_id, turn)


def _clamp_int(v: Any, lo: int, hi: int, default: int) -> int:
    try:
        n = int(v)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, n))


def _normalize_actions(raw: Any, limit: int = 10) -> list[str]:
    if not isinstance(raw, list):
        return []
    out: list[str] = []
    for x in raw:
        s = str(x).strip()
        if s and s not in out:
            out.append(s)
        if len(out) >= limit:
            break
    while len(out) < 3:
        out.append("⭐ Take a breath and tell Penny what feels right.")
    return out[:limit]


def _parse_llm_payload(
    data: dict[str, Any],
    session_id: str,
    turn: int,
    profile: dict[str, Any],
) -> dict[str, Any]:
    script_step = _clamp_int(data.get("scriptStep"), 1, 10, 1)
    step_title = str(data.get("stepTitle") or f"Step {script_step} of 10").strip()
    scene_description = str(data.get("sceneDescription") or "").strip()
    raw_prompt = str(data.get("imagePrompt") or scene_description).strip()
    image_prompt = (CARTOON_IMAGE_STYLE_PREFIX + raw_prompt).strip()
    question = str(data.get("question") or "What should Penny do next?").strip()
    narrative_summary = str(data.get("narrativeSummary") or "").strip()
    suggested = _normalize_actions(data.get("suggestedActions"))

    goal_default = _clamp_int(profile.get("goalAmountCents"), 100_00, 99_999_999_00, 20_000_00)
    balance = _clamp_int(data.get("balanceCents"), 0, 99_999_999, 0)
    goal = _clamp_int(data.get("goalAmountCents"), 100_00, 99_999_999_00, goal_default)
    score = _clamp_int(data.get("score"), 0, 100, 50)
    tree = _clamp_int(data.get("treeHealth"), 0, 100, 10)
    outcome = str(data.get("outcome") or "playing").strip().lower()
    if outcome not in ("playing", "won", "lost"):
        outcome = "playing"

    if tree <= 0 and outcome == "playing":
        outcome = "lost"

    grandpa = data.get("grandpaHint")
    grandpa_hint = str(grandpa).strip() if grandpa else None
    letter_raw = data.get("pennyLetter")
    penny_letter = str(letter_raw).strip() if letter_raw else None

    return {
        "scriptStep": script_step,
        "stepTitle": step_title,
        "sceneDescription": scene_description,
        "imagePrompt": image_prompt,
        "question": question,
        "suggestedActions": suggested,
        "narrativeSummary": narrative_summary,
        "balanceCents": balance,
        "goalAmountCents": goal,
        "score": score,
        "treeHealth": tree,
        "outcome": outcome,
        "grandpaHint": grandpa_hint,
        "pennyLetter": penny_letter,
    }


def _profile_block(profile: dict[str, Any]) -> str:
    return json.dumps(profile, indent=2)


def _age_language_note(age_range: str) -> str:
    ar = (age_range or "").lower()
    if "5" in ar or "6" in ar:
        return "Use very short sentences, concrete words, read-aloud rhythm (ages 5–6)."
    if "7" in ar or "8" in ar:
        return "Warm, clear language; simple cause-and-effect (ages 7–8)."
    return "Slightly richer vocabulary but still kid-safe and encouraging (ages 9–10)."


def run_guided_start(profile: dict[str, Any]) -> dict[str, Any]:
    if not get_api_key():
        raise RuntimeError("OPENAI_API_KEY is not set")

    try:
        goal_cents = int(profile["goalAmountCents"])
    except (KeyError, TypeError, ValueError):
        raise ValueError("profile.goalAmountCents is required (integer cents)") from None
    profile = {**profile, "goalAmountCents": goal_cents}

    session_id = str(uuid.uuid4())
    age_note = _age_language_note(str(profile.get("ageRange", "")))

    prompt = f"""Begin the guided experience at SCRIPT STEP 1 only.

Child profile (obey every field):
{_profile_block(profile)}

Language level: {age_note}

Execute STEP 1 — Penny Has a Dream from the bible:
- Penny discovers the family needs a better home; she has ~$0 saved; big emotional wish.
- Money Tree appears as a tiny GRAY seedling; treeHealth should be about 10.
- savings goal for the story MUST align with goalAmountCents in the profile ({profile.get("goalAmountCents")} cents).
- Use onboarding interests (if any) to flavor hobbies Penny mentions; personality chip ids to shape how she earns/speaks; spenderStyle for tone about money habits.
- Later mall temptation must match temptation ids (e.g. sneakers, tech); difficulty (easy/medium/hard) sets how many temptations and how tricky choices feel — honor it from the start in voice.
- Opening narration should echo the scripted beat emotionally (paraphrase allowed).
- suggestedActions: 10 options nudging toward understanding the dream + asking for help / first tiny save ideas; majority ⭐.

Return all JSON keys per schema (scriptStep should be 1, outcome "playing", pennyLetter null).
"""

    raw = message_json_object(prompt, system=SYSTEM_PROMPT)
    if not isinstance(raw, dict):
        raise RuntimeError("Model returned non-object JSON")

    turn = 0
    payload = _parse_llm_payload(raw, session_id, turn, profile)
    payload["imageUrl"] = _resolve_scene_image_url(
        session_id, turn, payload["imagePrompt"]
    )
    payload["sessionId"] = session_id
    payload["turnIndex"] = turn

    SESSIONS[session_id] = {
        "profile": profile,
        "turnIndex": turn,
        "scriptStep": payload["scriptStep"],
        "narrativeSummary": payload["narrativeSummary"],
        "balanceCents": payload["balanceCents"],
        "goalAmountCents": payload["goalAmountCents"],
        "score": payload["score"],
        "treeHealth": payload["treeHealth"],
        "lastKidResponse": "",
        "sceneDescription": payload["sceneDescription"],
    }
    return payload


def run_guided_step(session_id: str, kid_response: str) -> dict[str, Any]:
    if not get_api_key():
        raise RuntimeError("OPENAI_API_KEY is not set")

    kid_response = (kid_response or "").strip()
    if not kid_response:
        raise ValueError("kidResponse is required")

    state = SESSIONS.get(session_id)
    if not state:
        raise ValueError("Unknown session")

    profile = state["profile"]
    turn = int(state["turnIndex"]) + 1
    script_step = int(state.get("scriptStep", 1))
    age_note = _age_language_note(str(profile.get("ageRange", "")))

    prompt = f"""Continue Penny & the Money Tree. Obey the full bible in your system instructions.

Child profile:
{_profile_block(profile)}

Language level: {age_note}

Session state:
- scriptStep BEFORE this turn: {script_step}
- narrativeSummary: {state.get("narrativeSummary", "")}
- last sceneDescription: {state.get("sceneDescription", "")}
- balanceCents: {state.get("balanceCents")}
- goalAmountCents: {state.get("goalAmountCents")}
- score: {state.get("score")}
- treeHealth: {state.get("treeHealth")}

The child just said or chose:
"{kid_response}"

Infer whether this choice was mostly a smart money move (⭐) or a tempting mistake (❌). Update treeHealth and balanceCents accordingly; follow bible ratios for suggestedActions.

Advance scriptStep only when the beat's learning goal is met (e.g. Step 2 until rules acknowledged; Step 3 until enough earned). When in doubt, keep scriptStep the same for another exchange.

If you are at Step 10 or just achieved golden tree win, set outcome to "won" and fill pennyLetter.

If tree dies (0%) with kind game-over, set outcome "lost", suggestedActions include restart / try again options.

Return complete JSON per schema.
"""

    raw = message_json_object(prompt, system=SYSTEM_PROMPT)
    if not isinstance(raw, dict):
        raise RuntimeError("Model returned non-object JSON")

    payload = _parse_llm_payload(raw, session_id, turn, profile)
    payload["imageUrl"] = _resolve_scene_image_url(
        session_id, turn, payload["imagePrompt"]
    )
    payload["sessionId"] = session_id
    payload["turnIndex"] = turn

    SESSIONS[session_id] = {
        "profile": profile,
        "turnIndex": turn,
        "scriptStep": payload["scriptStep"],
        "narrativeSummary": payload["narrativeSummary"],
        "balanceCents": payload["balanceCents"],
        "goalAmountCents": payload["goalAmountCents"],
        "score": payload["score"],
        "treeHealth": payload["treeHealth"],
        "lastKidResponse": kid_response,
        "sceneDescription": payload["sceneDescription"],
    }
    return payload
