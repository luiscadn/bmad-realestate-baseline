import unittest
from compute_agreement import compute_agreement

class AgreementAcceptance(unittest.TestCase):
    def test_empty_ratings_are_pending_not_perfect(self):
        result=compute_agreement({"M01":"security"},{"M01":""},True)
        self.assertEqual(result["status"],"pending");self.assertIsNone(result["kappa"])
    def test_initial_draft_cannot_be_presented_as_validated(self):
        result=compute_agreement({"M01":"security"},{"M01":"security"},False)
        self.assertEqual(result["status"],"needs_first_validation");self.assertIsNone(result["kappa"])
    def test_perfect_balanced_ratings(self):
        result=compute_agreement({"M01":"security","M02":"reliability"},{"M01":"security","M02":"reliability"},True)
        self.assertEqual(result["status"],"complete");self.assertEqual(result["kappa"],1)
    def test_complete_disagreement(self):
        result=compute_agreement({"M01":"security","M02":"reliability"},{"M01":"reliability","M02":"security"},True)
        self.assertEqual(result["kappa"],-1)
    def test_single_category_is_undefined(self):
        result=compute_agreement({"M01":"security"},{"M01":"security"},True)
        self.assertEqual(result["status"],"undefined");self.assertIsNone(result["kappa"])
    def test_mismatched_sample_ids_rejected(self):
        with self.assertRaisesRegex(ValueError,"sample IDs"):
            compute_agreement({"M01":"security"},{"M02":"security"},True)
    def test_unknown_categories_rejected(self):
        with self.assertRaisesRegex(ValueError,"category"):
            compute_agreement({"M01":"made-up"},{"M01":"security"},True)
    def test_partial_input_never_returns_final_coefficient(self):
        result=compute_agreement({"M01":"security","M02":"reliability"},{"M01":"security","M02":""},True)
        self.assertEqual(result["status"],"pending");self.assertEqual(result["complete_pairs"],1);self.assertIsNone(result["kappa"])

if __name__=="__main__":unittest.main()
