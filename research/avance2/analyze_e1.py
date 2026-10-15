#!/usr/bin/env python3
"""Export archived review candidates without rewriting their source reports.

Counts are candidate occurrences, not independently confirmed or deduplicated
defects. A is summarized source material; B has an explicit pre-triage inventory.
"""
from pathlib import Path
from collections import Counter
from datetime import datetime
import argparse
import csv
import hashlib
import json
import random
import re
import subprocess

ISO = ['functional_suitability','performance_efficiency','compatibility','interaction_capability','reliability','security','maintainability','flexibility','safety']
RULES = [
    ('process_traceability',r'sprint.status|spec.{0,35}status|status.{0,30}(?:spec|review|done)|triage.{0,30}(?:missing|record)|review.{0,30}(?:skipped|not launched)|claimed.{0,25}(?:pass|build)|claim.{0,25}unverified|no committed evidence|spec filename|acceptance criteria.{0,25}(?:empty|missing)', 'P01: observación del proceso; no se fuerza a una característica de producto.'),
    ('security',r'\brls\b|authoriz|unauthoriz|authentica|service.role|row.level|\bcsrf\b|\bxss\b|injection|permission|cross.agent|password|\bpii\b|sensitive|search_path|token|session|rate.limit|captcha|privacy|consent|expos|access.control', 'S01: acceso, autorización, abuso, privacidad o protección de datos.'),
    ('interaction_capability',r'aria|screen.reader|a11y|accessib|focus|alt.text|keyboard|landmark|tabindex|contrast|i18n|localiz|locale|translat|next.intl|hard.coded.{0,25}(?:string|quote|text)|currency.format|visual|viewport|responsive|accessible.name|user.experience', 'I01: interacción, comprensión, accesibilidad o adecuación lingüística de la interfaz.'),
    ('maintainability',r'\btest|assert|coverage|mock|readab|duplicat|hard.cod|dead.code|type.safe|typescript|\bany\b|modular|magic.number|maintain|lint|code.quality', 'M01: capacidad de análisis, modificación o prueba del código.'),
    ('reliability',r'race|out.of.order|stale|unmount|cleanup|leak|timer|interval|abort|hang|timeout|unhandled|retry|network.failure|network.error|double.submit|concurrent|idempot|resilien|fault|loading.state', 'R01: consistencia del estado y comportamiento ante concurrencia o fallo.'),
    ('performance_efficiency',r'index|performance|expensive|\bn\+1\b|latency|resource.use|memory|full.table|query.plan|trigram|full.text|unbounded|large.payload', 'E01: tiempo de respuesta, capacidad o consumo de recursos.'),
    ('compatibility',r'browser|safari|compatib|version.{0,25}(?:schema|supabase)|supabase.{0,25}upgrade|integration.contract|interoperab', 'C01: coexistencia o interoperabilidad entre componentes y plataformas.'),
    ('flexibility',r'portab|adaptab|installab|deployment|environment|env.var|configur|platform', 'F01: adaptación, instalación o cambio de entorno.'),
    ('functional_suitability',r'validat|invalid|regex|constraint|input|return|error|404|400|409|500|missing|incorrect|wrong|allow|reject|check|sort|filter|slug|date|timestamp|timezone|time.zone|calculation|precision|round|empty|no |cannot|can.t|does not|not ', 'U01: adecuación, corrección o completitud del comportamiento funcional.'),
]
LAYER_MAP={'bh':'blind_hunter','blindhunter':'blind_hunter','ech':'edge_case_hunter','edgecasehunter':'edge_case_hunter','vg':'verification_gap','verificationgap':'verification_gap','aa':'acceptance_auditor','acceptanceauditor':'acceptance_auditor'}
ASSISTED_GROUPS={
 'security':'S01-002 S01-011 S01-012 S01-041 S02-001 S02-006 S13-002 S13-009',
 'functional_suitability':'S01-010 S01-034 S01-036 S01-037 S01-042 S01-052 S03-003 S03-012 S03-016 S05-022 S05-026 S06-001 S06-013 S06-030 S06-031 S06-032 S07-004 S07-014 S07-016 S07-027 S08-009 S08-018 S09-019 S10-025 S10-028 S10-036 S11-013 S11-024 S12-010',
 'maintainability':'S01-019 S02-016 S02-020 S02-047 S02-051 S04-008 S07-033 S09-027 S09-036 S12-032',
 'reliability':'S02-004 S02-025 S02-048 S06-021 S08-006 S08-020 S12-021',
 'process_traceability':'S03-024 S07-040',
 'interaction_capability':'S07-005 S07-026 S10-011 S10-015 S10-016 S11-007 S11-015 S11-020',
 'not_applicable':'S09-039 S12-038',
 'compatibility':'S13-016',
}
ASSISTED_OVERRIDES={'B-'+sid:category for category,ids in ASSISTED_GROUPS.items() for sid in ids.split()}

def classify(description, location, severity):
    if severity.lower()=='n/a' and re.search(r'checks?|satisfied|confirms?|met\b|matches?',description,re.I):
        return 'not_applicable','A01: confirmación de criterio, no afirmación de defecto.',[]
    matches=[(category,reason) for category,pattern,reason in RULES if re.search(pattern,description,re.I)]
    if not matches:
        return 'needs_review','X01: la regla no decide; requiere clasificación semántica.',[]
    return matches[0][0],matches[0][1],[x[0] for x in matches[1:] if x[0] in ISO]

def parse_b(text):
    lines=text.splitlines();mode=None;raised=[];triage={};reported=None
    for number,line in enumerate(lines,1):
        clean=line.replace('**','').strip()
        if re.match(r'^#{0,6}\s*RAISED\b',clean,re.I):mode='raised';continue
        if re.match(r'^#{0,6}\s*TRIAGE\b',clean,re.I):mode='triage';continue
        total=re.search(r'FINDINGS_TOTAL:\s*(\d+)',clean)
        if total:reported=int(total[1]);continue
        if mode=='raised' and line.count('|')>=3 and not line.lstrip().startswith(('#','-|')):
            parts=[p.strip() for p in line.strip().strip('|').split('|',3)]
            if len(parts)==4:
                raised.append({'source_line':number,'layer_raw':parts[0],'severity':parts[1].lower(),'location':parts[2],'description':parts[3]})
        elif mode=='triage':
            m=re.match(r'^(\d+)[.)]\s*(.*)',clean,re.I)
            decision=None
            if m:
                direct=re.match(r'^(patch|defer|reject|decision-needed|false)\b\s*(?:\||:|[-–—])?\s*(.*)',m[2],re.I)
                embedded=re.search(r':\s*(patch|defer|reject|decision-needed|false)\b(.*)',m[2],re.I)
                decision=direct or embedded
            if m and decision:
                idx=int(m[1])
                if idx in triage:raise ValueError('duplicate triage index '+str(idx))
                raw_decision=decision[1].lower()
                triage[idx]={'decision':'reject' if raw_decision=='false' else raw_decision,'decision_raw':raw_decision,'reason':m[2],'source_line':number}
    return raised,triage,reported

def kappa(pairs):
    if not pairs:return {'n':0,'kappa':None,'reason':'Sin pares de clasificación independientes.'}
    a=Counter(x for x,_ in pairs);b=Counter(y for _,y in pairs);n=len(pairs)
    po=sum(x==y for x,y in pairs)/n
    pe=sum(a[c]*b[c] for c in set(a)|set(b))/(n*n)
    return {'n':n,'observed_agreement':po,'expected_agreement':pe,'kappa':(po-pe)/(1-pe) if pe<1 else None,'reason':'Indefinido cuando el acuerdo esperado es uno.' if pe==1 else None}

def write_csv(path,rows,fields):
    with path.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore',lineterminator='\n');w.writeheader();w.writerows(rows)

def run(repo,out):
    out.mkdir(parents=True,exist_ok=True)
    log_path=repo/'research/protocol-b/run-log-b.jsonl'
    logs=[json.loads(line) for line in log_path.read_text().splitlines() if line.strip()]
    audit=[];candidates=[];summaries=[];source_hashes={}
    git=lambda *args:subprocess.check_output(['git',*args],cwd=repo,text=True).strip()
    for story in [f'S{i:02d}' for i in range(1,15)]:
        attempts=[entry for entry in logs if entry['story']==story and entry['status']=='ok']
        if not attempts:raise ValueError('No successful archived attempt: '+story)
        selected=max(attempts,key=lambda row:row['attempt']);attempt=selected['attempt']
        relative=f'research/protocol-b/{story}-review.attempt{attempt}.md';path=repo/relative
        text=path.read_text();source_hashes[relative]=hashlib.sha256(path.read_bytes()).hexdigest()
        raw_path=path.with_suffix('.raw.json');raw=json.loads(raw_path.read_text())
        source_hashes[str(raw_path.relative_to(repo))]=hashlib.sha256(raw_path.read_bytes()).hexdigest()
        if raw.get('result','').strip()!=text.strip():raise ValueError('Markdown differs from archived result: '+story)
        rows,triage,reported=parse_b(text)
        for index,row in enumerate(rows,1):
            layer_key=re.sub(r'[^a-z]','',row['layer_raw'].lower())
            category,reason,secondary=classify(row['description'],row['location'],row['severity'])
            finding_id=f'B-{story}-{index:03d}'
            method='documented_rules'
            if category=='needs_review' and finding_id in ASSISTED_OVERRIDES:
                category=ASSISTED_OVERRIDES[finding_id]
                reason='X02: clasificación semántica inicial asistida por Codex sobre el texto del candidato; requiere validación del evaluador.'
                method='codex_assisted_case_classification'
            d=triage.get(index,{})
            candidates.append({
                'finding_id':finding_id,'protocol':'B','story':story,'attempt':attempt,
                'model':', '.join(raw.get('modelUsage',{})) or selected.get('claude_version','unknown'),
                'layer':LAYER_MAP.get(layer_key,layer_key),'severity':row['severity'],'location':row['location'],
                'description':row['description'],'triage':d.get('decision','unmapped'),'triage_raw':d.get('decision_raw',''),'triage_reason':d.get('reason',''),
                'source':relative,'source_line':row['source_line'],'triage_source_line':d.get('source_line',''),
                'record_kind':'candidate_occurrence','semantic_deduplication':'not_performed','validation':'archived_claim_not_independently_verified',
                'iso_primary_draft':category,'classification_rule':reason,'iso_secondary_draft':';'.join(secondary),
                'classification_method':method,'classification_status':'assisted_initial_requires_reviewer_validation'
            })
        audit.append({'story':story,'attempt':attempt,'raised_rows':len(rows),'reported_total':reported,'difference':len(rows)-(reported or 0),
            'triage_rows':len(triage),'unmapped_candidates':[i for i in range(1,len(rows)+1) if i not in triage],
            'orphan_triage_indices':[i for i in triage if i<1 or i>len(rows)],
            'start_matches_tag':selected['start_commit']==git('rev-parse',story+'-start'),
            'target_matches_tag':selected['target_commit']==git('rev-parse',story+'-pre-review'),
            'start_commit':selected['start_commit'],'target_commit':selected['target_commit'],
            'worktree_clean_recorded':selected.get('worktree_clean'),'model_usage':list(raw.get('modelUsage',{})),
            'execution_label':selected.get('claude_version'),'source':relative,
            'layer_counts':dict(Counter(row['layer'] for row in candidates if row['story']==story))})
        a_relative=f'research/reviews/{story}-review.md';a_path=repo/a_relative
        a_text=a_path.read_text();source_hashes[a_relative]=hashlib.sha256(a_path.read_bytes()).hexdigest()
        context='unclassified'
        for line_number,line in enumerate(a_text.splitlines(),1):
            if line.startswith('#') or (line.startswith('**') and line.endswith('**')):context=line.strip('#* ').strip()
            if re.match(r'^\s*(?:[-*]\s+|\d+[.)]\s+)',line):
                summaries.append({'record_id':f'A-{story}-L{line_number}','protocol':'A','story':story,'source':a_relative,'source_line':line_number,'context':context,'text':line.strip(),'record_kind':'summary_statement','completeness':'not_an_exhaustive_pretriage_inventory'})
    fields=list(candidates[0]);write_csv(out/'registro_B.csv',candidates,fields)
    write_csv(out/'registro_A_resumenes.csv',summaries,list(summaries[0]))
    eligible=[r for r in candidates if r['triage'] in ['patch','defer','decision-needed'] and r['iso_primary_draft'] in ISO]
    sample=random.Random(20261014).sample(sorted(eligible,key=lambda r:r['finding_id']),min(30,len(eligible)))
    blind=[{'sample_id':f'M{i:02d}','location':r['location'],'description':r['description'],'iso_category_reviewer_2':'','reason_reviewer_2':''} for i,r in enumerate(sample,1)]
    write_csv(out/'muestra_ciega_santiago.csv',blind,list(blind[0]))
    key=[{'sample_id':f'M{i:02d}','finding_id':r['finding_id'],'iso_category_initial_draft':r['iso_primary_draft'],'status':'initial_draft_not_a_frozen_human_rating'} for i,r in enumerate(sample,1)]
    write_csv(out/'clave_muestra.csv',key,list(key[0]))
    frequencies=[]
    for category,count in Counter(r['iso_primary_draft'] for r in candidates).most_common():
        frequencies.append({'category':category,'candidate_occurrences':count,'percent_all_candidates':round(100*count/len(candidates),2),'status':'automatic_initial_not_validated_defect_frequency'})
    write_csv(out/'frecuencias_provisionales.csv',frequencies,list(frequencies[0]))
    coverage=sum(r['triage']!='unmapped' for r in candidates)
    result={'generated_at':datetime.now().astimezone().isoformat(),'baseline_commit':git('rev-parse','baseline-v0^{commit}'),
        'protocol_b_source_commit':git('rev-parse','origin/e1-protocol-b'),'stories':len(audit),'B_candidate_occurrences':len(candidates),
        'B_reported_totals':sum(a['reported_total'] or 0 for a in audit),'A_summary_statements':len(summaries),
        'candidate_triage_mapped':coverage,'triage_counts':dict(Counter(r['triage'] for r in candidates)),
        'severity_counts':dict(Counter(r['severity'] for r in candidates)),
        'uniform_claude_subset_stories':[a['story'] for a in audit if a['model_usage']==['claude-sonnet-5-5']],
        'uniform_claude_subset_candidate_occurrences':sum(a['raised_rows'] for a in audit if a['model_usage']==['claude-sonnet-5-5']),
        'alternate_model_stories':[a['story'] for a in audit if a['model_usage']!=['claude-sonnet-5-5']],
        'raw_reports_unchanged':True,'all_git_tags_match':all(a['start_matches_tag'] and a['target_matches_tag'] for a in audit),
        'classification':'assisted_initial_requires_reviewer_validation','sample_seed':20261014,'sample_population':len(eligible),'sample_size':len(sample),
        'kappa':kappa([]),'audit':audit,
        'limitations':['B counts include rejections, cross-layer duplicates and some acceptance confirmations. They are not verified defect counts.',
            'A reports are summaries with different granularity; their row counts must not be pooled with B or treated as exhaustive pre-triage findings.',
            'S12 has 41 explicit rows while FINDINGS_TOTAL reports 40. The original files are preserved.',
            'S14 attempt 2 is labeled Gemini and has no modelUsage identity. It is reported separately from the 13-story Claude subset.',
            'ISO classifications are an initial rule-based aid; evaluator validation and a genuinely independent second rating remain pending.',
            'Kappa is not calculated without paired independent ratings. Empty ratings are not agreement.'],
        'source_sha256':source_hashes}
    (out/'resumen.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    (out/'reglas_clasificacion.json').write_text(json.dumps({'standard':'ISO/IEC 25010:2023','source':'https://www.iso.org/standard/78176.html','categories':ISO,'rules':[{'category':c,'regex':p,'reason':r} for c,p,r in RULES],'assisted_case_decisions':ASSISTED_OVERRIDES,'unmapped':'needs_review; no default product category is invented','independence':'Initial rule outputs and Codex-assisted case classifications are not a human first evaluation.'},ensure_ascii=False,indent=2))
    print(json.dumps({k:result[k] for k in ['stories','B_candidate_occurrences','B_reported_totals','A_summary_statements','candidate_triage_mapped','triage_counts','uniform_claude_subset_candidate_occurrences','alternate_model_stories','sample_population','sample_size','all_git_tags_match']},ensure_ascii=False,indent=2))
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[2]);p.add_argument('--out',type=Path,required=True)
    a=p.parse_args();run(a.repo.resolve(),a.out.resolve())
