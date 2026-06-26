from lemma_sdk import Pod

def run(action: str, session_id: str) -> dict:
    pod = Pod.from_env()
    session = pod.records.get("sessions", session_id)
    cycles = session.get("pomodoro_cycles") or 0

    if action == "complete_cycle":
        cycles += 1
        pod.records.update("sessions", session_id, {"pomodoro_cycles": cycles})

    return {"pomodoro_cycles": cycles, "action": action}
