import time
import hashlib
from typing import List, Dict, Set, Optional, Tuple
from app.models.schemas import PipelineDAG, PipelineNode, CandidatePlaintext
from app.scoring.metrics import score_candidate
from app.encoders.base_encoders import (
    decode_base64, decode_base32, decode_base58, decode_hex,
    decode_binary, decode_decimal_ascii, decode_url, decode_html_entities,
    decode_morse
)
from app.ciphers.classical import (
    rot13, rot47, atbash, solve_caesar_bruteforce,
    solve_single_byte_xor, solve_rail_fence_bruteforce, decode_baconian
)
from app.detectors.statistics import calculate_printable_ratio

def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8', errors='replace')).hexdigest()

class TransformationPipelineEngine:
    def __init__(self, max_depth: int = 10, timeout_seconds: float = 3.0):
        self.max_depth = max_depth
        self.timeout_seconds = timeout_seconds

    def execute_pipeline(self, initial_text: str, max_depth: Optional[int] = None) -> PipelineDAG:
        start_time = time.perf_counter()
        deadline = start_time + self.timeout_seconds
        depth_limit = max_depth if max_depth is not None else self.max_depth
        
        nodes: List[PipelineNode] = []
        candidates_map: Dict[str, CandidatePlaintext] = {}
        visited_hashes: Set[str] = set()
        cycle_detected = False
        
        # Root node
        root_cand = score_candidate(initial_text, "Initial Input", None)
        root_id = "node_0_root"
        nodes.append(PipelineNode(
            id=root_id,
            depth=0,
            parent_id=None,
            transformation="Input Ingestion",
            parameter=None,
            output_snippet=initial_text[:80] + ("..." if len(initial_text) > 80 else ""),
            confidence=100.0,
            execution_time_ms=0.0,
            score=root_cand.score,
            is_terminal=False
        ))
        candidates_map[initial_text] = root_cand
        visited_hashes.add(_sha256(initial_text))

        # BFS Queue for multi-stage exploration: (current_text, current_depth, parent_node_id)
        queue: List[Tuple[str, int, str]] = [(initial_text, 0, root_id)]
        node_counter = 1
        max_reached_depth = 0

        while queue:
            if time.perf_counter() > deadline:
                break
                
            curr_text, curr_depth, parent_id = queue.pop(0)
            if curr_depth >= depth_limit:
                continue

                
            # If current text is already very high English score (> 85.0), we can mark it terminal
            curr_score = candidates_map.get(curr_text, root_cand).score
            if curr_score >= 88.0 and curr_depth > 0:
                continue
                
            # Generate potential transformations
            transforms = self._get_applicable_transformations(curr_text)
            
            for trans_name, param, decoded_output, conf in transforms:
                if time.perf_counter() > deadline:
                    break
                    
                if not decoded_output or decoded_output == curr_text:
                    continue
                    
                # Cycle detection
                out_hash = _sha256(decoded_output)
                if out_hash in visited_hashes:
                    cycle_detected = True
                    continue
                visited_hashes.add(out_hash)
                
                next_depth = curr_depth + 1
                if next_depth > max_reached_depth:
                    max_reached_depth = next_depth
                    
                step_start = time.perf_counter()
                cand = score_candidate(decoded_output, trans_name, param)
                step_duration_ms = (time.perf_counter() - step_start) * 1000.0
                
                node_id = f"node_{node_counter}_{trans_name.lower().replace(' ', '_')}"
                node_counter += 1
                
                # Check terminal condition
                is_term = (cand.score >= 85.0) or (next_depth >= self.max_depth)
                
                nodes.append(PipelineNode(
                    id=node_id,
                    depth=next_depth,
                    parent_id=parent_id,
                    transformation=trans_name,
                    parameter=param,
                    output_snippet=decoded_output[:80] + ("..." if len(decoded_output) > 80 else ""),
                    confidence=conf,
                    execution_time_ms=round(step_duration_ms, 2),
                    score=cand.score,
                    is_terminal=is_term
                ))
                
                # Update candidate list if better score found
                if decoded_output not in candidates_map or cand.score > candidates_map[decoded_output].score:
                    candidates_map[decoded_output] = cand
                    
                # Enqueue for next recursive stage if not terminal and depth allows
                if not is_term and next_depth < self.max_depth:
                    queue.append((decoded_output, next_depth, node_id))

        # Select Best Candidate (Honest Terminology Rule: "Most Likely Candidate")
        all_candidates = list(candidates_map.values())
        all_candidates.sort(key=lambda c: c.score, reverse=True)
        
        best = all_candidates[0] if all_candidates else root_cand
        best.is_most_likely = True

        total_elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return PipelineDAG(
            nodes=nodes,
            best_candidate=best,
            total_execution_time_ms=round(total_elapsed_ms, 2),
            recursion_depth=max_reached_depth,
            cycle_detected=cycle_detected
        )

    def _get_applicable_transformations(self, text: str) -> List[Tuple[str, Optional[str], Optional[str], float]]:
        """Generates candidate transformation attempts."""
        results = []
        clean = text.strip()
        
        # 1. Base64
        b64 = decode_base64(clean)
        if b64 and calculate_printable_ratio(b64) > 0.4:
            results.append(("Base64 Decode", None, b64, 95.0))
            
        # 2. Hex
        hx = decode_hex(clean)
        if hx and calculate_printable_ratio(hx) > 0.4:
            results.append(("Hex Decode", None, hx, 95.0))
            
        # 3. Binary
        bn = decode_binary(clean)
        if bn and calculate_printable_ratio(bn) > 0.4:
            results.append(("Binary Decode", None, bn, 95.0))
            
        # 4. Base32
        b32 = decode_base32(clean)
        if b32 and calculate_printable_ratio(b32) > 0.4:
            results.append(("Base32 Decode", None, b32, 85.0))

        # 5. Base58
        b58 = decode_base58(clean)
        if b58 and calculate_printable_ratio(b58) > 0.4:
            results.append(("Base58 Decode", None, b58, 80.0))

        # 6. Decimal ASCII
        dec = decode_decimal_ascii(clean)
        if dec and calculate_printable_ratio(dec) > 0.5:
            results.append(("Decimal ASCII Decode", None, dec, 90.0))

        # 7. URL
        u = decode_url(clean)
        if u and u != clean:
            results.append(("URL Decode", None, u, 90.0))

        # 8. HTML Entities
        h = decode_html_entities(clean)
        if h and h != clean:
            results.append(("HTML Entity Decode", None, h, 85.0))

        # 9. Morse
        morse_dec = decode_morse(clean)
        if morse_dec:
            results.append(("Morse Code Decode", None, morse_dec, 95.0))

        # 10. ROT13 & ROT47
        r13 = rot13(clean)
        if r13 != clean:
            results.append(("ROT13", "Shift 13", r13, 85.0))
        r47 = rot47(clean)
        if r47 != clean:
            results.append(("ROT47", "Shift 47", r47, 75.0))

        # 11. Atbash
        atb = atbash(clean)
        if atb != clean:
            results.append(("Atbash Cipher", None, atb, 80.0))

        # 12. Baconian
        bacon = decode_baconian(clean)
        if bacon:
            results.append(("Baconian Cipher", None, bacon, 90.0))

        # 13. Caesar Brute Force (evaluate top shift)
        if len(clean) >= 4 and calculate_printable_ratio(clean) > 0.8:
            caesar_results = solve_caesar_bruteforce(clean)
            if caesar_results and caesar_results[0].score > 35.0:
                top_caesar = caesar_results[0]
                results.append(("Caesar Shift", top_caesar.parameter, top_caesar.text, top_caesar.score))

        # 14. Single-Byte XOR Brute Force (evaluate top candidate)
        if len(clean) >= 4:
            xor_results = solve_single_byte_xor(clean)
            if xor_results and xor_results[0].score > 40.0:
                top_xor = xor_results[0]
                results.append(("Single-byte XOR", top_xor.parameter, top_xor.text, top_xor.score))

        # 15. Rail Fence (check rails 2-4)
        if 8 <= len(clean) <= 100:
            rf_results = solve_rail_fence_bruteforce(clean, max_rails=4)
            if rf_results and rf_results[0].score > 45.0:
                top_rf = rf_results[0]
                results.append(("Rail Fence", top_rf.parameter, top_rf.text, top_rf.score))

        return results
