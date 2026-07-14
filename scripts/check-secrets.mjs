import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter((file) => file && !file.startsWith("dist/") && !file.endsWith(".lock") && !file.endsWith("package-lock.json"));
const rules = [
  { name: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { name: "Cloudflare token", pattern: /cf(?:ut|api)_[A-Za-z0-9_-]{20,}/i },
  { name: "private key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "Supabase service key", pattern: /SUPABASE_SERVICE_ROLE_KEY\s*[=:]\s*["'][^"']{20,}["']/i },
];

const findings = files.flatMap((file) => {
  const content = readFileSync(file, "utf8");
  return rules.filter((rule) => rule.pattern.test(content)).map((rule) => `${rule.name} em ${file}`);
});

if (findings.length) {
  console.error(`Possível segredo adicionado: ${[...new Set(findings)].join(", ")}`);
  process.exit(1);
}
