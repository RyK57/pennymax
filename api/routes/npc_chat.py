from __future__ import annotations

from flask import Blueprint, jsonify, request

from api.agents.npc_engine import run_npc

bp = Blueprint("npc_chat", __name__)


@bp.post("/api/npc-chat")
def npc_chat():
    data = request.get_json(silent=True) or {}
    npc_id = (data.get("npcId") or "").strip()
    persona = (data.get("persona") or "").strip()
    messages = data.get("messages")
    if not npc_id or not persona:
        return jsonify({"error": "npcId and persona are required"}), 400
    if not isinstance(messages, list):
        return jsonify({"error": "messages array is required"}), 400

    normalized: list[dict[str, str]] = []
    for m in messages:
        if not isinstance(m, dict):
            continue
        role = str(m.get("role", "user"))
        content = str(m.get("content", ""))
        if role not in ("user", "assistant"):
            role = "user"
        normalized.append({"role": role, "content": content})

    try:
        text = run_npc(npc_id, persona, normalized)
        return jsonify({"message": text})
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": str(e)}), 500
