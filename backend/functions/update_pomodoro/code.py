#input_type_name: PomodoroInput
#output_type_name: PomodoroOutput
#function_name: update_pomodoro

from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod

class PomodoroInput(BaseModel):
    action: str
    session_id: str

class PomodoroOutput(BaseModel):
    pomodoro_cycles: int
    action: str

async def update_pomodoro(ctx: FunctionContext, data: PomodoroInput) -> PomodoroOutput:
    pod = Pod.from_env()
    session = pod.records.get("sessions", data.session_id)
    cycles = session.get("pomodoro_cycles") or 0
    if data.action == "complete_cycle":
        cycles += 1
        pod.records.update("sessions", data.session_id, {"pomodoro_cycles": cycles})
    return PomodoroOutput(pomodoro_cycles=cycles, action=data.action)
