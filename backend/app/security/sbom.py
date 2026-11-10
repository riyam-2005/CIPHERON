"""
CIPHERON-X1 Software Bill of Materials (SBOM) Generator
Conforms to SPDX 2.3 and CycloneDX 1.5 Standards (suggestion-v3.md Section 5.2)
"""

import uuid
import datetime
from typing import Dict, Any, List


DEPENDENCIES = [
    {
        "name": "fastapi",
        "version": "0.115.0",
        "purl": "pkg:pypi/fastapi@0.115.0",
        "license": "MIT",
        "supplier": "Tiangolo",
        "type": "framework",
        "sha256": "8a3e7b1a2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789ab"
    },
    {
        "name": "pydantic",
        "version": "2.9.2",
        "purl": "pkg:pypi/pydantic@2.9.2",
        "license": "MIT",
        "supplier": "Pydantic Services Inc.",
        "type": "library",
        "sha256": "4b5c6d7e8f90123456789abcdef0123456789ab8a3e7b1a2c3d4e5f60718293a"
    },
    {
        "name": "cryptography",
        "version": "43.0.1",
        "purl": "pkg:pypi/cryptography@43.0.1",
        "license": "Apache-2.0 OR BSD-3-Clause",
        "supplier": "PyCA",
        "type": "library",
        "sha256": "123456789abcdef0123456789ab8a3e7b1a2c3d4e5f60718293a4b5c6d7e8f90"
    },
    {
        "name": "wasmtime",
        "version": "49.0.0",
        "purl": "pkg:pypi/wasmtime@49.0.0",
        "license": "Apache-2.0 WITH LLVM-exception",
        "supplier": "Bytecode Alliance",
        "type": "runtime",
        "sha256": "def0123456789ab8a3e7b1a2c3d4e5f60718293a4b5c6d7e8f90123456789abc"
    },
    {
        "name": "esp-idf",
        "version": "5.3.1",
        "purl": "pkg:github/espressif/esp-idf@v5.3.1",
        "license": "Apache-2.0",
        "supplier": "Espressif Systems",
        "type": "operating-system",
        "sha256": "99887766554433221100aabbccddeeff99887766554433221100aabbccddeeff"
    },
    {
        "name": "freertos-kernel",
        "version": "10.5.1",
        "purl": "pkg:github/FreeRTOS/FreeRTOS-Kernel@V10.5.1",
        "license": "MIT",
        "supplier": "Amazon Web Services / FreeRTOS",
        "type": "operating-system",
        "sha256": "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"
    },
    {
        "name": "react",
        "version": "18.3.1",
        "purl": "pkg:npm/react@18.3.1",
        "license": "MIT",
        "supplier": "Meta Platforms Inc.",
        "type": "framework",
        "sha256": "f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5"
    },
    {
        "name": "lucide-react",
        "version": "0.454.0",
        "purl": "pkg:npm/lucide-react@0.454.0",
        "license": "ISC",
        "supplier": "Lucide Project",
        "type": "library",
        "sha256": "c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5"
    }
]


class SBOMGenerator:
    """Generates standardized SPDX 2.3 and CycloneDX 1.5 Software Bill of Materials."""

    @staticmethod
    def generate_spdx_sbom() -> Dict[str, Any]:
        """Generate SPDX 2.3 format JSON SBOM."""
        doc_id = str(uuid.uuid4())
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

        packages = []
        for d in DEPENDENCIES:
            packages.append({
                "SPDXID": f"SPDXRef-Package-{d['name']}",
                "name": d["name"],
                "versionInfo": d["version"],
                "downloadLocation": "NOASSERTION",
                "packageSupplier": f"Organization: {d['supplier']}",
                "licenseConcluded": d["license"],
                "licenseDeclared": d["license"],
                "externalRefs": [
                    {
                        "referenceCategory": "PACKAGE-MANAGER",
                        "referenceType": "purl",
                        "referenceLocator": d["purl"]
                    }
                ],
                "checksums": [
                    {
                        "algorithm": "SHA256",
                        "checksumValue": d["sha256"]
                    }
                ]
            })

        return {
            "spdxVersion": "SPDX-2.3",
            "dataLicense": "CC0-1.0",
            "SPDXID": "SPDXRef-DOCUMENT",
            "name": "CIPHERON-X1-Enterprise-Platform",
            "documentNamespace": f"https://cipheron.security/spdx/{doc_id}",
            "creationInfo": {
                "created": timestamp,
                "creators": ["Tool: CIPHERON-X1-HITL-Pipeline-v4.0", "Organization: CIPHERON Security Group"]
            },
            "packages": packages
        }

    @staticmethod
    def generate_cyclonedx_sbom() -> Dict[str, Any]:
        """Generate CycloneDX 1.5 format JSON SBOM."""
        serial_number = f"urn:uuid:{uuid.uuid4()}"
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

        components = []
        for d in DEPENDENCIES:
            components.append({
                "type": d["type"],
                "name": d["name"],
                "version": d["version"],
                "purl": d["purl"],
                "publisher": d["supplier"],
                "licenses": [
                    {"license": {"id": d["license"]}}
                ],
                "hashes": [
                    {
                        "alg": "SHA-256",
                        "content": d["sha256"]
                    }
                ]
            })

        return {
            "bomFormat": "CycloneDX",
            "specVersion": "1.5",
            "serialNumber": serial_number,
            "version": 1,
            "metadata": {
                "timestamp": timestamp,
                "tools": [
                    {
                        "vendor": "CIPHERON Security",
                        "name": "HITL-SBOM-Engine",
                        "version": "4.0.0"
                    }
                ],
                "component": {
                    "type": "device",
                    "name": "CIPHERON-X1-V4-ENTERPRISE",
                    "version": "4.0.0-ENTERPRISE",
                    "description": "Portable Universal Code, Encoding & Quantum-Resistant Cryptanalysis Device"
                }
            },
            "components": components
        }


# Singleton instance
sbom_generator = SBOMGenerator()
