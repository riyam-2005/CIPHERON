import hashlib
from typing import List, Dict, Any, Optional
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes

class MerkleTreeNode:
    def __init__(self, hash_val: str, left: Optional['MerkleTreeNode'] = None, right: Optional['MerkleTreeNode'] = None, leaf_data: Optional[Dict[str, Any]] = None):
        self.hash_val = hash_val
        self.left = left
        self.right = right
        self.leaf_data = leaf_data

    def to_dict(self) -> Dict[str, Any]:
        return {
            "hash": self.hash_val,
            "is_leaf": self.leaf_data is not None,
            "leaf_data": self.leaf_data,
            "left": self.left.to_dict() if self.left else None,
            "right": self.right.to_dict() if self.right else None
        }


class CryptographicMerkleTree:
    """
    Zero-Knowledge Merkle Provenance Tree (suggestion-v2.md Section 8.1).
    Constructs an immutable binary hash tree over pipeline transformation stages.
    Signs the Merkle Root using ECDSA P-256 and generates verifiable audit proofs.
    """
    def __init__(self):
        # Ephemeral P-256 key pair simulating ATECC608A Slot 0 hardware key
        self._private_key = ec.generate_private_key(ec.SECP256R1())
        self._public_key = self._private_key.public_key()
        self.leaves: List[MerkleTreeNode] = []
        self.root: Optional[MerkleTreeNode] = None
        self.root_signature: str = ""

    @staticmethod
    def hash_leaf(step: int, algorithm: str, digest: str) -> str:
        """Leaf_i = SHA256(Step_i || Algorithm_i || Digest_i)"""
        data = f"{step}||{algorithm}||{digest}".encode('utf-8')
        return hashlib.sha256(data).hexdigest()

    @staticmethod
    def hash_nodes(left_hash: str, right_hash: str) -> str:
        """Node_j,k = SHA256(Node_j || Node_k)"""
        data = f"{left_hash}{right_hash}".encode('utf-8')
        return hashlib.sha256(data).hexdigest()

    def build_tree_from_stages(self, stages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Builds a balanced Merkle tree from transformation stage records.
        Each stage: { "step": 1, "algorithm": "BASE64", "digest": "<sha256>" }
        """
        if not stages:
            # Empty tree genesis
            genesis_hash = hashlib.sha256(b"CIPHERON_GENESIS_EMPTY").hexdigest()
            self.root = MerkleTreeNode(genesis_hash)
            self.leaves = [self.root]
            self._sign_root()
            return self.get_tree_summary()

        # 1. Create leaves
        self.leaves = []
        for i, st in enumerate(stages):
            step_num = st.get("step", i + 1)
            algo = st.get("algorithm", "PIPELINE_TRANSFORMATION")
            digest = st.get("digest", "")
            leaf_h = self.hash_leaf(step_num, algo, digest)
            leaf_node = MerkleTreeNode(leaf_h, leaf_data={
                "step": step_num,
                "algorithm": algo,
                "digest": digest
            })
            self.leaves.append(leaf_node)

        # 2. Build tree upwards layer by layer
        current_level = self.leaves[:]
        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                if i + 1 < len(current_level):
                    right = current_level[i + 1]
                else:
                    # Odd count: duplicate last node for balancing
                    right = current_level[i]

                combined_hash = self.hash_nodes(left.hash_val, right.hash_val)
                parent_node = MerkleTreeNode(combined_hash, left=left, right=right)
                next_level.append(parent_node)
            current_level = next_level

        self.root = current_level[0]
        self._sign_root()
        return self.get_tree_summary()

    def _sign_root(self):
        if not self.root:
            return
        root_bytes = bytes.fromhex(self.root.hash_val)
        sig = self._private_key.sign(root_bytes, ec.ECDSA(hashes.SHA256()))
        self.root_signature = sig.hex()

    def get_audit_proof(self, leaf_index: int) -> Dict[str, Any]:
        """
        Generates Merkle inclusion proof (sibling path) for the leaf at leaf_index.
        """
        if not self.leaves or leaf_index >= len(self.leaves):
            return {"success": False, "error": "Invalid leaf index"}

        leaf_hash = self.leaves[leaf_index].hash_val
        proof_path = []

        current_level_hashes = [l.hash_val for l in self.leaves]
        curr_idx = leaf_index

        while len(current_level_hashes) > 1:
            next_level_hashes = []
            for i in range(0, len(current_level_hashes), 2):
                left_h = current_level_hashes[i]
                right_h = current_level_hashes[i + 1] if (i + 1 < len(current_level_hashes)) else current_level_hashes[i]

                if i == curr_idx or (i + 1) == curr_idx:
                    # Sibling is the other node
                    if curr_idx % 2 == 0:
                        proof_path.append({"position": "right", "hash": right_h})
                    else:
                        proof_path.append({"position": "left", "hash": left_h})

                next_level_hashes.append(self.hash_nodes(left_h, right_h))

            curr_idx = curr_idx // 2
            current_level_hashes = next_level_hashes

        return {
            "success": True,
            "leaf_index": leaf_index,
            "leaf_hash": leaf_hash,
            "root_hash": self.root.hash_val if self.root else "",
            "root_signature": self.root_signature,
            "proof_path": proof_path
        }

    @staticmethod
    def verify_proof(leaf_hash: str, proof_path: List[Dict[str, str]], expected_root: str) -> bool:
        """
        Recomputes hash along the sibling path and verifies against expected root hash.
        """
        current_hash = leaf_hash
        for step in proof_path:
            sibling_hash = step["hash"]
            position = step["position"]
            if position == "right":
                current_hash = CryptographicMerkleTree.hash_nodes(current_hash, sibling_hash)
            else:
                current_hash = CryptographicMerkleTree.hash_nodes(sibling_hash, current_hash)
        return current_hash.lower() == expected_root.lower()

    def get_tree_summary(self) -> Dict[str, Any]:
        return {
            "total_leaves": len(self.leaves),
            "root_hash": self.root.hash_val if self.root else "",
            "ecdsa_device_signature": self.root_signature,
            "tree_structure": self.root.to_dict() if self.root else None
        }


merkle_tree_engine = CryptographicMerkleTree()
