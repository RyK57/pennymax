from __future__ import annotations

import os
from typing import Any


def get_api_key() -> str | None:
    return os.environ.get("OPENAI_API_KEY") or None


def get_model_id() -> str:
    return os.environ.get("OPENAI_MODEL", "gpt-4o-mini")


def message_text(prompt: str, *, system: str | None = None) -> str:
    """Send chat completion; return assistant text. Raises on API errors."""
    from openai import OpenAI

    client = OpenAI(api_key=get_api_key())
    messages: list[dict[str, Any]] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        model=get_model_id(),
        messages=messages,
        max_tokens=1200,
    )
    choice = response.choices[0].message.content
    return (choice or "").strip()


def message_json_object(prompt: str, *, system: str | None = None) -> dict:
    """Chat completion with JSON object response. Raises on parse/API errors."""
    import json

    from openai import OpenAI

    client = OpenAI(api_key=get_api_key())
    messages: list[dict[str, Any]] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        model=get_model_id(),
        messages=messages,
        max_tokens=2000,
        response_format={"type": "json_object"},
    )
    raw = (response.choices[0].message.content or "").strip()
    return json.loads(raw)
