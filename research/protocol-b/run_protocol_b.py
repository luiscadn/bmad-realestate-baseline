#!/usr/bin/env python3
"""Protocolo B — re-revisión estandarizada, de solo lectura, de cada historia.

Para cada historia Sxx revisa el cambio Sxx-start..Sxx-pre-review con EL MISMO prompt,
en un worktree desechable, y guarda la salida cruda de Claude sin que ningún LLM la
retranscriba. Este script NO debe modificarse durante la corrida.

Uso (desde la raíz del repo):  python3 research/protocol-b/run_protocol_b.py [--stories S01 S02 ...]
"""
import argparse, glob, json, os, re, subprocess, sys, tempfile, time
from datetime import datetime, timezone, timedelta

PROMPT = """You are running the BMAD code review for one story, in REVIEW-ONLY mode.

Target: the changes between commit {start} and commit {pre} (git diff {start} {pre}) in this checkout.
Spec for the story: {spec}

Follow the skill bmad-code-review (.claude/skills/bmad-code-review/SKILL.md). Launch the four review
layers as separate parallel subagents exactly as the skill specifies: Blind Hunter, Edge Case Hunter,
Verification Gap, Acceptance Auditor. Do not run the layers inline and do not skip any of them.
Do not pause at checkpoints; proceed automatically.

Hard rules:
- Do NOT apply patches, edit, create, delete or commit any file. Do NOT run migrations or reset the database.
- Report only.

Final answer format:
1. A section 'RAISED' listing EVERY finding raised by ANY layer before triage, one per line:
   `<layer> | <severity> | <file>:<line or n/a> | <one-sentence description>`
2. A section 'TRIAGE' giving, for each raised finding in the same order, one of
   patch | defer | reject | decision-needed, with a one-line reason.
3. Last line exactly: `FINDINGS_TOTAL: <number of lines in RAISED>`
"""

def sh(args, cwd=None, check=True):
    return subprocess.run(args, cwd=cwd, capture_output=True, text=True, check=check).stdout.strip()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stories", nargs="*", default=[f"S{i:02d}" for i in range(1, 15)])
    ap.add_argument("--repo", default=".")
    ap.add_argument("--out", default="research/protocol-b")
    ap.add_argument("--claude-bin", default="claude")
    ap.add_argument("--timeout", type=int, default=2400)
    a = ap.parse_args()

    repo = os.path.abspath(a.repo)
    out = os.path.join(repo, a.out)
    os.makedirs(out, exist_ok=True)
    claude_version = sh([a.claude_bin, "--version"])
    log = os.path.join(out, "run-log-b.jsonl")
    wt_root = tempfile.mkdtemp(prefix="protocol-b-")

    for s in a.stories:
        start_t, pre_t = f"{s}-start", f"{s}-pre-review"
        try:
            start, pre = sh(["git", "rev-parse", start_t], repo), sh(["git", "rev-parse", pre_t], repo)
        except subprocess.CalledProcessError:
            print(f"[{s}] faltan tags {start_t}/{pre_t}; se omite"); continue
        wt = os.path.join(wt_root, s)
        sh(["git", "worktree", "add", "--detach", wt, pre], repo)
        specs = sorted(glob.glob(os.path.join(wt, "_bmad-output/implementation-artifacts", f"spec-*{s.lower()}-*.md")))
        spec = os.path.relpath(specs[0], wt) if specs else "(spec not found; use the story description in sprint-status.yaml)"
        attempt = 1
        while os.path.exists(os.path.join(out, f"{s}-review.attempt{attempt}.raw.json")):
            attempt += 1
        base = os.path.join(out, f"{s}-review.attempt{attempt}")
        prompt = PROMPT.format(start=start, pre=pre, spec=spec)
        t0 = time.time(); ts = datetime.now(timezone(timedelta(hours=-5))).isoformat(timespec="seconds")
        status, timeout = "ok", False
        try:
            p = subprocess.run([a.claude_bin, "-p", prompt, "--output-format", "json", "--dangerously-skip-permissions"],
                               cwd=wt, capture_output=True, text=True, timeout=a.timeout)
            raw, rc = p.stdout, p.returncode
        except subprocess.TimeoutExpired as e:
            raw, rc, timeout, status = (e.stdout or "") if isinstance(e.stdout, str) else "", -1, True, "timeout"
        dur = round(time.time() - t0, 3)
        open(base + ".raw.json", "w").write(raw)
        meta = {"story": s, "protocol": "B", "attempt": attempt, "timestamp": ts, "claude_version": claude_version,
                "start_commit": start, "target_commit": pre, "duration_s": dur, "returncode": rc, "status": status}
        try:
            d = json.loads(raw)
            meta.update(session_id=d.get("session_id"), is_error=d.get("is_error"), num_turns=d.get("num_turns"),
                        total_cost_usd=d.get("total_cost_usd"))
            result = d.get("result") or ""
            open(base + ".md", "w").write(result)
            m = re.search(r"FINDINGS_TOTAL:\s*(\d+)", result)
            meta["findings_total_reported"] = int(m.group(1)) if m else None
            meta["raised_lines"] = len([l for l in result.splitlines() if l.count("|") >= 3 and not l.lstrip().startswith(("#", "-|"))])
            if d.get("is_error"): meta["status"] = "error"
        except Exception as e:
            meta.update(status="unparseable", parse_error=str(e))
        dirty = sh(["git", "status", "--porcelain"], wt, check=False)
        meta["worktree_clean"] = (dirty == "")
        if dirty: meta["modified_files"] = dirty.splitlines()[:20]
        with open(log, "a") as f: f.write(json.dumps(meta) + "\n")
        print(f"[{s}] attempt {attempt}: {meta['status']} {dur}s findings={meta.get('findings_total_reported')} clean={meta['worktree_clean']}")
        sh(["git", "worktree", "remove", "--force", wt], repo, check=False)

if __name__ == "__main__":
    main()
