const scenarios = {
    start: {
        text: "What did you break this time?",
        options: [
            { label: "I committed to the WRONG branch", next: "wrongBranch" },
            { label: "I need to UNDO or modify a commit", next: "undoMenu" },
            { label: "I'm stuck in a MERGE/REBASE nightmare", next: "mergeNightmare" },
            { label: "I accidentally DELETED something", next: "recovery" },
            { label: "I committed SECRETS (API keys/passwords)", next: "secrets" },
            { label: "Everything is broken, I just want to start over", next: "nuclearOption" }
        ]
    },
    wrongBranch: {
        text: "Have you pushed the incorrect commit to a remote server?",
        options: [
            { label: "No, it's only local", next: "wrongBranchLocal" },
            { label: "Yes, I pushed it already", next: "wrongBranchRemote" }
        ]
    },
    wrongBranchLocal: {
        text: "Move your work to a new branch and reset the current one:",
        commands: [
            "git branch new-feature-branch",
            "git reset HEAD~1 --hard",
            "git checkout new-feature-branch"
        ],
        isDanger: true
    },
    wrongBranchRemote: {
        text: "You need to fix it locally and force push (Warning: coordinates required with team):",
        commands: [
            "git checkout correct-branch",
            "git cherry-pick <commit-hash>",
            "git push origin correct-branch",
            "git checkout wrong-branch",
            "git reset --hard HEAD~1",
            "git push origin wrong-branch --force"
        ],
        isDanger: true
    },
    undoMenu: {
        text: "What specifically do you want to change?",
        options: [
            { label: "Undo last commit (keep my changes)", next: "undoSoft" },
            { label: "Undo last commit (delete my changes)", next: "undoHard" },
            { label: "Fix just the commit message", next: "fixMessage" },
            { label: "Add a forgotten file to the last commit", next: "amendFile" }
        ]
    },
    undoSoft: {
        text: "This moves your changes back to 'Staged' status:",
        commands: ["git reset --soft HEAD~1"]
    },
    undoHard: {
        text: "This will wipe the files back to the state of the previous commit:",
        commands: ["git reset --hard HEAD~1"],
        isDanger: true
    },
    fixMessage: {
        text: "Use amend to rewrite the message:",
        commands: ["git commit --amend -m 'New message'"]
    },
    amendFile: {
        text: "Stage the file first, then amend without changing the message:",
        commands: [
            "git add forgotten-file.txt",
            "git commit --amend --no-edit"
        ]
    },
    mergeNightmare: {
        text: "What's the status of the merge/rebase?",
        options: [
            { label: "I want to ABORT this mess and go back", next: "abortMerge" },
            { label: "I have 100 conflicts and want to use 'THEIRS'", next: "solveTheirs" }
        ]
    },
    abortMerge: {
        text: "Stop the merge and return to the state before it started:",
        commands: ["git merge --abort", "git rebase --abort"]
    },
    solveTheirs: {
        text: "Force Git to accept the incoming version for all conflicts:",
        commands: ["git checkout --theirs .", "git add .", "git commit"]
    },
    recovery: {
        text: "What did you lose?",
        options: [
            { label: "I deleted a branch locally", next: "recoverBranch" },
            { label: "I 'hard reset' and lost work", next: "reflog" }
        ]
    },
    recoverBranch: {
        text: "Find the hash in the reflog, then recreate the branch:",
        commands: [
            "git reflog",
            "git checkout -b <branch-name> <hash-from-reflog>"
        ]
    },
    reflog: {
        text: "Git Reflog is your best friend. It tracks every move:",
        commands: [
            "git reflog",
            "git reset --hard <hash-where-it-was-fine>"
        ],
        isDanger: true
    },
    secrets: {
        text: "STOP. Do not push. If already pushed, rotate keys immediately. Then run:",
        commands: [
            "git filter-branch --force --index-filter \"git rm --cached --ignore-unmatch path/to/secret.txt\" --prune-empty --tag-name-filter cat -- --all"
        ],
        isDanger: true
    },
    nuclearOption: {
        text: "Discard ALL local changes and match the remote exactly:",
        commands: [
            "git fetch origin",
            "git reset --hard origin/main"
        ],
        isDanger: true
    }
};

let history = ['start'];

function renderNode(nodeKey) {
    const node = scenarios[nodeKey];
    const container = document.getElementById('content');
    const backBtn = document.getElementById('back-btn');

    if (nodeKey === 'start') {
        backBtn.classList.add('hidden');
        history = ['start'];
    } else {
        backBtn.classList.remove('hidden');
    }

    let html = `<div class="question">$ ${node.text}</div>`;

    if (node.options) {
        node.options.forEach(opt => {
            html += `<button class="option-btn" onclick="navigateTo('${opt.next}')">> ${opt.label}</button>`;
        });
    } else if (node.commands) {
        html += `<div class="command-block ${node.isDanger ? 'danger-zone' : ''}">`;
        node.commands.forEach((cmd, index) => {
            html += `
                <div class="command-wrapper">
                    <code class="command-line" id="cmd-${index}">${cmd}</code>
                    <button class="copy-btn" onclick="copyToClipboard('cmd-${index}')">Copy</button>
                </div>`;
        });
        html += `</div><button class="option-btn" onclick="navigateTo('start')" style="margin-top:20px">> Back to Start</button>`;
    }

    container.innerHTML = html;
}

function navigateTo(nodeKey) {
    history.push(nodeKey);
    renderNode(nodeKey);
}

function goBack() {
    if (history.length > 1) {
        history.pop();
        const prevNode = history[history.length - 1];
        renderNode(prevNode);
    }
}

async function copyToClipboard(id) {
    const text = document.getElementById(id).innerText;
    try {
        await navigator.clipboard.writeText(text);
        const btn = document.querySelector(`[onclick="copyToClipboard('${id}')"]`);
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.color = "var(--success-color)";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.color = "";
        }, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

renderNode('start');
