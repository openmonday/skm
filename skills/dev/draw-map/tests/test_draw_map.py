import os
import pty
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / 'scripts'
COVERAGE = SCRIPTS / 'check-coverage.py'
FORMAT = SCRIPTS / 'check-format.py'
EXPIRED = SCRIPTS / 'check-expired.py'


class Checks(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.git('init', '-q')
        self.git('config', 'user.email', 'test@example.com')
        self.git('config', 'user.name', 'Test')
        self.put('src/a', 'a')
        self.put('src/nested/b', 'b')
        self.git('add', '.')
        self.git('commit', '-qm', 'initial')
        self.put('.git/info/exclude', '/.context/\n')
        self.initial = self.git('rev-parse', 'HEAD').strip()

    def git(self, *args):
        return subprocess.check_output(['git', *args], cwd=self.root, text=True)

    def put(self, path, content):
        p = self.root / path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content)

    def record(self, since=None, paths=('src/',), extra=''):
        self.put('.context/map/source.md', '---\ntype: feat\nfiles:\n' + ''.join('  - '+p+'\n' for p in paths) + 'since: '+(since or self.initial)+'\n---\n# Source\n\n## Feature\nSource files.\n'+extra)

    def check(self, script=COVERAGE):
        return subprocess.run(['python3', str(script)], cwd=self.root, text=True, capture_output=True)

    def test_directory_and_latest_file(self):
        self.record()
        self.assertEqual(self.check().returncode, 0, self.check().stdout)
        self.put('src/nested/b', 'changed')
        self.git('add', 'src/nested/b')
        self.git('commit', '-qm', 'change nested')
        latest = self.git('rev-parse', 'HEAD').strip()
        result = self.check(EXPIRED)
        self.assertEqual(result.returncode, 1)
        self.assertIn('expected '+latest, result.stdout)
        self.record(latest)
        self.assertEqual(self.check(EXPIRED).returncode, 0)

    def test_unrecorded_and_invalid_format(self):
        self.record(paths=('src/a',))
        self.assertIn("'src/nested/b'", self.check().stdout)
        self.record(extra='```\ncode\n```\n')
        out = self.check(FORMAT).stdout
        self.assertIn('code fences', out)
        self.assertIn("'src/a'", self.check().stdout)

    def test_invalid_since_and_staged_file(self):
        self.record('1234567')
        self.assertIn('invalid or ambiguous', self.check(EXPIRED).stdout)
        self.put('src/new', 'new')
        self.git('add', 'src/new')
        self.record()
        self.assertIn('no commit at HEAD', self.check(EXPIRED).stdout)

    def test_missing_map_and_non_git(self):
        self.assertIn('UNRECORDED (2)', self.check().stdout)
        with tempfile.TemporaryDirectory() as d:
            self.assertEqual(subprocess.run(['python3', str(COVERAGE)], cwd=d, capture_output=True).returncode, 2)

    def test_bad_paths_and_tracked_records(self):
        self.record(paths=('../src',))
        self.assertIn('invalid literal', self.check(FORMAT).stdout)
        self.record()
        self.git('add', '-f', '.context/map/source.md')
        self.assertIn("'.context/map/source.md'", self.check().stdout)

    def test_recursive_records_and_separate_reports(self):
        self.record()
        source = self.root / '.context/map/source.md'
        nested = self.root / '.context/map/module/source.md'
        nested.parent.mkdir(parents=True)
        source.rename(nested)
        self.assertEqual(self.check().returncode, 0, self.check().stdout)
        self.assertEqual(self.check(EXPIRED).returncode, 0, self.check(EXPIRED).stdout)
        self.put('src/a', 'changed')
        self.git('add', 'src/a')
        self.git('commit', '-qm', 'update')
        self.assertEqual(self.check().returncode, 0)
        self.assertIn('.context/map/module/source.md', self.check(EXPIRED).stdout)
        nested.write_text('invalid')
        self.assertIn('SKIPPED INVALID RECORDS', self.check(EXPIRED).stdout)
        self.assertEqual(self.check(EXPIRED).returncode, 1)

    def test_output_styles_and_streams(self):
        self.record()
        for script, title in ((COVERAGE, 'UNRECORDED'), (FORMAT, 'FORMAT NON-COMPLIANCE'), (EXPIRED, 'EXPIRED')):
            result = self.check(script)
            self.assertEqual(result.returncode, 0)
            self.assertEqual(result.stderr, '')
            self.assertIn(title + ' (0)\n  (none)', result.stdout)
            self.assertNotIn('\x1b', result.stdout)

            master, slave = pty.openpty()
            env = dict(os.environ, TERM='xterm')
            env.pop('NO_COLOR', None)
            try:
                proc = subprocess.Popen(['python3', str(script)], cwd=self.root, stdout=slave,
                                        stderr=subprocess.PIPE, env=env)
                os.close(slave)
                slave = None
                output = b''
                while True:
                    try:
                        chunk = os.read(master, 4096)
                    except OSError:
                        break
                    if not chunk:
                        break
                    output += chunk
            finally:
                if slave is not None:
                    os.close(slave)
                os.close(master)
            stderr = proc.communicate()[1]
            self.assertEqual(proc.returncode, 0)
            self.assertEqual(stderr, b'')
            self.assertIn(b'\x1b[1m' + title.encode() + b'\x1b[0m', output)
            self.assertIn(b'\x1b[2m(0)\x1b[0m', output)
            self.assertIn(b'\x1b[2m(none)\x1b[0m', output)

    def test_untracked_and_ignored_files(self):
        self.record()
        self.put('src/new', 'new')
        self.put('loose', 'untracked')
        self.put('.gitignore', 'ignored\n')
        self.put('ignored', 'ignored')
        result = self.check()
        self.assertIn("'loose'", result.stdout)
        self.assertIn("'.gitignore'", result.stdout)
        self.assertNotIn("'src/new'", result.stdout)
        self.assertNotIn("'ignored'", result.stdout)
        self.assertIn('no commit at HEAD', self.check(EXPIRED).stdout)

    def test_separate_format_findings(self):
        self.record(extra='```\n')
        self.assertNotIn('code fences', self.check().stdout)
        self.assertIn('code fences', self.check(FORMAT).stdout)
        result = self.check(EXPIRED)
        self.assertIn('.context/map/source.md', result.stdout)
        self.assertIn('check-format.py', result.stdout)

    def test_failure_output_is_stderr(self):
        with tempfile.TemporaryDirectory() as d:
            for script in (COVERAGE, FORMAT, EXPIRED):
                result = subprocess.run(['python3', str(script)], cwd=d, capture_output=True, text=True)
                self.assertEqual(result.returncode, 2)
                self.assertEqual(result.stdout, '')
                self.assertIn('Cannot check:', result.stderr)
                self.assertNotIn('\x1b', result.stderr)

    def test_scripts_run_without_sibling_modules(self):
        self.record()
        with tempfile.TemporaryDirectory() as directory:
            for script in (COVERAGE, FORMAT, EXPIRED):
                isolated = Path(directory) / script.name
                isolated.write_bytes(script.read_bytes())
                expected = self.check(script)
                result = self.check(isolated)
                self.assertEqual((result.returncode, result.stdout, result.stderr),
                                 (expected.returncode, expected.stdout, expected.stderr))
                isolated.unlink()

    def test_format_strictness(self):
        self.record(extra='x\n'*55)
        self.assertIn('under 60 lines', self.check(FORMAT).stdout)
        self.put('.context/map/bad.md', '---\ntype: feat\ntype: fix\nfiles: []\nsince: abcdef0\n---\n# Bad\n')
        out = self.check(FORMAT).stdout
        self.assertIn('duplicate type', out)
        self.assertIn('nonempty block list', out)


if __name__ == '__main__':
    unittest.main()
