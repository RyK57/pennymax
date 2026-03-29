from __future__ import annotations

from flask import Blueprint, jsonify, request

bp = Blueprint("consolidate", __name__)


@bp.post("/api/consolidate")
def consolidate():
    """Stub for memory compaction; extend with summarisation + DB deletes later."""
    data = request.get_json(silent=True) or {}
    events = data.get("events") or []
    _ = events
    return jsonify(
        {
            "ok": True,
            "summary": "Prototype compaction: no rows merged yet.",
        }
    )
