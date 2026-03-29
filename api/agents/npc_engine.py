from __future__ import annotations

from typing import Any

from api.clients.openai_client import get_api_key, message_text
from api.prompt_builder import build_npc_prompt


def mock_npc_reply(npc_id: str, messages: list[dict[str, str]]) -> str:
    last_user = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            last_user = (m.get("content") or "").strip()
            break
    snippet = (last_user or "this week")[:120]
    if npc_id == "grandpa":
        return (
            f"Hmm, “{snippet}”… Trees grow slow on purpose, Penny. "
            "What part of that choice are you proudest of?"
        )
    if npc_id == "friend":
        return f"No way, you did that? {snippet} — tell me everything. Was it worth it?"
    if npc_id == "shopkeeper":
        return (
            "Hey Penny! If you're swinging by, I've got apples on sale. "
            "What's on your mind today?"
        )
    if npc_id == "coach":
        return (
            f"Okay, team talk: “{snippet}” — money stuff on a squad is like sharing water bottles: "
            "everyone needs a fair sip. Want to game-plan a way to make it easier on folks who are tight?"
        )
    if npc_id == "cousin":
        return (
            f"Okay okay, {snippet} — I respect the move. "
            "Real question: does it get you closer to your big goal, or is it just the vibe today?"
        )
    if npc_id == "librarian":
        return (
            f"Love that you're thinking about “{snippet}.” "
            "Remember: the library is basically a cheat code for fun with a $0 price tag—want me to point you at a stack?"
        )
    return "I'm here—what's up, Penny?"


def run_npc(npc_id: str, persona: str, messages: list[dict[str, str]]) -> str:
    if not get_api_key():
        return mock_npc_reply(npc_id, messages)
    prompt = build_npc_prompt(persona, messages)
    text = message_text(prompt)
    return text.strip() or mock_npc_reply(npc_id, messages)
