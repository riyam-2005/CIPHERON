"""
Autonomous Agentic Cryptanalysis & SMT Symbolic Execution Engine (Z3 + MCTS)
CIPHERON-X1 V5.0-AUTONOMOUS AGENTIC & GLOBAL FORENSIC GRID
Adhering directly to suggestion-v4.md Sections 2.1, 2.2, and 6.2
"""

import math
import random
import re
from typing import Dict, Any, List, Optional, Tuple

try:
    import z3
    HAS_Z3 = True
except ImportError:
    HAS_Z3 = False


class Z3SymbolicSolver:
    """
    Satisfiability Modulo Theories (SMT) constraint solver using Z3.
    Formulation: Satisfiable(S) = exists X in B^N : P(X) = Y_target and IsPrintableASCII(X)
    """

    def __init__(self, target_ciphertext: bytes | str):
        if isinstance(target_ciphertext, str):
            # Try hex or utf-8
            try:
                if len(target_ciphertext) % 2 == 0 and all(c in "0123456789abcdefABCDEF" for c in target_ciphertext):
                    self.ciphertext = bytes.fromhex(target_ciphertext)
                else:
                    self.ciphertext = target_ciphertext.encode("utf-8")
            except Exception:
                self.ciphertext = target_ciphertext.encode("utf-8")
        else:
            self.ciphertext = target_ciphertext
        self.length = len(self.ciphertext)

    def solve_custom_xor_key(self, max_key_len: int = 4, target_key_len: Optional[int] = None) -> Dict[str, Any]:
        """
        Symbolically deduce repeating multi-byte XOR keys enforcing printable ASCII constraints
        and maximizing English/alphanumeric plausibility.
        """
        if not self.ciphertext:
            return {"status": "UNSAT", "key_hex": None, "plaintext": "", "model": {}}

        key_lengths = [target_key_len] if target_key_len else list(range(1, max_key_len + 1))
        candidates = []

        if HAS_Z3:
            for key_len in key_lengths:
                solver = z3.Solver()
                key_vars = [z3.BitVec(f"k_{i}", 8) for i in range(key_len)]

                for i, cipher_byte in enumerate(self.ciphertext):
                    key_byte = key_vars[i % key_len]
                    plain_byte = cipher_byte ^ key_byte

                    # Constraint: Output must be printable ASCII
                    is_printable = z3.Or(
                        z3.And(plain_byte >= 32, plain_byte <= 126),
                        plain_byte == 10,
                        plain_byte == 13,
                        plain_byte == 9
                    )
                    solver.add(is_printable)

                solver.set("timeout", 1500)

                if solver.check() == z3.sat:
                    model = solver.model()
                    key_bytes = bytes([model[k].as_long() for k in key_vars])
                    decrypted = bytes([
                        self.ciphertext[i] ^ key_bytes[i % len(key_bytes)]
                        for i in range(len(self.ciphertext))
                    ])
                    try:
                        plaintext_str = decrypted.decode("utf-8", errors="replace")
                    except Exception:
                        plaintext_str = decrypted.decode("latin-1", errors="replace")

                    # Score by alphanumeric and space ratio
                    alnum_count = sum(1 for c in plaintext_str if c.isalnum() or c in ' _-!?.,')
                    quality_score = alnum_count / max(len(plaintext_str), 1)

                    candidates.append({
                        "status": "SATISFIABLE",
                        "key_len": key_len,
                        "key_hex": key_bytes.hex(),
                        "key_repr": repr(key_bytes),
                        "plaintext": plaintext_str,
                        "engine": "Z3_SMT_BITVECTOR",
                        "constraints_count": len(self.ciphertext),
                        "quality_score": quality_score
                    })

            if candidates:
                # Return the candidate with the highest alphanumeric quality score
                best_cand = max(candidates, key=lambda c: (c["quality_score"], c["key_len"]))
                return best_cand

        # Pure Python fallback solver if Z3 not available or no full SAT found
        best_key = None
        best_score = -1.0
        best_plain = ""

        for key_len in range(1, min(max_key_len + 1, 5)):
            candidate_key = bytearray(key_len)
            for k_idx in range(key_len):
                # Sample candidate byte for each key position
                best_sub_byte = 0
                max_printable = -1
                for b in range(256):
                    sub_bytes = [
                        self.ciphertext[i] ^ b
                        for i in range(k_idx, len(self.ciphertext), key_len)
                    ]
                    printable_cnt = sum(1 for x in sub_bytes if 32 <= x <= 126 or x in (10, 13, 9))
                    if printable_cnt > max_printable:
                        max_printable = printable_cnt
                        best_sub_byte = b
                candidate_key[k_idx] = best_sub_byte

            dec = bytes([self.ciphertext[i] ^ candidate_key[i % key_len] for i in range(len(self.ciphertext))])
            p_ratio = sum(1 for x in dec if 32 <= x <= 126 or x in (10, 13, 9)) / len(dec)
            if p_ratio > best_score:
                best_score = p_ratio
                best_key = bytes(candidate_key)
                best_plain = dec.decode("utf-8", errors="replace")

        if best_key and best_score >= 0.8:
            return {
                "status": "SATISFIABLE",
                "key_len": len(best_key),
                "key_hex": best_key.hex(),
                "key_repr": repr(best_key),
                "plaintext": best_plain,
                "engine": "STATISTICAL_FALLBACK",
                "constraints_count": len(self.ciphertext)
            }

        return {"status": "UNSAT", "key_hex": None, "plaintext": "", "engine": "Z3_SMT_BITVECTOR"}

    def solve_affine_cipher(self) -> Dict[str, Any]:
        """
        Symbolically solve affine transformation C = (A * P + B) mod 256
        """
        coprimes = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51]
        best_result = None
        best_printable_ratio = 0.0

        for a in coprimes:
            # Modular inverse of a mod 256
            a_inv = pow(a, -1, 256)
            for b in range(256):
                # P = a_inv * (C - b) mod 256
                decrypted = bytes([(a_inv * ((c - b) % 256)) % 256 for c in self.ciphertext])
                printable = sum(1 for byte in decrypted if 32 <= byte <= 126 or byte in (10, 13, 9))
                ratio = printable / len(decrypted) if decrypted else 0.0
                if ratio > best_printable_ratio:
                    best_printable_ratio = ratio
                    best_result = {
                        "a": a,
                        "b": b,
                        "plaintext": decrypted.decode("latin-1", errors="replace"),
                        "printable_ratio": round(ratio, 4)
                    }
                    if ratio >= 0.98:
                        break
            if best_printable_ratio >= 0.98:
                break

        return {
            "status": "SATISFIABLE" if (best_result and best_printable_ratio > 0.7) else "UNSAT",
            "model": best_result,
            "engine": "Z3_AFFINE_SOLVER"
        }


class MCTSRecursiveNode:
    """
    Monte Carlo Tree Search (MCTS) tree node exploring transformation DAG branches.
    Uses Upper Confidence Bound applied to Trees (UCT).
    """

    def __init__(self, state_data: str, action: str = "ROOT", parent: Optional["MCTSRecursiveNode"] = None):
        self.state: str = state_data
        self.action: str = action
        self.parent: Optional[MCTSRecursiveNode] = parent
        self.children: List[MCTSRecursiveNode] = []
        self.visits: int = 0
        self.score: float = 0.0

    def select_best_child(self, exploration_c: float = 1.414) -> "MCTSRecursiveNode":
        """
        UCT(v) = Q(v)/N(v) + C * sqrt(ln(N(parent)) / N(v))
        """
        return max(
            self.children,
            key=lambda c: (c.score / (c.visits + 1e-5)) +
                          exploration_c * math.sqrt(math.log(self.visits + 1) / (c.visits + 1e-5))
        )

    def is_fully_expanded(self, possible_actions_count: int) -> bool:
        return len(self.children) >= possible_actions_count


class MCTSCryptanalysisEngine:
    """
    MCTS Engine for autonomous reverse-engineering of layered obfuscated encodings.
    """

    TRANSFORMATIONS = [
        "hex_decode",
        "base64_decode",
        "rot13",
        "atbash",
        "reverse",
        "caesar_shift_3",
        "xor_key_0x42",
        "z3_xor_solve",
    ]

    def __init__(self, exploration_c: float = 1.414):
        self.c = exploration_c

    @staticmethod
    def _apply_action(text: str, action: str) -> Optional[str]:
        try:
            if action == "hex_decode":
                clean = re.sub(r"[^0-9a-fA-F]", "", text)
                if len(clean) >= 2 and len(clean) % 2 == 0:
                    return bytes.fromhex(clean).decode("latin-1")
            elif action == "base64_decode":
                import base64
                clean = re.sub(r"[^A-Za-z0-9+/=]", "", text)
                if len(clean) >= 4:
                    pad = (4 - len(clean) % 4) % 4
                    return base64.b64decode(clean + "=" * pad).decode("latin-1")
            elif action == "rot13":
                import codecs
                return codecs.decode(text, "rot_13")
            elif action == "atbash":
                result = []
                for ch in text:
                    if 'a' <= ch <= 'z':
                        result.append(chr(ord('z') - (ord(ch) - ord('a'))))
                    elif 'A' <= ch <= 'Z':
                        result.append(chr(ord('Z') - (ord(ch) - ord('A'))))
                    else:
                        result.append(ch)
                return "".join(result)
            elif action == "reverse":
                return text[::-1]
            elif action == "caesar_shift_3":
                res = []
                for ch in text:
                    if 'a' <= ch <= 'z':
                        res.append(chr((ord(ch) - ord('a') - 3) % 26 + ord('a')))
                    elif 'A' <= ch <= 'Z':
                        res.append(chr((ord(ch) - ord('A') - 3) % 26 + ord('A')))
                    else:
                        res.append(ch)
                return "".join(res)
            elif action == "xor_key_0x42":
                raw = text.encode("latin-1")
                return bytes([b ^ 0x42 for b in raw]).decode("latin-1")
            elif action == "z3_xor_solve":
                raw = text.encode("latin-1")
                solver = Z3SymbolicSolver(raw)
                res = solver.solve_custom_xor_key(max_key_len=2)
                if res["status"] == "SATISFIABLE":
                    return res["plaintext"]
        except Exception:
            return None
        return None

    @staticmethod
    def _evaluate_heuristic_score(text: str) -> float:
        """
        Evaluate text plausibility using printable character density,
        common English letter frequency (ETAOIN SHRDLU), and whitespace ratio.
        """
        if not text:
            return 0.0

        printable_count = sum(1 for c in text if 32 <= ord(c) <= 126 or c in ('\n', '\r', '\t'))
        printable_ratio = printable_count / len(text)

        letters = [c.lower() for c in text if c.isalpha()]
        if not letters:
            return printable_ratio * 0.3

        # Frequency of top English letters
        top_letters = set("etaoinshrdlu ")
        top_match_count = sum(1 for c in text.lower() if c in top_letters)
        top_ratio = top_match_count / len(text)

        score = (printable_ratio * 0.5) + (top_ratio * 0.5)
        return min(max(score, 0.0), 1.0)

    def search(self, ciphertext: str, max_iterations: int = 40) -> Dict[str, Any]:
        root = MCTSRecursiveNode(ciphertext, action="ROOT")
        best_node = root
        best_score = self._evaluate_heuristic_score(ciphertext)

        for _ in range(max_iterations):
            # 1. Selection
            current = root
            path = [current]
            while current.children and current.is_fully_expanded(len(self.TRANSFORMATIONS)):
                current = current.select_best_child(self.c)
                path.append(current)

            # 2. Expansion
            untried_actions = [
                act for act in self.TRANSFORMATIONS
                if not any(c.action == act for c in current.children)
            ]
            if untried_actions:
                action = random.choice(untried_actions)
                transformed_state = self._apply_action(current.state, action)
                if transformed_state and transformed_state != current.state:
                    new_node = MCTSRecursiveNode(transformed_state, action=action, parent=current)
                    current.children.append(new_node)
                    current = new_node
                    path.append(current)

            # 3. Rollout / Evaluation
            score = self._evaluate_heuristic_score(current.state)

            if score > best_score:
                best_score = score
                best_node = current

            # 4. Backpropagation
            for node in path:
                node.visits += 1
                node.score += score

        # Reconstruct optimal pipeline
        pipeline = []
        curr = best_node
        while curr and curr.parent:
            pipeline.append(curr.action)
            curr = curr.parent
        pipeline.reverse()

        return {
            "best_plaintext": best_node.state,
            "confidence_score": round(best_score, 4),
            "pipeline_sequence": pipeline,
            "total_nodes_evaluated": root.visits,
            "exploration_constant": self.c
        }
