import subprocess
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/setup-context.sh'


class SetupContextTests(unittest.TestCase):
    def test_initializes_idempotently_and_preserves_legacy_data(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            subprocess.run(['git', 'init', '-q', str(root)], check=True)
            legacy = root / '.context/arch/old.md'
            legacy.parent.mkdir(parents=True)
            legacy.write_text('keep me')
            for _ in range(2):
                subprocess.run(['bash', str(SCRIPT)], cwd=root, check=True, capture_output=True)
            for name in ('map', 'issues', 'reference'):
                self.assertTrue((root / '.context' / name).is_dir())
            self.assertEqual(legacy.read_text(), 'keep me')
            self.assertTrue((root / '.context/GLOSSARY.md').is_file())
            exclude = (root / '.git/info/exclude').read_text().splitlines()
            self.assertEqual(exclude.count('/.context'), 1)


if __name__ == '__main__':
    unittest.main()
