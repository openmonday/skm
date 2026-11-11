import subprocess
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/query-map.py'


class QueryTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        subprocess.run(['git', 'init', '-q', str(self.root)], check=True)

    def record(self, name, paths):
        p = self.root / '.context/map' / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text('---\ntype: feat\nfiles:\n' + ''.join('  - ' + x + '\n' for x in paths) + 'since: abc1234\n---\n# Title\n')

    def query(self, *paths):
        return subprocess.run(['python3', str(SCRIPT), *paths], cwd=self.root, text=True, capture_output=True)

    def test_nested_exact_directory_multiple_and_prefix(self):
        self.record('module/one.md', ['src/a', 'lib/'])
        self.record('two.md', ['src/'])
        r = self.query('src/a', 'src/nested/file', 'src2/file', 'lib/new')
        self.assertEqual(r.returncode, 0, r.stderr)
        a, nested, false, lib = r.stdout.splitlines()[0:3], r.stdout, r.stdout.split("'src2/file':")[1].split("'lib/new':")[0], r.stdout.split("'lib/new':")[1]
        self.assertTrue(any('module/one.md' in line for line in a))
        self.assertIn('two.md', nested)
        self.assertIn('(no matching records)', false)
        self.assertIn('module/one.md', lib)

    def test_missing_invalid_and_incomplete(self):
        self.assertIn('no matching', self.query('new/file').stdout)
        for path in ('../x', '/x', 'a/./b', 'a//b', 'x*', 'foo/'):
            self.assertEqual(self.query(path).returncode, 2, path)
        self.record('ok.md', ['src'])
        (self.root / '.context/map/bad.md').write_text('broken')
        r = self.query('src/a')
        self.assertEqual(r.returncode, 1)
        self.assertIn('ok.md', r.stdout)
        self.assertIn('incomplete', r.stderr)

    def test_standalone_script_copy(self):
        self.record('module/one.md', ['src/'])
        standalone = self.root / 'standalone' / 'query-map.py'
        standalone.parent.mkdir()
        standalone.write_bytes(SCRIPT.read_bytes())
        result = subprocess.run(['python3', '-I', str(standalone), 'src/file'],
                                cwd=self.root, text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('module/one.md', result.stdout)

    def test_symlink_record_and_directory(self):
        self.record('ok.md', ['src'])
        base = self.root / '.context/map'
        (base / 'link.md').symlink_to(base / 'ok.md')
        (base / 'linked').symlink_to(base, target_is_directory=True)
        r = self.query('src/a')
        self.assertEqual(r.returncode, 1)
        self.assertIn('symbolic-link', r.stderr)
        self.assertIn('ok.md', r.stdout)


if __name__ == '__main__':
    unittest.main()
