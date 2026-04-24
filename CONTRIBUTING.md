# 🤝 Contributing to CKAD Exam Prep

Thank you for your interest in contributing! Every improvement helps the whole CKAD community.

---

## 📋 Ways to Contribute

- 🐛 **Fix bugs** — incorrect commands, wrong YAML fields, typos
- ➕ **Add content** — new practice questions, exercises, examples
- 📝 **Improve docs** — clearer explanations, better examples
- 🌍 **Translate** — help make this accessible in more languages
- ⭐ **Star the repo** — helps others discover this resource!

---

## 🛠 How to Contribute

### 1. Fork and Clone

```bash
# Fork via GitHub UI, then clone your fork:
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
- README updates should include both explanation and working example
- Practice exam questions must include a hidden `<details>` solution block
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

- Use `# comments` to explain non-obvious fields
- Include resource requests/limits where appropriate
- Use realistic, descriptive names (not `foo`, `bar`)
- Test against Kubernetes v1.28+

### Markdown

- Use proper heading hierarchy (H2 for sections, H3 for subsections)
- Include code blocks with language hints (` ```bash `, ` ```yaml `)
- Wrap exercise answers in `<details><summary>💡 Solution</summary>` blocks

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new content or feature
- `fix:` — bug fix or correction
- `docs:` — documentation only changes
- `chore:` — maintenance tasks

---

## ✅ PR Checklist

Before submitting your PR:

- [ ] YAML files are valid (`kubectl apply --dry-run=client -f FILE`)
- [ ] All commands have been tested on a real cluster
- [ ] No sensitive data (credentials, tokens) included
- [ ] Follows existing naming conventions
- [ ] README updated if new files were added

---

## 💬 Questions?

Open a [GitHub Issue](https://github.com/ChathurangaVKD/ckad-exam-prep/issues) with your question.
