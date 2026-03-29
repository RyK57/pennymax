from __future__ import annotations

import json
import re
from typing import Any

from api.clients.openai_client import get_api_key, message_text
from api.prompt_builder import build_consequence_prompt


def _extract_json_object(text: str) -> dict[str, Any]:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        raise ValueError("No JSON object in model response")
    return json.loads(m.group(0))


def _normalize_flow_update(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    nodes = raw.get("nodes")
    if not isinstance(nodes, list) or not nodes:
        return None
    clean_nodes: list[dict[str, Any]] = []
    for n in nodes:
        if not isinstance(n, dict):
            continue
        nid = str(n.get("id") or "").strip()
        label = str(n.get("label") or "").strip()
        if not nid or not label:
            continue
        kind = n.get("kind")
        hint = n.get("hint")
        item: dict[str, Any] = {
            "id": nid,
            "label": label[:80],
        }
        if kind:
            item["kind"] = str(kind)[:40]
        if hint:
            item["hint"] = str(hint)[:200]
        clean_nodes.append(item)
    if not clean_nodes:
        return None
    clean_edges: list[dict[str, str]] = []
    edges = raw.get("edges")
    if isinstance(edges, list):
        for e in edges:
            if not isinstance(e, dict):
                continue
            a = str(e.get("from") or e.get("source") or "").strip()
            b = str(e.get("to") or e.get("target") or "").strip()
            if a and b:
                clean_edges.append({"from": a, "to": b})
    return {"nodes": clean_nodes, "edges": clean_edges}


def mock_run(action_description: str, game_state: dict[str, Any]) -> dict[str, Any]:
    balance = int(game_state.get("balanceCents") or 0)
    tree = int(game_state.get("treeHealth") or 50)
    tags = dict(game_state.get("tags") or {})
    streak = int(tags.get("streak_days") or 0)
    lower = action_description.lower()
    spending = any(
        w in lower for w in ("spend", "bought", "mall", "game", "snack", "treat")
    )
    saving = any(
        w in lower for w in ("save", "saving", "bank", "jar", "piggy", "put $")
    )
    delta = -500 if spending else 300 if saving else 0
    if delta == 0 and "help" in lower:
        delta = -200
    new_balance = max(0, balance + delta)
    tree_delta = 4 if saving and not spending else -4 if spending else 1
    new_tree = max(0, min(100, tree + tree_delta))
    if saving and not spending:
        streak = streak + 1
    elif spending:
        streak = max(0, streak - 1)

    narrative = (
        f"Penny tries: {action_description.strip()[:160]}. "
        + (
            "The money tree loses a few leaves in the breeze—but Penny notices what happened."
            if spending
            else "A little more stability settles in; the tree's branches look a touch fuller."
            if saving
            else "The day moves on, and Penny carries the choice like a pebble in a pocket."
        )
    )

    idx = int(game_state.get("nextFlowIndex") or 0)
    beat_id = f"beat_{idx}"
    kind = "Spend" if spending else "Save" if saving else "Moment"
    flow_nodes: list[dict[str, Any]] = [
        {
            "id": beat_id,
            "label": action_description.strip()[:56] or "This turn",
            "kind": kind,
            "hint": narrative[:100],
        }
    ]
    flow_edges: list[dict[str, str]] = []
    if spending and saving is False:
        alt_id = f"beat_{idx}_save_fork"
        flow_nodes.append(
            {
                "id": alt_id,
                "label": "Could have banked it instead",
                "kind": "Fork",
                "hint": "The quieter path: pocket change adds up.",
            }
        )
        flow_edges.append({"from": beat_id, "to": alt_id})

    return {
        "narrative": narrative,
        "stateDelta": {"balanceCents": new_balance, "treeHealth": new_tree},
        "newTags": {"streak_days": streak, "impulsive_spender": bool(spending)},
        "flowUpdate": {"nodes": flow_nodes, "edges": flow_edges},
    }


def run_consequence(action_description: str, game_state: dict[str, Any]) -> dict[str, Any]:
    if not get_api_key():
        return mock_run(action_description, game_state)

    prompt = build_consequence_prompt(action_description, game_state)
    system = (
        "You output only valid JSON with keys narrative, stateDelta, newTags, "
        "and optionally flowUpdate (object with nodes and edges arrays). "
        "No markdown fences."
    )
    raw = message_text(prompt, system=system)
    data = _extract_json_object(raw)
    narrative = str(data.get("narrative") or "").strip()
    state_delta = data.get("stateDelta") if isinstance(data.get("stateDelta"), dict) else {}
    new_tags = data.get("newTags") if isinstance(data.get("newTags"), dict) else {}
    if not narrative:
        return mock_run(action_description, game_state)

    out: dict[str, Any] = {
        "narrative": narrative,
        "stateDelta": state_delta,
        "newTags": new_tags,
    }
    flow_update = _normalize_flow_update(data.get("flowUpdate"))
    if flow_update:
        out["flowUpdate"] = flow_update
    return out
