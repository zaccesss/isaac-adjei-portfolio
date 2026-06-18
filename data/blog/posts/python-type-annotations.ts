import type { BlogPost } from "../index"

const _python_type_annotations: BlogPost = {
    slug: "python-type-annotations",
    title: "Python Type Annotations: What I Actually Use and Why",
    date: "2026-09-01",
    type: "notes",
    cover_image: "/images/blog/covers/python-type-annotations.webp",
    description:
      "A practical guide to Python type hints: where they help, where they get in the way and the specific patterns I reach for when annotating FastAPI handlers, dataclasses and utility functions.",
    tags: ["Python", "Types", "Backend", "FastAPI", "Notes"],
    published: true,
    content: [
      {
        type: "p",
        text: "Python's type annotation syntax was introduced in PEP 484 (Python 3.5) and has been expanded significantly in each subsequent release. In 2026 the ecosystem is mature enough that type annotations are worth using on any Python project that more than one person will touch, or that you will return to after more than a few weeks. These are the patterns I use day-to-day in the [Phaemos](/projects/phaemos) backend ([FastAPI](https://fastapi.tiangolo.com)) and in the system daemons that power the portfolio live status features.",
      },
      {
        type: "h2",
        text: "The Basics: Function Signatures",
      },
      {
        type: "p",
        text: "Start by annotating function signatures. Parameter types and return types give mypy enough information to catch the most common errors: passing a string where an int is expected, forgetting to handle a None return, returning the wrong type from a function.",
      },
      {
        type: "code",
        lang: "python",
        text: `def parse_sensor_reading(raw: str) -> float:
    return float(raw.strip())

def format_status(temp: float, humidity: float) -> dict[str, float]:
    return {"temperature": temp, "humidity": humidity}

# Without annotation, this is valid Python that will fail at runtime:
result = parse_sensor_reading(42)  # mypy: Argument 1 to "parse_sensor_reading" has incompatible type "int"; expected "str"`,
      },
      {
        type: "h2",
        text: "Optional and Union",
      },
      {
        type: "p",
        text: "`Optional[T]` is shorthand for `T | None` (Python 3.10+ syntax). Use it whenever a value might not exist. The discipline of annotating Optional forces you to handle the None case explicitly, which catches a large class of AttributeError bugs at analysis time rather than in production.",
      },
      {
        type: "code",
        lang: "python",
        text: `from typing import Optional

def get_cached_value(key: str) -> Optional[str]:
    # Redis might return None if the key does not exist
    return redis_client.get(key)

# Python 3.10+ syntax (preferred if your version allows it):
def get_cached_value(key: str) -> str | None:
    return redis_client.get(key)`,
      },
      {
        type: "h2",
        text: "TypedDict for Structured Data",
      },
      {
        type: "p",
        text: "When a function receives or returns a dictionary with a known shape, TypedDict gives you type-checked keys without the overhead of a full class. I use this for Redis payloads in the Phaemos daemons where the data is structured but does not warrant a Pydantic model.",
      },
      {
        type: "code",
        lang: "python",
        text: `from typing import TypedDict

class SensorPayload(TypedDict):
    node_id: str
    temperature: float
    humidity: float
    timestamp: int

def publish_reading(payload: SensorPayload) -> None:
    redis.set(f"node:{payload['node_id']}:latest", json.dumps(payload))`,
      },
      {
        type: "h2",
        text: "Pydantic in FastAPI",
      },
      {
        type: "p",
        text: "FastAPI uses Pydantic models for request and response validation. Annotating your Pydantic models means the editor and mypy both know the shape of request bodies and response objects. FastAPI will also auto-generate OpenAPI documentation from the models. This is type annotations paying rent: you write the types once and get validation, documentation and editor support for free.",
      },
      {
        type: "code",
        lang: "python",
        text: `from pydantic import BaseModel, Field
from typing import Literal

class NodeReading(BaseModel):
    node_id: str = Field(..., min_length=1, max_length=50)
    temperature: float = Field(..., ge=-40.0, le=125.0)
    alert_level: Literal["normal", "warning", "critical"] = "normal"

@app.post("/readings")
async def submit_reading(reading: NodeReading) -> dict[str, str]:
    # reading.temperature is typed as float; FastAPI validated it on the way in
    return {"status": "ok", "node": reading.node_id}`,
      },
      {
        type: "h2",
        text: "Protocol for Duck Typing",
      },
      {
        type: "p",
        text: "`Protocol` (PEP 544) lets you define structural types without inheritance. A class satisfies a Protocol if it has the right methods - no explicit `implements` declaration needed. This is the right pattern for utility functions that should work with any object that has a specific interface.",
      },
      {
        type: "code",
        lang: "python",
        text: `from typing import Protocol

class Serialisable(Protocol):
    def to_dict(self) -> dict[str, object]: ...

def cache_object(obj: Serialisable, key: str) -> None:
    redis.set(key, json.dumps(obj.to_dict()))

# Any class with a to_dict() method satisfies Serialisable
# without inheriting from it`,
      },
      {
        type: "h2",
        text: "What Not to Over-Annotate",
      },
      {
        type: "ul",
        items: [
          "Local variables: annotating every local variable adds noise without helping mypy much; let it infer",
          "Obvious returns: `def get_name() -> str:` is fine; `name: str = get_name()` on the next line is redundant",
          "Type: ignore: use it rarely and add a comment explaining why; a proliferation of type: ignore comments defeats the purpose",
          "Any: avoid it except at system boundaries (external APIs, dynamic config); propagating Any through your codebase silences errors instead of fixing them",
        ],
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "PEP 484 - Type Hints (original specification)", url: "https://peps.python.org/pep-0484/" },
          { text: "PEP 544 - Protocols: Structural subtyping", url: "https://peps.python.org/pep-0544/" },
          { text: "mypy documentation - the standard Python static type checker", url: "https://mypy.readthedocs.io/en/stable/" },
          { text: "Python typing documentation - the official typing module reference", url: "https://docs.python.org/3/library/typing.html" },
          { text: "FastAPI - How FastAPI uses Pydantic and Python types", url: "https://fastapi.tiangolo.com/python-types/" },
          { text: "PEP 526 - Syntax for variable annotations (Python 3.6+)", url: "https://peps.python.org/pep-0526/" },
          { text: "Pyright - Microsoft's Python type checker, alternative to mypy", url: "https://github.com/microsoft/pyright" },
        ],
      },
    ],
  }

export default _python_type_annotations
