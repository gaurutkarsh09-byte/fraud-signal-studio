#!/usr/bin/env python3
"""
Bridge used by Node/Express to call Microsoft Fabric Data Agent.
Reads TENANT_ID and DATA_AGENT_URL from .env/environment, calls FabricDataAgentClient.ask(prompt),
and prints only the final answer to stdout so server.js can return it to React.
"""
import os
import sys
import json
from pathlib import Path
import io

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

try:
    from dotenv import load_dotenv
    # Load .env from same folder as this helper first, then current working directory
    helper_dir = Path(__file__).resolve().parent
    load_dotenv(helper_dir / ".env")
    load_dotenv()
except Exception:
    pass


def _read_config_file(helper_dir: Path):
    """Optional fallback for older powerbi_config.json based setup."""
    cfg_path = helper_dir / "powerbi_config.json"
    if not cfg_path.exists():
        return {}
    try:
        with open(cfg_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def main():
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print("Error: No prompt provided.", file=sys.stderr)
        sys.exit(1)

    prompt = sys.argv[1]
    helper_dir = Path(__file__).resolve().parent

    cfg = _read_config_file(helper_dir)
    tenant_id = (os.getenv("TENANT_ID") or cfg.get("tenantId") or cfg.get("TENANT_ID") or "").strip()
    data_agent_url = (os.getenv("DATA_AGENT_URL") or cfg.get("dataAgentUrl") or cfg.get("DATA_AGENT_URL") or "").strip()

    if not tenant_id or not data_agent_url or "YOUR_" in tenant_id or "YOUR_" in data_agent_url:
        print("Error: TENANT_ID and DATA_AGENT_URL must be set in .env or environment variables.", file=sys.stderr)
        sys.exit(2)

    # Make sure this project folder is importable so fabric_data_agent_client.py beside this file works.
    if str(helper_dir) not in sys.path:
        sys.path.insert(0, str(helper_dir))

    # Optional fallback if you keep the client in ../fabric_data_agent_client-main
    legacy_client_dir = helper_dir.parent / "fabric_data_agent_client-main"
    if legacy_client_dir.exists() and str(legacy_client_dir) not in sys.path:
        sys.path.append(str(legacy_client_dir))

    try:
        from fabric_data_agent_client import FabricDataAgentClient

        client = FabricDataAgentClient(
            tenant_id=tenant_id,
            data_agent_url=data_agent_url
        )
        response = client.ask(prompt)
        print(response)
        sys.exit(0)
    except Exception as e:
        print(f"Error executing Fabric Data Agent call: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
