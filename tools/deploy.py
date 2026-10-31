#!/usr/bin/env python3
"""Publish changed site bytes, then invalidate only their served paths.

ListObjectsV2 ETags are MD5 for our single-part, SSE-S3 PutObject uploads. This
uses the deploy role's existing ListBucket/PutObject/DeleteObject permissions;
no GetObject permission or Terraform change is needed. Never upload the feeds:
the package signer owns /update/ in a different bucket.
"""
import argparse
import base64
import hashlib
import json
import mimetypes
import os
from pathlib import Path
import subprocess

UPLOADS_DISTRIBUTION = 'E2UO5E3WJ8BRV9'
ROOT_FILES = {'index.html': 'index.html', 'changelog': 'changelog.html', '404.html': '404.html',
              'robots.txt': 'robots.txt', 'sitemap.xml': 'sitemap.xml', 'install': 'install'}


def aws(*args):
    result = subprocess.run(['aws', *args, '--output', 'json'], check=True, capture_output=True, text=True)
    return json.loads(result.stdout) if result.stdout.strip() else {}


def objects(public):
    files = {key: public / name for key, name in ROOT_FILES.items()}
    files.update((path.relative_to(public).as_posix(), path) for path in (public / '_site').rglob('*') if path.is_file())
    for path in files.values():
        if not path.is_file() or path.is_symlink():
            raise ValueError(f'Expected a regular site file: {path}')
    return files


def paths_for(keys, distribution):
    paths = set()
    for key in keys:
        if key == 'index.html':
            paths.update(('/', '/index.html'))
        elif key.startswith('_site/'):
            paths.add('/_site/*')
        elif distribution != UPLOADS_DISTRIBUTION:
            paths.add('/' + key)
    return sorted(paths)


def headers(key):
    if key in ('index.html', 'changelog', '404.html'):
        return 'text/html; charset=utf-8', 'public, max-age=300'
    if key == 'install':
        return 'text/plain; charset=utf-8', 'public, max-age=300'
    suffix = Path(key).suffix
    kind = {'.avif': 'image/avif', '.woff2': 'font/woff2', '.json': 'application/json'}.get(suffix)
    kind = kind or mimetypes.guess_type(key)[0] or 'application/octet-stream'
    cache = 'public, max-age=300' if suffix in ('.json', '.html') else (
        'public, max-age=86400, stale-while-revalidate=604800' if key.startswith('_site/') else 'public, max-age=3600')
    return kind, cache


def upload(public, bucket, manifest, installer_commit, call=aws):
    files = objects(public)
    remote = {obj['Key']: obj['ETag'].strip('"') for obj in
              call('s3api', 'list-objects-v2', '--bucket', bucket).get('Contents', [])}
    digests = {key: hashlib.md5(path.read_bytes(), usedforsecurity=False).digest() for key, path in files.items()}
    changed = sorted(key for key in files if remote.get(key) != digests[key].hex())
    deleted = sorted(key for key in remote if key.startswith('_site/') and key not in files)
    # Retain completed writes so a later upload/KVS failure still refreshes them.
    completed = {'changed': [], 'deleted': []}
    def save():
        manifest.write_text(json.dumps(completed, indent=2) + '\n')
    save()
    for key in changed:
        kind, cache = headers(key)
        args = ['s3api', 'put-object', '--bucket', bucket, '--key', key, '--body', str(files[key]),
                '--content-type', kind, '--cache-control', cache, '--server-side-encryption', 'AES256',
                '--content-md5', base64.b64encode(digests[key]).decode()]
        if key == 'install':
            args += ['--metadata', json.dumps({'source-commit': installer_commit})]
        call(*args)
        completed['changed'].append(key)
        save()
    for key in deleted:
        call('s3api', 'delete-object', '--bucket', bucket, '--key', key)
        completed['deleted'].append(key)
        save()
    print(f'Site diff: {len(changed)} changed objects, {len(deleted)} removed assets')


def invalidate(manifest, distributions, call=aws):
    diff = json.loads(manifest.read_text())
    keys = diff['changed'] + diff['deleted']
    total = 0
    for distribution in dict.fromkeys(distributions):
        paths = paths_for(keys, distribution)
        if paths:
            call('cloudfront', 'create-invalidation', '--distribution-id', distribution, '--paths', *paths)
            total += len(paths)
        print(f'{distribution}: {len(paths)} invalidation paths')
    message = f'Site CDN refresh: {total} invalidation paths ({len(keys)} changed/deleted objects).'
    print(message)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as summary:
            summary.write(message + '\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase', choices=('upload', 'invalidate'))
    parser.add_argument('--public', type=Path, default=Path('public'))
    parser.add_argument('--bucket')
    parser.add_argument('--manifest', type=Path, required=True)
    parser.add_argument('--installer-commit', default='')
    parser.add_argument('--distributions', nargs='+', default=[])
    args = parser.parse_args()
    if args.phase == 'upload':
        if not args.bucket or not args.installer_commit:
            parser.error('upload requires --bucket and --installer-commit')
        upload(args.public, args.bucket, args.manifest, args.installer_commit)
    else:
        invalidate(args.manifest, args.distributions)


if __name__ == '__main__':
    main()
