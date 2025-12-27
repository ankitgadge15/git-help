```javascript
const scenarios = {
    start: {
        text: "What did you break this time?",
        options: [
            { label: "I committed to the WRONG branch", next: "wrongBranch" },
            { label: "I need to UNDO or modify a commit", next: "undoMenu" },
            { label: "I'm stuck in a MERGE/REBASE nightmare", next: "mergeNightmare" },
            { label: "I accidentally DELETED something", next: "recovery" },
            { label: "I committed SECRETS (API keys/passwords)", next: "secrets" },
            { label: "Everything is broken, I just want to start over", next: "nuclearOption" },
            { label: "I want to REVERT a pushed commit", next: "revertCommit" },
            { label: "I forgot to PULL and now have conflicts on PUSH", next: "pullConflict" },
            { label: "I need to SQUASH multiple commits", next: "squashCommits" },
            { label: "I'm dealing with STASH issues", next: "stashMenu" },
            { label: "I want to CLEAN untracked files", next: "cleanUntracked" },
            { label: "I need to CHANGE the remote URL", next: "changeRemote" },
            { label: "I want to see DIFF between commits/branches", next: "seeDiff" },
            { label: "I'm having SUBMODULE problems", next: "submoduleIssues" }
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
            { label: "I have 100 conflicts and want to use 'THEIRS'", next: "solveTheirs" },
            { label: "I have conflicts and want to use 'OURS'", next: "solveOurs" },
            { label: "Continue rebase after resolving some conflicts", next: "continueRebase" }
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
    solveOurs: {
        text: "Force Git to accept the current branch's version for all conflicts:",
        commands: ["git checkout --ours .", "git add .", "git commit"]
    },
    continueRebase: {
        text: "After resolving conflicts and staging files, continue the rebase:",
        commands: ["git add <resolved-files>", "git rebase --continue"]
    },
    recovery: {
        text: "What did you lose?",
        options: [
            { label: "I deleted a branch locally", next: "recoverBranch" },
            { label: "I 'hard reset' and lost work", next: "reflog" },
            { label: "I lost a remote branch", next: "recoverRemoteBranch" }
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
    recoverRemoteBranch: {
        text: "List remote branches and recreate locally:",
        commands: [
            "git branch -r",
            "git checkout -b <local-branch> origin/<remote-branch>"
        ]
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
    },
    revertCommit: {
        text: "Revert creates a new commit that undoes the changes of the specified commit (safe for shared history):",
        commands: [
            "git revert <commit-hash>",
            "git push origin <branch-name>"
        ]
    },
    pullConflict: {
        text: "Pull and handle conflicts, or rebase to integrate cleanly:",
        options: [
            { label: "Merge pull (may create merge commit)", next: "mergePull" },
            { label: "Rebase pull (linear history)", next: "rebasePull" }
        ]
    },
    mergePull: {
        text: "Pull with merge strategy:",
        commands: ["git pull origin <branch-name>"]
    },
    rebasePull: {
        text: "Pull with rebase strategy:",
        commands: ["git pull --rebase origin <branch-name>"]
    },
    squashCommits: {
        text: "Use interactive rebase to squash the last N commits:",
        commands: [
            "git rebase -i HEAD~<number-of-commits>",
            "# In editor, change 'pick' to 'squash' or 's' for commits to merge"
        ]
    },
    stashMenu: {
        text: "Stash options:",
        options: [
            { label: "Stash current changes", next: "stashPush" },
            { label: "Apply a stash without removing it", next: "stashApply" },
            { label: "Pop a stash (apply and remove)", next: "stashPop" },
            { label: "List stashes", next: "stashList" },
            { label: "Drop a stash", next: "stashDrop" }
        ]
    },
    stashPush: {
        text: "Save current changes to stash with a message:",
        commands: ["git stash push -m 'WIP on feature'"]
    },
    stashApply: {
        text: "Apply the latest stash:",
        commands: ["git stash apply"]
    },
    stashPop: {
        text: "Apply and remove the latest stash:",
        commands: ["git stash pop"]
    },
    stashList: {
        text: "View all stashes:",
        commands: ["git stash list"]
    },
    stashDrop: {
        text: "Drop a specific stash (use index from list):",
        commands: ["git stash drop stash@{0}"]
    },
    cleanUntracked: {
        text: "Clean untracked files and directories:",
        options: [
            { label: "Dry run (preview)", next: "cleanDry" },
            { label: "Force clean (delete all untracked)", next: "cleanForce" },
            { label: "Clean including ignored files", next: "cleanIgnored" }
        ]
    },
    cleanDry: {
        text: "Preview what would be removed:",
        commands: ["git clean -n"]
    },
    cleanForce: {
        text: "Remove untracked files (dangerous!):",
        commands: ["git clean -f"],
        isDanger: true
    },
    cleanIgnored: {
        text: "Remove untracked and ignored files:",
        commands: ["git clean -f -x"],
        isDanger: true
    },
    changeRemote: {
        text: "Change the URL of the origin remote:",
        commands: [
            "git remote set-url origin <new-url>"
        ]
    },
    seeDiff: {
        text: "Diff options:",
        options: [
            { label: "Diff between two commits", next: "diffCommits" },
            { label: "Diff between branches", next: "diffBranches" },
            { label: "Diff unstaged changes", next: "diffUnstaged" }
        ]
    },
    diffCommits: {
        text: "See changes between two commits:",
        commands: ["git diff <commit1> <commit2>"]
    },
    diffBranches: {
        text: "See differences between branches:",
        commands: ["git diff <branch1>..<branch2>"]
    },
    diffUnstaged: {
        text: "See unstaged changes:",
        commands: ["git diff"]
    },
    submoduleIssues: {
        text: "Submodule troubleshooting:",
        options: [
            { label: "Update submodules", next: "updateSubmodules" },
            { label: "Initialize submodules", next: "initSubmodules" },
            { label: "Deinit a problematic submodule", next: "deinitSubmodule" }
        ]
    },
    updateSubmodules: {
        text: "Update all submodules to latest:",
        commands: ["git submodule update --remote"]
    },
    initSubmodules: {
        text: "Initialize and update submodules:",
        commands: ["git submodule init", "git submodule update"]
    },
    deinitSubmodule: {
        text: "Deinitialize a submodule:",
        commands: ["git submodule deinit -f path/to/submodule"],
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
```
