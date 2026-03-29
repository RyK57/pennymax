from __future__ import annotations

import base64
import io
import logging
import os
import re
import time
from pathlib import Path
from typing import Any, Callable


logger = logging.getLogger(__name__)

# Repo root: consumer/ (api/clients -> parents[2])
_REPO_ROOT = Path(__file__).resolve().parents[2]

# Default image model = Gemini "Nano Banana" class (flash image preview) per Google GenAI SDK.
_DEFAULT_NANO_BANANA_MODEL = "gemini-3.1-flash-image-preview"

_REFERENCE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp", ".gif")


def _api_key() -> str | None:
    return (
        os.environ.get("GOOGLE_API_KEY")
        or os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GOOGLE_GENAI_API_KEY")
    )


def _model_id() -> str:
    return (
        os.environ.get("GUIDED_GEMINI_IMAGE_MODEL")
        or os.environ.get("NANO_BANANA_MODEL")
        or _DEFAULT_NANO_BANANA_MODEL
    ).strip()


def _gemini_disabled() -> bool:
    return os.environ.get("GUIDED_GEMINI_DISABLE", "").strip().lower() in (
        "1",
        "true",
        "yes",
    )


def _models_to_try() -> list[str]:
    primary = _model_id()
    raw = os.environ.get("GUIDED_GEMINI_IMAGE_MODEL_FALLBACKS", "").strip()
    fallbacks = [m.strip() for m in raw.split(",") if m.strip()]
    seen: set[str] = set()
    ordered: list[str] = []
    for m in [primary, *fallbacks]:
        if m not in seen:
            seen.add(m)
            ordered.append(m)
    return ordered


def _max_429_retries() -> int:
    """Extra attempts after the first 429 (0 = fail fast; avoids long HTTP timeouts)."""
    try:
        return max(0, min(5, int(os.environ.get("GUIDED_GEMINI_429_RETRIES", "0"))))
    except ValueError:
        return 0


def _is_rate_limited(exc: BaseException) -> bool:
    s = str(exc).lower()
    return "429" in s or "resource_exhausted" in s


def _free_tier_quota_exhausted(exc: BaseException) -> bool:
    """
    Google returns 429 with per-model free-tier limits; 'limit: 0' means this model
    is not available on the current plan — retries will not help until billing or
    a different model is used.
    """
    s = str(exc)
    if "limit: 0" not in s.lower():
        return False
    return "free_tier" in s.lower() or "quota exceeded" in s.lower()


def _retry_after_seconds(exc: BaseException) -> float | None:
    m = re.search(r"retry in ([\d.]+)\s*s", str(exc), re.IGNORECASE)
    if m:
        return min(120.0, max(1.0, float(m.group(1))))
    return None


def _run_with_optional_429_retry(label: str, fn: Callable[[], Any]) -> Any:
    max_retries = _max_429_retries()
    last: BaseException | None = None
    for attempt in range(max_retries + 1):
        try:
            return fn()
        except Exception as e:  # noqa: BLE001
            last = e
            if not _is_rate_limited(e):
                raise
            if _free_tier_quota_exhausted(e):
                logger.warning(
                    "Nano Banana %s: quota shows no remaining free-tier allowance for this "
                    "model (429, limit 0). Enable billing in Google AI / AI Studio, switch "
                    "GUIDED_GEMINI_IMAGE_MODEL, set GUIDED_GEMINI_IMAGE_MODEL_FALLBACKS, or "
                    "GUIDED_GEMINI_DISABLE=1 to skip images.",
                    label,
                )
                raise
            if attempt >= max_retries:
                raise
            delay = _retry_after_seconds(e)
            if delay is None:
                delay = min(60.0, 2.0 ** (attempt + 1))
            logger.warning(
                "Nano Banana %s rate-limited; retry %d/%d after %.1fs",
                label,
                attempt + 1,
                max_retries,
                delay,
            )
            time.sleep(delay)
    raise last  # pragma: no cover


def _aspect_ratio() -> str:
    v = (os.environ.get("GUIDED_GEMINI_ASPECT_RATIO") or "16:9").strip()
    allowed = {"1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"}
    return v if v in allowed else "16:9"


def _image_size() -> str:
    v = (os.environ.get("GUIDED_GEMINI_IMAGE_SIZE") or "1K").strip().upper()
    return v if v in ("1K", "2K", "4K") else "1K"


def _max_reference_files() -> int:
    try:
        return max(1, min(16, int(os.environ.get("GUIDED_GEMINI_MAX_REFERENCE_IMAGES", "8"))))
    except ValueError:
        return 8


def _collect_public_reference_dir() -> list[str]:
    """
    Primary reference pipeline: all images under public/reference/ (sorted by filename).
    """
    d = _REPO_ROOT / "reference"
    if not d.is_dir():
        logger.warning(
            "Guided reference folder missing: %s (create it and add PNG/JPG/WebP files)",
            d,
        )
        return []

    found: set[Path] = set()
    for ext in _REFERENCE_EXTENSIONS:
        found.update(d.glob(f"*{ext}"))
        found.update(d.glob(f"*{ext.upper()}"))
        found.update(d.glob(f"**/*{ext}"))
        found.update(d.glob(f"**/*{ext.upper()}"))

    files = sorted(
        (p.resolve() for p in found if p.is_file()),
        key=lambda p: p.name.lower(),
    )
    cap = _max_reference_files()
    paths = [str(p) for p in files[:cap]]
    if paths:
        logger.info(
            "Nano Banana refs: using %d file(s) from /reference: %s",
            len(paths),
            ", ".join(Path(p).name for p in paths),
        )
    else:
        logger.warning("/reference exists but no image files matched %s", _REFERENCE_EXTENSIONS)
    return paths


def _parse_extra_reference_env() -> list[str]:
    raw = os.environ.get("GUIDED_GEMINI_REFERENCE_IMAGES", "").strip()
    if not raw:
        return []
    out: list[str] = []
    for piece in raw.split(","):
        p = piece.strip()
        if not p:
            continue
        path = Path(p)
        if not path.is_absolute():
            path = _REPO_ROOT / path
        if path.is_file():
            out.append(str(path.resolve()))
        else:
            logger.warning("GUIDED_GEMINI_REFERENCE_IMAGES path missing: %s", path)
    return out


def _reference_paths() -> list[str]:
    """
    1) Images in /reference/ (canonical source for Penny / style refs).
    2) Extra paths from GUIDED_GEMINI_REFERENCE_IMAGES (appended, de-duped).
    """
    seen: set[str] = set()
    ordered: list[str] = []
    for p in _collect_public_reference_dir() + _parse_extra_reference_env():
        rp = str(Path(p).resolve())
        if rp not in seen:
            seen.add(rp)
            ordered.append(rp)
    return ordered[: _max_reference_files()]


def _load_reference_contents() -> list[Any]:
    try:
        from PIL import Image
    except ImportError:
        logger.warning("Pillow not installed; reference images disabled")
        return []

    images: list[Any] = []
    for fp in _reference_paths():
        try:
            images.append(Image.open(fp))
        except OSError as e:
            logger.warning("Could not open reference image %s: %s", fp, e)
    return images


def _extract_image_data_url(response: Any) -> str | None:
    parts = getattr(response, "parts", None)
    if not parts:
        try:
            cand = response.candidates[0]
            parts = cand.content.parts
        except Exception:  # noqa: BLE001
            parts = None
    if not parts:
        return None
    for part in parts:
        try:
            t = getattr(part, "text", None)
            if t is not None and str(t).strip():
                logger.debug("Gemini text part: %s", str(t)[:200])
        except Exception:  # noqa: BLE001
            pass
        try:
            pil_image = part.as_image()
        except Exception:  # noqa: BLE001
            pil_image = None
        if pil_image is not None:
            buf = io.BytesIO()
            try:
                pil_image.save(buf, format="PNG")
            except Exception as e:  # noqa: BLE001
                logger.warning("Saving Gemini image failed: %s", e)
                return None
            b64 = base64.standard_b64encode(buf.getvalue()).decode("ascii")
            return f"data:image/png;base64,{b64}"
    return None


def _use_chat_mode() -> bool:
    return os.environ.get("GUIDED_GEMINI_USE_CHAT", "").strip().lower() in (
        "1",
        "true",
        "yes",
    )


def generate_guided_scene_image_data_url(full_image_prompt: str) -> str | None:
    """
    Nano Banana (Gemini flash image) generation for guided scenes.

    Uses ``client.models.generate_content`` with optional PIL reference images from
    ``/reference/`` (plus GUIDED_GEMINI_REFERENCE_IMAGES).

    Returns a PNG data URL, or None → caller should use a placeholder.

    Env:
      GOOGLE_API_KEY | GEMINI_API_KEY
      GUIDED_GEMINI_IMAGE_MODEL | NANO_BANANA_MODEL (default gemini-3.1-flash-image-preview)
      GUIDED_GEMINI_IMAGE_MODEL_FALLBACKS — comma-separated extra models if primary fails (e.g. quota)
      GUIDED_GEMINI_DISABLE — if true, skip all image API calls (placeholders only)
      GUIDED_GEMINI_429_RETRIES — extra attempts on retryable 429 (default 0; avoids long HTTP waits)
      GUIDED_GEMINI_ASPECT_RATIO, GUIDED_GEMINI_IMAGE_SIZE
      GUIDED_GEMINI_MAX_REFERENCE_IMAGES (default 8)
      GUIDED_GEMINI_REFERENCE_IMAGES — extra comma-separated paths
      GUIDED_GEMINI_USE_CHAT — chat + google_search when no reference files loaded
    """
    if _gemini_disabled():
        logger.info("Nano Banana skipped: GUIDED_GEMINI_DISABLE is set")
        return None

    key = _api_key()
    if not key:
        logger.warning(
            "Nano Banana skipped: set GOOGLE_API_KEY or GEMINI_API_KEY for guided scene images"
        )
        return None

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        logger.warning("google-genai not installed; Nano Banana image generation disabled")
        return None

    client = genai.Client(api_key=key)
    refs = _load_reference_contents()
    models = _models_to_try()

    if _use_chat_mode() and not refs:
        for model in models:
            logger.info(
                "Nano Banana (chat+search): model=%s aspect=%s size=%s",
                model,
                _aspect_ratio(),
                _image_size(),
            )

            def do_chat(m: str = model) -> Any:
                chat = client.chats.create(
                    model=m,
                    config=types.GenerateContentConfig(
                        response_modalities=["TEXT", "IMAGE"],
                        tools=[{"google_search": {}}],
                        image_config=types.ImageConfig(
                            aspect_ratio=_aspect_ratio(),
                            image_size=_image_size(),
                        ),
                    ),
                )
                return chat.send_message(full_image_prompt)

            try:
                response = _run_with_optional_429_retry(f"chat:{model}", do_chat)
            except Exception as e:  # noqa: BLE001
                logger.warning("Nano Banana chat failed for model %s: %s", model, e)
                continue
            data_url = _extract_image_data_url(response)
            if data_url:
                logger.info("Nano Banana: received image from chat response (model=%s)", model)
                return data_url
            logger.warning("Nano Banana chat response had no image part (model=%s)", model)
        return None

    if refs:
        prefix = (
            "Use the attached reference image(s) for consistent character design, "
            "color palette, and illustration style. Match their cartoon look. "
            "Generate a new scene from this prompt:\n\n"
        )
        contents: list[Any] = [prefix + full_image_prompt, *refs]
    else:
        contents = [full_image_prompt]

    gen_config = types.GenerateContentConfig(
        response_modalities=["TEXT", "IMAGE"],
        image_config=types.ImageConfig(
            aspect_ratio=_aspect_ratio(),
            image_size=_image_size(),
        ),
    )

    for model in models:
        logger.info(
            "Nano Banana (generate_content, %d ref image(s)): model=%s aspect=%s size=%s",
            len(refs),
            model,
            _aspect_ratio(),
            _image_size(),
        )

        def do_generate(m: str = model) -> Any:
            return client.models.generate_content(
                model=m,
                contents=contents,
                config=gen_config,
            )

        try:
            response = _run_with_optional_429_retry(f"generate:{model}", do_generate)
        except Exception as e:  # noqa: BLE001
            logger.warning("Nano Banana generate_content failed for model %s: %s", model, e)
            continue

        data_url = _extract_image_data_url(response)
        if data_url:
            logger.info(
                "Nano Banana: image part encoded as data URL (model=%s, ~%d chars)",
                model,
                len(data_url),
            )
            return data_url
        logger.warning("Nano Banana: response had no image part (model=%s)", model)

    return None
