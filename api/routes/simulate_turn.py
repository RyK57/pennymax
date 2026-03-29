from __future__ import annotations

from flask import Blueprint, jsonify, request

from api.agents.consequence_engine import run_consequence

bp = Blueprint("simulate_turn", __name__)


@bp.post("/api/simulate-turn")
def simulate_turn():
    data = request.get_json(silent=True) or {}
    action = (data.get("actionDescription") or "").strip()
    game_state = data.get("gameState")
    if not action:
        return jsonify({"error": "actionDescription is required"}), 400
    if not isinstance(game_state, dict):
        return jsonify({"error": "gameState object is required"}), 400

    try:
        result = run_consequence(action, game_state)
        return jsonify(result)
    except Exception as e:  # noqa: BLE001 — prototype boundary
        return jsonify({"error": str(e)}), 500
