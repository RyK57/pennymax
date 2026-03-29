from __future__ import annotations

from flask import Blueprint, jsonify, request

from api.agents.guided_engine import run_guided_start, run_guided_step

bp = Blueprint("guided", __name__)


@bp.post("/api/guided/start")
def guided_start():
    data = request.get_json(silent=True) or {}
    profile = data.get("profile")
    if not isinstance(profile, dict):
        return jsonify({"error": "profile object is required"}), 400

    try:
        result = run_guided_start(profile)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": str(e)}), 500


@bp.post("/api/guided/step")
def guided_step():
    data = request.get_json(silent=True) or {}
    session_id = (data.get("sessionId") or "").strip()
    kid_response = (data.get("kidResponse") or "").strip()
    if not session_id:
        return jsonify({"error": "sessionId is required"}), 400
    if not kid_response:
        return jsonify({"error": "kidResponse is required"}), 400

    try:
        result = run_guided_step(session_id, kid_response)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": str(e)}), 500
