"""Publication diff and invalidation contracts; no network or AWS credentials."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

import deploy


class Deploy(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.public = self.root / 'public'
        self.manifest = self.root / 'diff.json'
        self.files = {name: name.encode() for name in deploy.ROOT_FILES.values()}
        self.files.update({'_site/releases.json': b'{}', '_site/site.css': b'css', '_site/a.avif': b'image'})
        for name, data in self.files.items():
            path = self.public / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        self.remote = {}
        self.calls = []

    def aws(self, *args):
        self.calls.append(args)
        if args[:2] == ('s3api', 'list-objects-v2'):
            return {'Contents': [{'Key': key, 'ETag': '"' + digest + '"'} for key, digest in self.remote.items()]}
        if args[:2] == ('s3api', 'put-object'):
            self.remote[args[args.index('--key') + 1]] = hashlib.md5(
                Path(args[args.index('--body') + 1]).read_bytes()).hexdigest()
        if args[:2] == ('s3api', 'delete-object'):
            del self.remote[args[args.index('--key') + 1]]
        return {}

    def publish(self):
        deploy.upload(self.public, 'test-bucket', self.manifest, 'a' * 40, self.aws)
        deploy.invalidate(self.manifest, ['EP85P0MVCKASG', deploy.UPLOADS_DISTRIBUTION], self.aws)

    def test_second_identical_deploy_has_no_writes_or_invalidations(self):
        self.publish()
        self.calls.clear()
        self.publish()
        self.assertEqual([call[:2] for call in self.calls], [('s3api', 'list-objects-v2')])
        self.assertEqual(json.loads(self.manifest.read_text()), {'changed': [], 'deleted': []})

    def test_scope_and_collapsing_on_each_distribution(self):
        keys = ['index.html', '_site/site.css', '_site/releases.json', 'install', 'changelog', 'robots.txt']
        self.assertEqual(deploy.paths_for(keys, deploy.UPLOADS_DISTRIBUTION), ['/', '/_site/*', '/index.html'])
        self.assertEqual(deploy.paths_for(keys, 'EP85P0MVCKASG'),
                         ['/', '/_site/*', '/changelog', '/index.html', '/install', '/robots.txt'])
        self.assertEqual(deploy.paths_for(['install', 'changelog'], deploy.UPLOADS_DISTRIBUTION), [])
        self.assertEqual(deploy.paths_for(['_site/releases.json'], 'EP85P0MVCKASG'), ['/_site/*'])

    def test_only_changed_bytes_and_removed_assets_refresh(self):
        self.publish()
        self.calls.clear()
        (self.public / '_site/site.css').write_text('changed')
        (self.public / '_site/a.avif').unlink()
        self.remote['unmanaged.txt'] = 'unmanaged'
        self.publish()
        diff = json.loads(self.manifest.read_text())
        self.assertEqual(diff, {'changed': ['_site/site.css'], 'deleted': ['_site/a.avif']})
        self.assertIn('unmanaged.txt', self.remote)
        invalidations = [call for call in self.calls if call[0] == 'cloudfront']
        self.assertEqual(len(invalidations), 2)
        self.assertTrue(all(call[-1] == '/_site/*' for call in invalidations))

    def test_partial_upload_failure_retains_only_completed_writes_for_refresh(self):
        def failing(*args):
            if args[:2] == ('s3api', 'put-object') and args[args.index('--key') + 1] == '_site/site.css':
                raise RuntimeError('synthetic upload failure')
            return self.aws(*args)
        with self.assertRaisesRegex(RuntimeError, 'synthetic'):
            deploy.upload(self.public, 'test-bucket', self.manifest, 'a' * 40, failing)
        completed = json.loads(self.manifest.read_text())
        self.assertTrue(completed['changed'])
        self.assertEqual(set(completed['changed']), set(self.remote))
        self.assertNotIn('_site/site.css', completed['changed'])
        deploy.invalidate(self.manifest, ['EP85P0MVCKASG', deploy.UPLOADS_DISTRIBUTION], self.aws)
        self.assertEqual(len([call for call in self.calls if call[0] == 'cloudfront']), 2)

    def test_single_part_encryption_types_and_short_html_json_cache(self):
        self.publish()
        puts = {call[call.index('--key') + 1]: call for call in self.calls if call[1] == 'put-object'}
        for key, call in puts.items():
            self.assertEqual(call[call.index('--server-side-encryption') + 1], 'AES256')
            self.assertIn('--content-md5', call)
            if key in ('index.html', 'changelog', '404.html', 'install', '_site/releases.json'):
                self.assertEqual(call[call.index('--cache-control') + 1], 'public, max-age=300')
        self.assertEqual(deploy.headers('_site/a.avif')[0], 'image/avif')
        install = puts['install']
        self.assertEqual(json.loads(install[install.index('--metadata') + 1]), {'source-commit': 'a' * 40})
        self.assertFalse(any(key.startswith('update/') for key in puts))


if __name__ == '__main__':
    unittest.main()
