#!/usr/bin/env python3
"""Métricas calculadas por script desde research/run-log.jsonl y los diffs. Uso: python3 compute_metrics.py <ruta a research/>"""
import glob, json, os, sys
r = sys.argv[1] if len(sys.argv) > 1 else "research"
rows = {}
for l in open(os.path.join(r, "run-log.jsonl")):
    d = json.loads(l)
    if d["story"].startswith("S"):
        rows.setdefault(d["story"], {})[d["skill"]] = d["duration_s"]
print("story  build_s  review_s  +lines  -lines")
tb = tr = ta = td = 0
for s, v in sorted(rows.items()):
    L = open(os.path.join(r, "reviews", f"{s}-patches.diff")).read().splitlines() if os.path.exists(os.path.join(r, "reviews", f"{s}-patches.diff")) else []
    a = sum(1 for x in L if x.startswith("+") and not x.startswith("+++")); d = sum(1 for x in L if x.startswith("-") and not x.startswith("---"))
    b, rv = v.get("bmad-build", 0), v.get("bmad-code-review", 0)
    tb += b; tr += rv; ta += a; td += d
    print(f"{s}  {b:8.1f}  {rv:8.1f}  {a:6d}  {d:6d}")
print(f"TOTAL {tb:8.1f}  {tr:8.1f}  {ta:6d}  {td:6d}")
