# CIPHERON-X1 Decoder Engine & Mathematical Formulas

## 1. Statistical Heuristics
The CIPHERON-X1 heuristic detection engine uses deterministic mathematical metrics:

### 1.1 Shannon Entropy
Computes information density per character/byte:
$$H = -\sum_{i=1}^n p_i \log_2(p_i)$$
- Natural English text typically exhibits $3.5 \le H \le 4.8$.
- Standard Base64 encoded streams exhibit $5.5 \le H \le 6.2$.
- Encrypted or compressed high-density data exhibits $7.5 \le H \le 8.0$.

### 1.2 Index of Coincidence (IC)
Measures the probability that two randomly selected letters are identical:
$$\text{IC} = \frac{\sum_{i=A}^Z f_i (f_i - 1)}{N(N - 1)}$$
- Natural English language constant: $\text{IC} \approx 0.0667$.
- Polyalphabetic ciphers (e.g. Vigenère with long key) or random data: $\text{IC} \approx 0.0385$.

### 1.3 Chi-Squared ($\chi^2$) Distribution Test
Measures goodness-of-fit against standard English letter frequencies:
$$\chi^2 = \sum_{i=A}^Z \frac{(O_i - E_i)^2}{E_i}$$
where $O_i$ is the observed count of letter $i$, and $E_i = N \cdot p_i^{\text{English}}$.

## 2. Multi-Factor Candidate Scoring Engine (FR-4.1)
Every candidate plaintext $C$ produced during brute-force or recursive decoding is scored using:
$$\text{Score}(C) = w_1 \cdot S_{\text{ngram}}(C) + w_2 \cdot S_{\text{dict}}(C) + w_3 \cdot S_{\text{printable}}(C) + w_4 \cdot S_{\text{ic}}(C) - P_{\text{entropy}}$$
- $w_1 = 0.35$: English Bigram and Trigram frequency alignment.
- $w_2 = 0.35$: Dictionary text coverage and recognized word ratio.
- $w_3 = 0.15$: Percentage of printable ASCII text characters.
- $w_4 = 0.15$: Proximity of IC to the target English constant ($0.0667$).
- $P_{\text{entropy}}$: Penalty factor applied to abnormal distributions ($H > 6.0$ or $H < 1.5$).

### Honest Terminology Standard (FR-4.2)
Top-scoring outputs are labeled as **"Most Likely Candidate"**. The system strictly avoids claiming absolute certainty unless verified by deterministic signature matchers (e.g., valid JSON/XML/AST parsing).

## 3. Supported Encodings & Classical Ciphers
- **Encodings**: Base64 (std + urlsafe), Base32, Base58, Hexadecimal, Binary, Decimal/ASCII codes, URL encoding, HTML entities, Unicode escapes, Morse Code.
- **Classical Ciphers**: Caesar Shift (1-25), ROT variants (ROT5, ROT13, ROT18, ROT47), Atbash, Affine ($a,b$ with $\gcd(a,26)=1$), Vigenère & Beaufort, Rail Fence Transposition, Baconian, Single-byte and Multi-byte Repeating XOR.
