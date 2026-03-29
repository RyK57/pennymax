from __future__ import annotations

import base64
import io
import json
import logging
import os
import re
import ssl
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Callable


logger = logging.getLogger(__name__)

# Repo root: consumer/ (api/clients -> parents[2])
_REPO_ROOT = Path(__file__).resolve().parents[2]

# Default image model = Gemini "Nano Banana" class (flash image preview) per Google GenAI SDK.
_DEFAULT_NANO_BANANA_MODEL = "gemini-3.1-flash-image-preview"

# OpenRouter model slug when using sk-or-v1 keys (see https://openrouter.ai/models)
_DEFAULT_OPENROUTER_IMAGE_MODEL = "google/gemini-3.1-flash-image-preview"

_REFERENCE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp", ".gif")


def _api_key() -> str | None:
    return (
        os.environ.get("GOOGLE_API_KEY")
        or os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GOOGLE_GENAI_API_KEY")
    )


def _openrouter_api_key() -> str | None:
    return (os.environ.get("OPENROUTER_API_KEY") or _api_key() or "").strip() or None


def _use_openrouter() -> bool:
    """
    Route image generation through OpenRouter when explicitly requested or when the
    configured key is an OpenRouter key (sk-or-v1-...). Google GenAI SDK rejects those.
    """
    explicit = os.environ.get("GUIDED_IMAGE_PROVIDER", "").strip().lower()
    if explicit in ("openrouter", "or"):
        return True
    if explicit in ("google", "gemini", "vertex"):
        return False
    k = _openrouter_api_key() or ""
    return k.startswith("sk-or-v1-")


def _openrouter_chat_url() -> str:
    base = (os.environ.get("OPENROUTER_BASE_URL") or "https://openrouter.ai/api/v1").rstrip(
        "/"
    )
    return f"{base}/chat/completions"


def _openrouter_model_slug(model: str) -> str:
    """Map bare Gemini ids to OpenRouter ``google/...`` slugs; pass through full slugs."""
    m = model.strip()
    if not m:
        return _DEFAULT_OPENROUTER_IMAGE_MODEL
    if "/" in m:
        return m
    if m.startswith("gemini-"):
        return f"google/{m}"
    return m


def _file_to_image_data_url(path: str) -> str | None:
    p = Path(path)
    if not p.is_file():
        return None
    ext = p.suffix.lower()
    mime = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }.get(ext, "image/png")
    try:
        raw = p.read_bytes()
    except OSError as e:
        logger.warning("Could not read reference image %s: %s", path, e)
        return None
    b64 = base64.standard_b64encode(raw).decode("ascii")
    return f"data:{mime};base64,{b64}"


def _extract_openrouter_image_data_url(result: dict[str, Any]) -> str | None:
    try:
        choices = result.get("choices") or []
        msg = (choices[0] or {}).get("message") or {}
        images = msg.get("images") or []
        for img in images:
            if not isinstance(img, dict):
                continue
            iu = img.get("image_url") or img.get("imageUrl")
            url = iu.get("url") if isinstance(iu, dict) else None
            if isinstance(url, str) and url.startswith("data:image/"):
                return url
    except (IndexError, KeyError, TypeError):
        pass
    return None


class OpenRouterImageError(RuntimeError):
    """HTTP/API failure from OpenRouter chat completions."""

    def __init__(self, message: str, status: int | None = None) -> None:
        super().__init__(message)
        self.status = status


def _openrouter_ssl_verify_disabled() -> bool:
    return os.environ.get("GUIDED_OPENROUTER_SSL_VERIFY", "").strip().lower() in (
        "0",
        "false",
        "no",
        "off",
    )


def _openrouter_ssl_context() -> ssl.SSLContext:
    """
    macOS / some Python builds ship without a usable CA store for urllib;
    certifi supplies Mozilla's bundle. Optional GUIDED_OPENROUTER_SSL_VERIFY=0
    disables verification (local debugging only).
    """
    if _openrouter_ssl_verify_disabled():
        logger.warning(
            "OpenRouter: TLS certificate verification is OFF (GUIDED_OPENROUTER_SSL_VERIFY). "
            "Unsafe — use only for local debugging."
        )
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        logger.warning(
            "certifi not installed; OpenRouter TLS may fail on some systems. "
            "pip install certifi or set GUIDED_OPENROUTER_SSL_VERIFY=0 (insecure)."
        )
        return ssl.create_default_context()


def _openrouter_post_chat_completions(payload: dict[str, Any]) -> dict[str, Any]:
    key = _openrouter_api_key()
    if not key:
        raise OpenRouterImageError("OpenRouter API key missing")

    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    referer = os.environ.get("OPENROUTER_HTTP_REFERER", "").strip()
    if referer:
        headers["HTTP-Referer"] = referer
    title = os.environ.get("OPENROUTER_APP_TITLE", "").strip()
    if title:
        headers["X-Title"] = title

    req = urllib.request.Request(
        _openrouter_chat_url(),
        data=data,
        headers=headers,
        method="POST",
    )
    try:
        timeout = float(os.environ.get("GUIDED_OPENROUTER_TIMEOUT", "120"))
    except ValueError:
        timeout = 120.0
    ctx = _openrouter_ssl_context()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        msg = f"OpenRouter HTTP {e.code}: {err_body[:2000]}"
        raise OpenRouterImageError(msg, status=e.code) from e
    except urllib.error.URLError as e:
        raise OpenRouterImageError(f"OpenRouter request failed: {e}") from e


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
    if isinstance(exc, OpenRouterImageError) and exc.status == 429:
        return True
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


def _reference_root_dirs() -> list[Path]:
    """Prefer Next static folder, then repo-root ``reference`` (legacy)."""
    return [_REPO_ROOT / "public" / "reference", _REPO_ROOT / "reference"]


def _collect_public_reference_dir() -> list[str]:
    """
    Collect reference images from ``public/reference`` and ``reference`` (sorted by filename).
    """
    found: set[Path] = set()
    existing_dirs: list[Path] = []
    for d in _reference_root_dirs():
        if not d.is_dir():
            continue
        existing_dirs.append(d)
        for ext in _REFERENCE_EXTENSIONS:
            found.update(d.glob(f"*{ext}"))
            found.update(d.glob(f"*{ext.upper()}"))
            found.update(d.glob(f"**/*{ext}"))
            found.update(d.glob(f"**/*{ext.upper()}"))

    if not existing_dirs:
        logger.warning(
            "Guided reference folder missing: add %s or %s with PNG/JPG/WebP files",
            _REPO_ROOT / "public" / "reference",
            _REPO_ROOT / "reference",
        )
        return []

    files = sorted(
        (p.resolve() for p in found if p.is_file()),
        key=lambda p: p.name.lower(),
    )
    cap = _max_reference_files()
    paths = [str(p) for p in files[:cap]]
    if paths:
        logger.info(
            "Guided refs: using %d file(s): %s",
            len(paths),
            ", ".join(Path(p).name for p in paths),
        )
    else:
        logger.warning(
            "Reference dirs exist but no images matched %s under %s",
            _REFERENCE_EXTENSIONS,
            ", ".join(str(d) for d in existing_dirs),
        )
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


def _openrouter_models_sequence() -> list[str]:
    env_or = os.environ.get("GUIDED_OPENROUTER_IMAGE_MODEL", "").strip()
    primary_raw = env_or or _model_id()
    primary = _openrouter_model_slug(primary_raw)
    raw = os.environ.get("GUIDED_GEMINI_IMAGE_MODEL_FALLBACKS", "").strip()
    fallbacks = [_openrouter_model_slug(x.strip()) for x in raw.split(",") if x.strip()]
    seen: set[str] = set()
    ordered: list[str] = []
    for m in [primary, *fallbacks]:
        if m not in seen:
            seen.add(m)
            ordered.append(m)
    return ordered


def _openrouter_user_content(
    full_image_prompt: str, ref_paths: list[str]
) -> str | list[dict[str, Any]]:
    if not ref_paths:
        return full_image_prompt
    prefix = (
        "Use the attached reference image(s) for consistent character design, "
        "color palette, and illustration style. Match their cartoon look. "
        "Generate a new scene from this prompt:\n\n"
    )
    parts: list[dict[str, Any]] = [
        {"type": "text", "text": prefix + full_image_prompt},
    ]
    for fp in ref_paths:
        du = _file_to_image_data_url(fp)
        if du:
            parts.append({"type": "image_url", "image_url": {"url": du}})
    return parts


def _generate_via_openrouter(full_image_prompt: str) -> str | None:
    models = _openrouter_models_sequence()
    ref_paths = _reference_paths()
    user_content = _openrouter_user_content(full_image_prompt, ref_paths)

    for model in models:
        payload: dict[str, Any] = {
            "model": model,
            "messages": [{"role": "user", "content": user_content}],
            "modalities": ["image", "text"],
            "stream": False,
            "image_config": {
                "aspect_ratio": _aspect_ratio(),
                "image_size": _image_size(),
            },
        }

        logger.info(
            "OpenRouter image: model=%s ref_files=%d aspect=%s size=%s",
            model,
            len(ref_paths),
            _aspect_ratio(),
            _image_size(),
        )

        def do_call() -> dict[str, Any]:
            body = {**payload, "model": model}
            out = _openrouter_post_chat_completions(body)
            if isinstance(out, dict) and out.get("error"):
                err = out["error"]
                msg = err if isinstance(err, str) else json.dumps(err)
                raise OpenRouterImageError(msg)
            return out

        try:
            result = _run_with_optional_429_retry(f"openrouter:{model}", do_call)
        except Exception as e:  # noqa: BLE001
            logger.warning("OpenRouter image failed for model %s: %s", model, e)
            continue

        data_url = _extract_openrouter_image_data_url(result)
        if data_url:
            logger.info(
                "OpenRouter: image data URL (model=%s, ~%d chars)",
                model,
                len(data_url),
            )
            return data_url
        logger.warning("OpenRouter: response had no image (model=%s)", model)

    return None


def generate_guided_scene_image_data_url(full_image_prompt: str) -> str | None:
    """
    Scene image generation: **OpenRouter** (``sk-or-v1-…`` keys) or **Google GenAI** SDK.

    OpenRouter: ``POST …/chat/completions`` with ``modalities`` + ``image_config`` (see OpenRouter docs).
    Google: ``generate_content`` + optional PIL refs.

    Reference images: ``public/reference`` and ``reference`` (plus ``GUIDED_GEMINI_REFERENCE_IMAGES``).

    Returns a PNG data URL, or None → caller should use a placeholder.

    Env:
      GOOGLE_API_KEY | GEMINI_API_KEY | OPENROUTER_API_KEY
      Auto: keys starting with ``sk-or-v1-`` use OpenRouter (unless GUIDED_IMAGE_PROVIDER=google).
      GUIDED_IMAGE_PROVIDER — openrouter | google to force routing
      GUIDED_OPENROUTER_IMAGE_MODEL — OpenRouter slug (default maps NANO_BANANA to google/gemini-3.1-flash-image-preview)
      OPENROUTER_BASE_URL, OPENROUTER_HTTP_REFERER, OPENROUTER_APP_TITLE, GUIDED_OPENROUTER_TIMEOUT
      GUIDED_OPENROUTER_SSL_VERIFY — set to 0/false/off only if TLS fails locally (insecure)
      GUIDED_GEMINI_IMAGE_MODEL | NANO_BANANA_MODEL (Google default gemini-3.1-flash-image-preview)
      GUIDED_GEMINI_IMAGE_MODEL_FALLBACKS — comma-separated; slugs or bare gemini-* ids
      GUIDED_GEMINI_DISABLE — if true, skip all image API calls (placeholders only)
      GUIDED_GEMINI_429_RETRIES — extra attempts on retryable 429 (default 0)
      GUIDED_GEMINI_ASPECT_RATIO, GUIDED_GEMINI_IMAGE_SIZE
      GUIDED_GEMINI_MAX_REFERENCE_IMAGES (default 8)
      GUIDED_GEMINI_REFERENCE_IMAGES — extra comma-separated paths
      GUIDED_GEMINI_USE_CHAT — Google only: chat + google_search when no reference files loaded
    """
    if _gemini_disabled():
        logger.info("Nano Banana skipped: GUIDED_GEMINI_DISABLE is set")
        return None

    if _use_openrouter():
        if not _openrouter_api_key():
            logger.warning(
                "OpenRouter image skipped: set OPENROUTER_API_KEY or GEMINI_API_KEY / GOOGLE_API_KEY "
                "with an sk-or-v1-… key"
            )
            return None
        return _generate_via_openrouter(full_image_prompt)

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
