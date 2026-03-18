# proj-boost 🚀

> A CLI toolkit to analyze, clean, and score the health of any JavaScript/TypeScript project — in seconds.
<img width="1682" height="1220" alt="image" src="https://github.com/user-attachments/assets/49de6155-e7c6-4705-82ff-73988f9cea43" />



---

## 📦 Installation
```bash
npm install -g proj-boost
```

---

## ⚡ Quick Start

Navigate to any JavaScript/TypeScript project and run:
```bash
boost
```

This runs all checks and shows a full health report.

---

## 🛠️ Commands

| Command | Description |
|---|---|
| `boost` | Run everything |
| `boost scan` | Scan for code quality issues |
| `boost clean` | Remove temp files and empty folders |
| `boost deps` | Audit dependencies |
| `boost score` | Show project health score |
| `boost security` | Run security checks |

---

## 🔍 boost scan

Scans your project for common code quality issues.
```bash
boost scan
```

**Checks:**
- **Unused Files** — files not imported from your entry point
- **Large Files** — files above 500kb (configurable)
- **Duplicate Code** — repeated code blocks across files
- **Unused Assets** — images/fonts not referenced in code
- **Console Logs** — leftover `console.log` statements

**Example output:**
```
🔍 boost scan — Project Analysis

📋 Scan Results
⚠ Unused Files      — 2 unused file(s) found
   → src/helpers/oldUtil.js
   → src/components/TestModal.jsx
✔ Large Files       — No large files found
✔ Duplicate Code    — No duplicate code found
✔ Unused Assets     — No unused assets found
⚠ Console Logs      — 5 console.log(s) found
   → src/App.jsx:12  console.log("debug")
```

---

## 🧹 boost clean

Removes temporary files and empty folders from your project.
```bash
boost clean
```

**Removes:**
- Temporary files (`.tmp`, `.cache`, `.DS_Store`, `Thumbs.db`)
- Empty folders

---

## 📦 boost deps

Audits your project dependencies.
```bash
boost deps
```

**Checks:**
- **Unused packages** — packages in `package.json` not used in code
- **Heavy packages** — packages with large install size (over 100KB gzip)
- **Lighter alternatives** — suggests smaller replacements

**Example output:**
```
Dependency analysis

⚠ Unused packages     — 2 unused package(s) found
   → lodash
   → moment
⚠ Heavy packages      — 1 package(s) over 100 KB gzip
   → eslint  347.2 KB gzip / 1309.1 KB raw
⚠ Lighter alternatives — 1 package(s) have lighter alternatives
   → chalk → picocolors or kleur
      ~10x smaller with near-identical API
```

---

## 📊 boost score

Shows an overall health score for your project out of 100 with a letter grade.
```bash
boost score
```

**Categories:**
| Category | Weight |
|---|---|
| Code Quality | 40 pts |
| Security | 30 pts |
| Dependencies | 20 pts |
| Cleanliness | 10 pts |

**Example output:**
```
Project health score
✔ All checks complete

  79/100    Grade C

  ████████████████░░░░░░░░   65%  Code Quality    26/40 pts
  ████████████████████████  100%  Security        30/30 pts
  ████████████████░░░░░░░░   65%  Dependencies    13/20 pts
  ████████████████████████  100%  Cleanliness     10/10 pts

Check breakdown

  ⚠  Unused Files       — 2 unused file(s) found       [8/10]
  ✔  Large Files        — No large files found          [8/8]
  ✔  Duplicate Code     — No duplicate code found       [10/10]
  ✔  Unused Assets      — No unused assets found        [6/6]
  ⚠  Console Logs       — 5 console.log(s) found        [1/6]
  ✔  .env Files         — No committed .env files       [12/12]
  ✔  Hardcoded Secrets  — No hardcoded secrets found    [12/12]
  ✔  npm Vulnerabilities — No vulnerabilities found     [6/6]
```

---

## 🔒 boost security

Checks your project for security issues.
```bash
boost security
```

**Checks:**
- **.env files committed** — detects `.env` files tracked by git
- **Hardcoded secrets** — scans for API keys, tokens, passwords in code
- **npm vulnerabilities** — wraps `npm audit` and parses results

---

## ⚙️ Configuration

Create a `boost.config.js` in your project root to customize behavior:
```js
export default {
  scan: {
    largeFileThreshold: '500kb',       // flag files above this size
    ignore: ['dist/', 'node_modules/'], // folders to skip
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue'],
  },
  clean: {
    tempPatterns: ['**/*.tmp', '**/.DS_Store'],
  },
  deps: {
    checkBundleSize: true,
  },
  security: {
    scanPatterns: ['**/*.js', '**/*.ts'],
  }
}
```

---

## ✅ Supported Project Types

- React / Next.js
- Node.js / Express
- Vue / Nuxt
- Plain JavaScript / TypeScript

---

## 📋 Requirements

- Node.js `>= 18.0.0`
- npm `>= 8.0.0`

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.
```bash
git clone https://github.com/Bhumi-Garg/npm-boost.git
cd boost-cli
npm install
npm link
boost scan
```

---

## 📄 License

ISC © [Bhumi Garg](https://github.com/Bhumi-Garg)
