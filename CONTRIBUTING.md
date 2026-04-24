# 🤝 Contributing to CKAD Exam Prep
Thank you for your interest in contributing! This guide is for anyone learning CKAD, and your contributions help the whole community.
---
## 📋 Ways to Contribute
- 🐛 **Fix bugs** — incorrect commands, wrong YAML fields, typos
- ➕ **Add content** — new practice questions, exercises, examples
- 📝 **Improve docs** — clearer explanations, better examples
- 🌍 **Translate** — help make this accessible in more languages
- ⭐ **Star the repo** — helps others discover this resource!
---
## 🛠 How to Contribute
### 1. Fork & Clone
```bash
# Fork via GitHub UI, then:
git clone https://github.com/YOUR_USERNAME/ckad-exam-prep.git
cd ckad-exam-prep
```
### 2. Create a Branch
```bash
git checkout -b feature/add-statefulset-exercise
# or
git checkout -b fix/typo-in-rbac-readme
```
### 3. Make Your Changes
Follow the existing structure and style:
- YAML files go in the relevant domain folder
- README updates should include both explanation and example
- Practice exam questions should include a hidden `<details>` solution block
- Test all YAML files against a real cluster before submitting
### 4. Commit and Push
```bash
git add .
git commit -m "feat: add StatefulSet practice exercise to domain 2"
git push origin feature/add-statefulset-exercise
```
### 5. Open a Pull Request
Go to GitHub and open a PR against the `main` branch. Include:
- What you changed and why
- How you tested it (e.g., `kubectl apply -f ...` on minikube)
---
## 📐 Style Guide
### YAML Files
- Use `# comment` to explain non-ob### 1. Fork &- Include res```bash
# Fork viait# Forke git clone ht- Use realistic cd ckad-exam-prep
```
### 2. Create a Branch
```bash
git c### ```
### 2- Use pro##r ```bash
git checkout  fgit chti# or
git checkout -b fix/- Include code blocks wigitla```
### 3. Make Your Changes
Follow th)
- AdFollow the existing str??- YAML files go in the relevant domain rs-### Commit Messages
Follow [Conventional Comm- Practice exam questions should include a hidden `<detailsew- Test all YAML files against a real cluster before sub- `docs:` — document### 4. Commit and Push
```bash
git add .
git commit ---
## ✅ PR Checklist
Before subgit adg:git commAMgit push origin feature/add-statefulset-exercise
```
### 5. Open - [```
### 5. Open a Pull Requ- [ ] No sensitive dat##(cGo to GitHub and open a Pde- What you changed and why
- How you tested - [ ] README update- How you tested it (---
##---
## 📐 Style Guide
### YAML Files
- Use `# comment` to eth##an### YAML Files
- Uep- Use `# commou# Fork viait# Forke git clone ht- Use realistic cd ckad-exam-prep
`python3 -c "
content = '''# 🤝 Contributing to CKAD Exam Prep
Thank you for your interest in contributing! This guide is for the whole CKAD community.
---
## 📋 Ways to Contribute
- 🐛 **Fix bugs** — incorrect commands, wrong YAML fields, typos
- ➕ **Add content** — new practice questions, exercises, examples
- 📝 **Improve docs** — clearer explanations, better examples
- ⭐ **Star the repo** — helps others discover this resource!
---
## 🛠 How to Contribute
### 1. Fork and Clone
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/ckad-exam-prep.git
cd ckad-exam-prep
\`\`\`
### 2. Create a Branch
\`\`\`bash
git checkout -b feature/add-statefulset-exercise
\`\`\`
### 3. Make Your Changes
- YAML files go in the relevant domain folder
- Include both explanation and working example
- Practice exam questions must have a hidden solution block
- Test all YAML files against a real cluster
### 4. Commit and Push
\`\`\`bash
git add .
git commit -m \"feat: add StatefulSet practice exercise\"
git push origin feature/add-statefulset-exercise
\`\`\`
### 5. Open a Pull Request
Open a PR against the \`main\` branch. Include what you changed and how you tested it.
---
## 📐 Style Guide
### YAML Files
- Use comments to explain non-obvious fields
- Include resource requests/limits where appropriate
- Test against Kubernetes v1.28+
### Commit Messages
- \`feat:\` — new content or feature
- \`fix:\` — bug fix or correction
- \`docs:\` — documentation only changes
---
## ✅ PR Checklist
- [ ] YAML files validated with \`kubectl apply --dry-run=client -f FILE\`
- [ ] All commands tested
- [ ] No sensitive data inclgit c- [ ] \`\`\`
### 3. Make Your Changes
- ---
## 💬 Que### 3s?-Open a [GitHub Issue](ht- Include both explanation and working exampep- Practice'''
with open('/Users/dasunc/WebstormProjects/CKAD/CONTRIBUTING.md', 'w') as f:
    f.write(conte### print('Done')
"
python3 /tmp/write_files.py 2>&1 || python3 << 'PYEOF'
import os
files = {
    "/Users/dasunc/WebstormProjects/CKAD/CONTRIBUTING.md": """# Contributing to CKAD Exam Prep
Thank you for contributing! Your help makes this resource better for the whole CKAD community.
## Ways to Contribute
- Fix bugs: incorrect commands, wrong YAML fields, typos
- Add content: new practice questions, exercises, examples
- Improve docs: clearer explanations, better examples
- Star the repo to help others discover it!
## How to Contribute
1. Fork and clone the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes and test YAML files against a real cluster
4. Commit: `git commit -m "feat: add your feature"`
5. Push and open a PR against `main`
## Style Guide
- YAML: use comments, include resource limits, test on K8s v1.28+
- Commits: use conventional commits (feat:, fix:, docs:)
- Solutions: hide in `<details><summary>Solution</summary>` blocks
## PR Checklist
- YAML files validated with `kubectl apply --dry-run=client`
- All commands tested
- No sensitive data included
- README updated if new files added
""",
    "/Users/dasunc/WebstormProjects/CKAD/LICENSE": """MIT License
Copyright (c) 2026 Dasun Chathuranga (ChathurangaVKD)
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software withou- Star the repo to help others discover it!
## How tts## How to Contribute
1. Fork and clone thetr1. Fork and clone tan2. Create a branch: `git of3. Make changes and test YAML files against a real clfurnis4. Commit: `git commit -m "feat: add your feature"`The abov5. Push and open a PR against `main`
## Style Guidl ## Style Guide
- YAcopies or substant- YAML: use cof- Commits: use conventional commits (feat:, fix:, docs:)
- SolutY - Solutions: hide in `<dIMPLIED, INCLUDING BUT NOT LIMITE## PR Checklist
- YAML files validated wFITNESS FOR A PARTICULAR PU- YAML files vNF- All commands tested
- No sensitAUTHORS OR COPYRIGHT HOLDERS- No sensitive data LA- README updated if nLIABILIT""",
    "/Users/dasunc/WebstormPrT,   RTCopyright (c) 2026 Dasun ChatOUT OF OR IN CONNECTION WITH THE SOFTPermission is hereby granted, free of chaSOFTWARE.
"""of this software and associated documen    with open(path, 'w') as f:
       in the Software withou- Star the repo to help others dprintf '%s' '# Contributing to CKAD Exam Prep
Thank you for contributing! Your help makes this better for the whole community.
## Ways to Contribute
- Fix bugs: incorrect commands, wrong YAML, typos
- Add content: new practice questions, exercises, examples
- Improve docs: clearer explanations
- Star the repo to help others find it!
## How to Contribute
1. Fork and clone the repo
2. Create a branch: git checkout -b feature/your-feature
3. Make your changes and test YAML against a real cluster
4. Commit with conventional commits: git commit -m "feat: add X"
5. Push and open a PR against main
## Style Guide
- YAML files: add comments, include resource limits, test on K8s v1.28+
- Commit format: feat:, fix:, docs:
- Practice solutions: wrap in details/summary HTML tags
## PR Checklist
- [ ] YAML validated with kubectl apply --dry-run=client
- [ ] All commands tested
- [ ] No sensitive data included
- [ ] README updated if new files added
' > /Users/dasunc/WebstormProjects/CKAD/CONTRIBUTING.md && echo "OK"
echo "reset"
PYEOF
