from __future__ import annotations

import json
from typing import Any


def build_consequence_prompt(action_description: str, game_state: dict[str, Any]) -> str:
    """Lean, structured context for the consequence engine only (no NPC voice)."""
    payload = {
        "scenarioLabel": game_state.get("scenarioLabel", ""),
        "balanceCents": game_state.get("balanceCents"),
        "goalAmountCents": game_state.get("goalAmountCents"),
        "treeHealth": game_state.get("treeHealth"),
        "tags": game_state.get("tags") or {},
        "eventSummaries": game_state.get("eventSummaries") or [],
        "recentNarratives": game_state.get("recentNarratives") or [],
        "playerActionThisTurn": action_description,
        "flowTailNodeId": game_state.get("flowTailNodeId"),
        "flowRecentLabels": game_state.get("flowRecentLabels") or [],
        "nextFlowIndex": game_state.get("nextFlowIndex"),
    }
    rules = (
        "You are the consequence engine for Penny's World, a kids' financial literacy story game. "
        "Given the JSON context, produce realistic kid-friendly outcomes. "
        "Stay in third person (Penny). No lectures; show consequences through small concrete scenes. "
        "Respond with a single JSON object only, no markdown, keys: "
        'narrative (string), stateDelta (object with optional balanceCents, goalAmountCents, treeHealth integers), '
        "newTags (object of tag updates, can be empty). "
        "Optional flowUpdate for a story-path diagram the UI will render: "
        '{ "nodes": [ { "id": string (unique, e.g. path_save_2), "label": short title, '
        '"kind": optional tag like Spend|Save|Fork|Moment, "hint": optional one-line teaser } ], '
        '"edges": [ { "from": id, "to": id } ] }. '
        "When the turn suggests a fork, temptation, or alternate path Penny did not take, add 2-3 nodes "
        "and edges chaining from flowTailNodeId to show those routes. If the turn is simple, omit flowUpdate. "
        "balanceCents and treeHealth must stay plausible (treeHealth 0-100). "
        "If the action implies spending, decrease balanceCents accordingly; saving increases balance or treeHealth slightly."
    )
    return rules + "\n\nCONTEXT_JSON:\n" + json.dumps(payload, ensure_ascii=False)


def build_npc_prompt(persona: str, messages: list[dict[str, str]]) -> str:
    """Character-scoped prompt: persona + short transcript only."""
    transcript_lines: list[str] = []
    for m in messages[-10:]:
        role = m.get("role", "user")
        content = (m.get("content") or "").strip()
        label = "Penny" if role == "user" else "Character"
        transcript_lines.append(f"{label}: {content}")
    transcript = "\n".join(transcript_lines) if transcript_lines else "(no messages yet)"
    return (
        persona
        + "\n\nConversation so far:\n"
        + transcript
        + "\n\nReply as the character in 1-3 short paragraphs max. Stay in voice. No JSON."
    )
