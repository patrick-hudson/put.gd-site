"""Pinned-SSH access to a capture host and the agent running there."""
import json
import os
import shlex
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent


class HostError(RuntimeError):
    pass


class Host:
    def __init__(self, name, cfg, putgd_repo):
        self.name = name
        self.cfg = cfg
        self.known_hosts = Path(cfg['knownHosts'].replace('{PUTGD_REPO}', str(putgd_repo))).expanduser()
        self.identity = Path(cfg['identity']).expanduser()
        if not self.known_hosts.is_file():
            raise HostError(f'No pinned host key for {name} at {self.known_hosts}. Recover the verified pin '
                            '(docs/remote-builders.md in the app repo); never trust on first use.')
        if not self.identity.is_file():
            raise HostError(f'SSH identity {self.identity} is missing')
        self._control = tempfile.mkdtemp(prefix='site-shots-ssh-')
        self.target = f"{cfg['user']}@{cfg['address']}"
        self.run_dir = None

    def ssh_args(self):
        return ['-i', str(self.identity), '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=yes',
                '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', '-o', f'UserKnownHostsFile={self.known_hosts}',
                '-o', 'ControlMaster=auto', '-o', f'ControlPath={self._control}/cm', '-o', 'ControlPersist=300',
                '-o', 'ServerAliveInterval=15']

    def run(self, command, input=None, check=True, timeout=120):
        """Run a shell command on the host. `input` (bytes or str) goes to stdin only."""
        if isinstance(input, str):
            input = input.encode()
        result = subprocess.run(['ssh'] + self.ssh_args() + [self.target, command], input=input,
                                stdin=None if input is not None else subprocess.DEVNULL,
                                capture_output=True, timeout=timeout)
        out = result.stdout.decode(errors='replace')
        if check and result.returncode != 0:
            raise HostError(f'{self.name}: `{command[:120]}` exited {result.returncode}: '
                            f'{result.stderr.decode(errors="replace").strip()[-600:]}')
        return out

    def put(self, local, remote):
        subprocess.run(['scp', '-q'] + self.ssh_args() + [str(local), f'{self.target}:{remote}'], check=True, timeout=600)

    def get(self, remote, local):
        subprocess.run(['scp', '-q'] + self.ssh_args() + [f'{self.target}:{remote}', str(local)], check=True, timeout=600)

    def agent(self, *args, input=None, check=True, timeout=120):
        """Call RUN/agent.py; returns its JSON reply."""
        if not self.run_dir:
            raise HostError('no run directory on the host yet')
        command = shlex.join(['python3', '-I', f'{self.run_dir}/agent.py', self.run_dir, *map(str, args)])
        out = self.run(command, input=input, check=False, timeout=timeout)
        try:
            reply = json.loads(out.strip().splitlines()[-1]) if out.strip() else {'ok': False, 'error': 'no reply'}
        except ValueError:
            reply = {'ok': False, 'error': out.strip()[-400:]}
        if check and reply.get('ok') is False:
            raise HostError(f'{self.name}: agent {args[0]} failed: {reply.get("error")}')
        return reply

    def cli(self, method, params=None, check=True, timeout=150):
        """putgd-cli on the host, inside the private app environment."""
        args = ['cli', method] + ([json.dumps(params, separators=(',', ':'))] if params is not None else [])
        reply = self.agent(*args, check=False, timeout=timeout)
        if check and not reply.get('ok'):
            raise HostError(f'putgd-cli {method} failed: {json.dumps(reply.get("error"))[:400]}')
        return reply

    def close(self):
        subprocess.run(['ssh', '-O', 'exit'] + self.ssh_args() + [self.target], capture_output=True, timeout=20)
        for leftover in Path(self._control).glob('*'):
            leftover.unlink(missing_ok=True)
        os.rmdir(self._control)
