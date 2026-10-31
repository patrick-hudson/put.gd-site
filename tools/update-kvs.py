#!/usr/bin/env python3
"""Sync the /dl/ permalink targets into the CloudFront KeyValueStore.

Keys are "<channel>/<package>" where package is one of ubuntu24.04, ubuntu26.04,
debian13, fedora44, appimage, checksums or release; values are the URLs from
releases.json. Stable download links fall back to the newest nightly until a stable
release exists. Keys are removed only when neither release is available. /dl/<channel>/appimage.zsync is not a
redirect any more: CloudFront serves the package signer's copy from the pkg bucket
(put.gd-desktop #293 phase 3), so its old key is removed here too.

Uses the AWS CLI (already authenticated in the workflow); stdlib only.
"""
import argparse
import json
import subprocess
import sys

PACKAGES = {"ubuntu24.04": "ubuntu24.04", "ubuntu26.04": "ubuntu26.04", "debian13": "debian13", "fedora44": "fedora44", "appimage": ".AppImage"}


def cli(*args):
    return json.loads(subprocess.run(["aws", "cloudfront-keyvaluestore", *args], check=True, capture_output=True, text=True).stdout)


def wanted(data):
    out = {}
    for channel in ("stable", "nightly"):
        rel = data.get(channel) or (data.get("nightly") if channel == "stable" else None)
        if not rel:
            continue
        out[f"{channel}/release"] = rel["html_url"]
        if rel.get("checksums"):
            out[f"{channel}/checksums"] = rel["checksums"]
        for short, key in PACKAGES.items():
            asset = rel["assets"].get(key)
            if asset:
                out[f"{channel}/{short}"] = asset["url"]
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--kvs-arn", required=True)
    parser.add_argument("--releases", default="public/_site/releases.json")
    args = parser.parse_args()
    if not args.kvs_arn:
        print("no KVS ARN configured; skipping permalinks")
        return 0

    with open(args.releases) as fh:
        target = wanted(json.load(fh))
    current = {item["Key"]: item["Value"] for item in cli("list-keys", "--kvs-arn", args.kvs_arn).get("Items", [])}
    etag = cli("describe-key-value-store", "--kvs-arn", args.kvs_arn)["ETag"]

    puts = [{"Key": k, "Value": v} for k, v in sorted(target.items()) if current.get(k) != v]
    deletes = [{"Key": k} for k in sorted(current) if k not in target]
    if not puts and not deletes:
        print(f"{len(current)} permalinks already current")
        return 0
    cmd = ["update-keys", "--kvs-arn", args.kvs_arn, "--if-match", etag]
    if puts:
        cmd += ["--puts", json.dumps(puts)]
    if deletes:
        cmd += ["--deletes", json.dumps(deletes)]
    cli(*cmd)
    print(f"updated {len(puts)} and removed {len(deletes)} permalinks; {len(target)} now set")
    return 0


if __name__ == "__main__":
    sys.exit(main())
