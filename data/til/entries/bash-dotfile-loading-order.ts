import type { TILEntry } from "../index"

const _bash_dotfile_loading_order: TILEntry = {
    id: "bash-dotfile-loading-order",
    title: "Bash and Zsh load dotfiles in a specific order that matters for PATH setup",
    date: "2026-09-07",
    category: "Linux",
    published: true,
    body: "Bash login shells load `/etc/profile` then `~/.bash_profile` (or `~/.bash_login` or `~/.profile` if the first two do not exist). Interactive non-login shells only load `~/.bashrc`. Zsh is similar: login shells load `~/.zprofile` then `~/.zshrc`, non-login interactive shells load only `~/.zshrc`. This is why PATH changes in `~/.bashrc` sometimes do not appear in a fresh terminal on macOS: Terminal.app opens a login shell, so `~/.bash_profile` runs, not `~/.bashrc`. The fix is to source `~/.bashrc` from `~/.bash_profile`.",
    detail: [
      {
        type: "code",
        lang: "bash",
        code: `# Add to the end of ~/.bash_profile to fix the macOS PATH issue
if [ -f ~/.bashrc ]; then
  source ~/.bashrc
fi

# For Zsh, add this to ~/.zprofile
if [ -f ~/.zshrc ]; then
  source ~/.zshrc
fi`,
        caption: "Sourcing .bashrc from .bash_profile ensures consistent PATH in both login and non-login shells",
      },
      {
        type: "link",
        url: "https://www.gnu.org/software/bash/manual/bash.html#Bash-Startup-Files",
        label: "GNU Bash: Startup Files",
        description: "The definitive reference for which files bash loads in which modes and in which order.",
      },
    ],
    tags: ["Linux", "bash", "zsh", "dotfiles", "shell"],
  }

export default _bash_dotfile_loading_order
