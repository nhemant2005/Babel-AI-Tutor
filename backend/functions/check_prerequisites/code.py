#input_type_name: PrereqInput
#output_type_name: PrereqOutput
#function_name: check_prerequisites

from typing import List
from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod

class PrereqInput(BaseModel):
    topic_id: str

class PrereqOutput(BaseModel):
    unmet: List[str]
    all_met: bool

async def check_prerequisites(ctx: FunctionContext, data: PrereqInput) -> PrereqOutput:
    pod = Pod.from_env()
    topic = pod.records.get("topics", data.topic_id)
    dep_ids = topic.get("dependency_ids") or []
    if not dep_ids:
        return PrereqOutput(unmet=[], all_met=True)

    unmet = []
    for dep_id in dep_ids:
        lm_items = pod.records.list(
            "learner_model",
            filter=[{"field": "topic_id", "op": "eq", "value": dep_id}],
            limit=1,
        ).to_dict()["items"]
        if not lm_items or not lm_items[0].get("prerequisite_met"):
            dep_topic = pod.records.get("topics", dep_id)
            unmet.append(dep_topic.get("name", dep_id))

    return PrereqOutput(unmet=unmet, all_met=len(unmet) == 0)
