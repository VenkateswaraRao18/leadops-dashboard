from config.settings import LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST

_langfuse = None

if LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY:
    try:
        from langfuse import Langfuse
        _langfuse = Langfuse(
            public_key=LANGFUSE_PUBLIC_KEY,
            secret_key=LANGFUSE_SECRET_KEY,
            host=LANGFUSE_HOST,
        )
        print("Langfuse tracing enabled")
    except Exception as e:
        print(f"Langfuse init failed: {e}")
else:
    print("Langfuse keys not set — tracing disabled")


def get_tracer():
    return _langfuse


def create_trace(name: str, metadata: dict = {}):
    if not _langfuse:
        return None
    try:
        return _langfuse.trace(name=name, metadata=metadata)
    except Exception as e:
        print(f"[tracer] create_trace failed: {e}")
        return None


def log_span(trace, name: str, input: dict = {}, output: dict = {}):
    if not trace:
        return
    try:
        trace.span(name=name, input=input, output=output)
    except Exception as e:
        print(f"[tracer] log_span failed: {e}")
