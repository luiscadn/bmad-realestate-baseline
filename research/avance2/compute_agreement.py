"""Compute agreement only from complete, explicitly validated paired ratings.

This utility cannot establish blinding or reviewer independence. Those properties
must be documented by the study. An initial automated draft is not a human rating.
"""
from collections import Counter
from pathlib import Path
import argparse
import csv
import json

CATEGORIES = frozenset([
    'functional_suitability', 'performance_efficiency', 'compatibility',
    'interaction_capability', 'reliability', 'security', 'maintainability',
    'flexibility', 'safety',
])

def compute_agreement(first, second, first_validated=False):
    if set(first) != set(second):
        raise ValueError('The two raters must have identical sample IDs.')
    for ratings in [first, second]:
        for sample_id, category in ratings.items():
            if not isinstance(sample_id, str) or not sample_id.strip():
                raise ValueError('Empty sample IDs are not allowed.')
            if category not in CATEGORIES and category not in ['', None]:
                raise ValueError('Unknown ISO category: ' + str(category))
    complete = [(first[sid], second[sid]) for sid in sorted(first) if first[sid] and second[sid]]
    result = {'sample_size': len(first), 'complete_pairs': len(complete),
              'first_validated_declared': bool(first_validated), 'kappa': None}
    if not first or len(complete) != len(first):
        return {**result, 'status': 'pending', 'reason': 'Complete both ratings for every sample item.'}
    if not first_validated:
        return {**result, 'status': 'needs_first_validation',
                'reason': 'Validate and freeze the first rating before presenting an inter-rater coefficient.'}
    n = len(complete)
    a = Counter(x for x, _ in complete)
    b = Counter(y for _, y in complete)
    po = sum(x == y for x, y in complete) / n
    pe = sum(a[c] * b[c] for c in CATEGORIES) / (n * n)
    result.update(observed_agreement=po, expected_agreement=pe,
                  confusion_matrix={x: {y: sum(px == x and py == y for px, py in complete)
                                        for y in sorted(CATEGORIES)} for x in sorted(CATEGORIES)})
    if pe == 1:
        return {**result, 'status': 'undefined', 'reason': 'Expected agreement is one; kappa is undefined.'}
    return {**result, 'status': 'complete', 'kappa': (po - pe) / (1 - pe)}

def read_ratings(path, category_column):
    with Path(path).open(encoding='utf-8-sig', newline='') as handle:
        reader = csv.DictReader(handle)
        if not {'sample_id', category_column}.issubset(reader.fieldnames or []):
            raise ValueError('CSV requires sample_id and ' + category_column + ' columns.')
        if len(reader.fieldnames) != len(set(reader.fieldnames)):
            raise ValueError('Duplicate CSV columns are not allowed.')
        ratings = {}
        for row in reader:
            sample_id = (row['sample_id'] or '').strip()
            if sample_id in ratings:
                raise ValueError('Duplicate sample IDs: ' + sample_id)
            ratings[sample_id] = (row[category_column] or '').strip()
        return ratings

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--first', type=Path, required=True)
    parser.add_argument('--second', type=Path, required=True)
    parser.add_argument('--first-column', default='iso_category')
    parser.add_argument('--second-column', default='iso_category_reviewer_2')
    parser.add_argument('--first-validated', action='store_true')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    if args.out.resolve() in {args.first.resolve(), args.second.resolve()}:
        parser.error('Output must not overwrite a rating input.')
    try:
        result = compute_agreement(read_ratings(args.first, args.first_column),
                                   read_ratings(args.second, args.second_column), args.first_validated)
    except (OSError, ValueError) as error:
        result = {'status': 'invalid_input', 'kappa': None, 'reason': str(error)}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2))
    print(json.dumps({k: v for k, v in result.items() if k != 'confusion_matrix'}, ensure_ascii=False))
    return 0 if result['status'] == 'complete' else 2

if __name__ == '__main__':
    raise SystemExit(main())
