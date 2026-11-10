import ast
import re
from typing import List, Dict, Optional, Tuple
from app.models.schemas import CodeAnalysisResult
from app.detectors.statistics import calculate_shannon_entropy

# Language signature patterns
LANGUAGE_SIGNATURES: Dict[str, List[re.Pattern]] = {
    "Python": [
        re.compile(r'^\s*def\s+[a-zA-Z_]\w*\s*\(', re.M),
        re.compile(r'^\s*import\s+[a-zA-Z_]|^\s*from\s+[a-zA-Z_]+\s+import', re.M),
        re.compile(r'^\s*class\s+[a-zA-Z_]\w*(\(.*?\))?:', re.M),
        re.compile(r'if\s+__name__\s*==\s*[\'"]__main__[\'"]:', re.M)
    ],
    "JavaScript": [
        re.compile(r'\bfunction\s+[a-zA-Z_]\w*\s*\(', re.M),
        re.compile(r'\bconst\s+[a-zA-Z_]\w*\s*=\s*(\(|function|\(\s*.*?\s*\)\s*=>)', re.M),
        re.compile(r'\bconsole\.log\(', re.M),
        re.compile(r'\bmodule\.exports\b|\bexport\s+(default\s+)?(function|class|const|let)', re.M)
    ],
    "TypeScript": [
        re.compile(r':\s*(string|number|boolean|any|unknown|void|never)\b', re.M),
        re.compile(r'\binterface\s+[A-Za-z_]\w*\s*\{', re.M),
        re.compile(r'\btype\s+[A-Za-z_]\w*\s*=', re.M),
        re.compile(r'\bas\s+[A-Za-z_]\w*', re.M)
    ],
    "C": [
        re.compile(r'#include\s*<stdio\.h>', re.M),
        re.compile(r'\bint\s+main\s*\(\s*(void|int\s+argc)?', re.M),
        re.compile(r'\bprintf\(', re.M)
    ],
    "C++": [
        re.compile(r'#include\s*<iostream>', re.M),
        re.compile(r'\bstd::cout\b|\bstd::endl\b', re.M),
        re.compile(r'\bnamespace\s+[a-zA-Z_]\w*', re.M)
    ],
    "Java": [
        re.compile(r'\bpublic\s+class\s+[a-zA-Z_]\w*', re.M),
        re.compile(r'\bpublic\s+static\s+void\s+main\s*\(String\[\]', re.M),
        re.compile(r'\bSystem\.out\.println\(', re.M)
    ],
    "Go": [
        re.compile(r'^\s*package\s+[a-zA-Z_]\w*', re.M),
        re.compile(r'^\s*func\s+([a-zA-Z_]\w*|\(.*?\)\s*[a-zA-Z_]\w*)\s*\(', re.M),
        re.compile(r'\bfmt\.Println\(', re.M)
    ],
    "Rust": [
        re.compile(r'\bfn\s+[a-zA-Z_]\w*\s*\(', re.M),
        re.compile(r'\blet\s+mut\b', re.M),
        re.compile(r'\bprintln!\(', re.M),
        re.compile(r'\bimpl\s+[a-zA-Z_]\w*', re.M)
    ],
    "PHP": [
        re.compile(r'<\?php\b', re.M),
        re.compile(r'\$[a-zA-Z_]\w*', re.M),
        re.compile(r'\becho\s+["\']', re.M)
    ],
    "SQL": [
        re.compile(r'\b(SELECT\s+.*?\s+FROM|INSERT\s+INTO|UPDATE\s+.*?\s+SET|DELETE\s+FROM|CREATE\s+TABLE)\b', re.I)
    ],
    "Bash": [
        re.compile(r'^#!\/bin\/(bash|sh)', re.M),
        re.compile(r'\becho\s+["\'].*?["\']', re.M),
        re.compile(r'\bfi\b|\bdone\b|\besac\b', re.M)
    ],
    "PowerShell": [
        re.compile(r'\bWrite-Host\b|\bGet-Process\b|\bGet-Content\b|\bSet-Variable\b', re.I),
        re.compile(r'\$[A-Za-z_]\w*', re.M)
    ],
    "HTML": [
        re.compile(r'<!DOCTYPE\s+html>', re.I),
        re.compile(r'<html\b.*?<head\b.*?<body\b', re.I | re.S),
        re.compile(r'<\/(div|p|span|a|body|html)>', re.I)
    ],
    "CSS": [
        re.compile(r'^[.#]?[a-zA-Z_-][a-zA-Z0-9_-]*\s*\{[^}]*:\s*[^}]+;[^}]*\}', re.M)
    ]
}

# Dangerous / Obfuscation indicators
OBFUSCATION_PATTERNS = [
    (re.compile(r'\beval\s*\('), "Critical: Dynamic 'eval()' code execution detected"),
    (re.compile(r'\bexec\s*\('), "Critical: Dynamic 'exec()' statement detected"),
    (re.compile(r'\bFunction\s*\(\s*["\']'), "High: Dynamic Function constructor detected"),
    (re.compile(r'__import__\s*\('), "High: Dynamic module import detected"),
    (re.compile(r'subprocess\.(Popen|run|call)'), "High: Subprocess / Shell spawning detected"),
    (re.compile(r'os\.system\s*\('), "High: OS command execution detected"),
    (re.compile(r'fromCharCode\b|\\x[0-9a-fA-F]{2}'), "Medium: Hex string escaping / obfuscation detected"),
    (re.compile(r'atob\s*\(|btoa\s*\('), "Medium: In-code Base64 conversion (potential payload decoding) detected")
]

def detect_programming_language(code: str) -> Optional[str]:
    """Scores code against language signatures."""
    best_lang = None
    max_matches = 0
    
    for lang, patterns in LANGUAGE_SIGNATURES.items():
        matches = sum(1 for p in patterns if p.search(code))
        if matches > max_matches:
            max_matches = matches
            best_lang = lang
            
    return best_lang if max_matches > 0 else None

def analyze_source_code(code: str) -> CodeAnalysisResult:
    """
    Performs static AST inspection and security rule checks.
    Never executes code dynamically.
    """
    detected_lang = detect_programming_language(code)
    if not detected_lang:
        return CodeAnalysisResult(is_code=False)

    functions = []
    classes = []
    imports = []
    syntax_valid = False
    cyclomatic_complexity = 1
    warnings = []

    # 1. Obfuscation and Security Warnings Check
    for pattern, warning_msg in OBFUSCATION_PATTERNS:
        if pattern.search(code):
            warnings.append(warning_msg)

    # 2. Check variable name entropy (obfuscators use random names like _0x1a8f or l1l111)
    tokens = re.findall(r'\b[a-zA-Z_]\w{6,}\b', code)
    high_entropy_vars = 0
    for tok in tokens:
        ent = calculate_shannon_entropy(tok)
        if ent > 3.2:
            high_entropy_vars += 1
            
    obfuscation_risk = 0.0
    if warnings:
        obfuscation_risk += len(warnings) * 20.0
    if high_entropy_vars > 3:
        obfuscation_risk += 30.0
        warnings.append(f"Suspicious variable entropy: {high_entropy_vars} randomized identifier names detected")
    obfuscation_risk = min(100.0, obfuscation_risk)

    # 3. Python AST Analysis if Python
    if detected_lang == "Python":
        try:
            tree = ast.parse(code)
            syntax_valid = True
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
                    functions.append(node.name)
                    cyclomatic_complexity += 1
                elif isinstance(node, ast.ClassDef):
                    classes.append(node.name)
                elif isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    mod = node.module or ""
                    for alias in node.names:
                        imports.append(f"{mod}.{alias.name}")
                elif isinstance(node, (ast.If, ast.For, ast.While, ast.Try, ast.ExceptHandler)):
                    cyclomatic_complexity += 1
        except SyntaxError:
            syntax_valid = False
            warnings.append("Syntax Error in Python source code")
    else:
        # Regex heuristics for other languages
        syntax_valid = True
        func_matches = re.findall(r'\b(?:function|def|func|fn)\s+([a-zA-Z_]\w*)', code)
        functions.extend(func_matches[:10])
        class_matches = re.findall(r'\bclass\s+([a-zA-Z_]\w*)', code)
        classes.extend(class_matches[:10])
        import_matches = re.findall(r'\b(?:import|require|include)\s+["\'<]?([a-zA-Z0-9_./]+)', code)
        imports.extend(import_matches[:10])
        # Approximate cyclomatic complexity
        branch_count = len(re.findall(r'\b(if|else\s+if|for|while|case|catch)\b', code))
        cyclomatic_complexity = 1 + branch_count

    return CodeAnalysisResult(
        is_code=True,
        language=detected_lang,
        syntax_valid=syntax_valid,
        functions=functions,
        classes=classes,
        imports=imports,
        cyclomatic_complexity=cyclomatic_complexity,
        obfuscation_risk=round(obfuscation_risk, 1),
        security_warnings=warnings
    )
