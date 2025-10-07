// Clean password strength script
const pwd = document.getElementById("password");
const bar = document.getElementById("bar");
const strengthText = document.getElementById("strength");
const entropyTag = document.getElementById("entropy");
const lenTag = document.getElementById("len");
const feedback = document.getElementById("feedback");
const toggle = document.getElementById("toggle");

// ARIA / initial attributes
if (bar) {
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", "0");
}

if (toggle) toggle.setAttribute("aria-pressed", "false");

toggle &&
    toggle.addEventListener("click", () => {
        pwd.type = pwd.type === "password" ? "text" : "password";
        const shown = pwd.type !== "password";
        toggle.textContent = shown ? "Hide" : "Show";
        toggle.setAttribute("aria-pressed", shown ? "true" : "false");
    });

pwd &&
    pwd.addEventListener("input", () => {
        const val = pwd.value;
        const result = checkStrength(val);
        updateUI(result);
    });

function checkStrength(pwd) {
    const result = {
        length: pwd.length,
        upper: /[A-Z]/.test(pwd),
        lower: /[a-z]/.test(pwd),
        digit: /\d/.test(pwd),
        symbol: /[^A-Za-z0-9]/.test(pwd),
        repeats: /(.)\1{2,}/.test(pwd),
        sequences: /(abc|123|qwe|xyz|password)/i.test(pwd),
        blacklist: ["password", "123456", "qwerty", "letmein"].includes(
            pwd.toLowerCase()
        ),
    };

    // Entropy estimate
    let charset = 0;
    if (result.lower) charset += 26;
    if (result.upper) charset += 26;
    if (result.digit) charset += 10;
    if (result.symbol) charset += 20;
    const entropy = Math.round(
        Math.log2(Math.pow(charset || 1, pwd.length)) || 0
    );

    // Suggestions
    const s = [];
    if (result.length < 12)
        s.push("Make it longer (12+ characters recommended).");
    if (!result.upper) s.push("Add uppercase letters.");
    if (!result.lower) s.push("Add lowercase letters.");
    if (!result.digit) s.push("Add digits.");
    if (!result.symbol) s.push("Add symbols (e.g. !@#$%).");
    if (result.repeats) s.push("Avoid repeated characters (aaaa or 1111).");
    if (result.sequences) s.push("Avoid simple sequences (abcd, 1234).");
    if (result.blacklist) s.push("Avoid common passwords.");
    if (s.length === 0) s.push("Excellent! Your password is strong.");
    result.suggestions = s;
    result.entropy = entropy;
    return result;
}

function updateUI(r) {
    let score = 0;
    if (r.length >= 8) score++;
    if (r.upper) score++;
    if (r.digit) score++;
    if (r.symbol) score++;
    if (!r.repeats && !r.sequences && !r.blacklist) score++;

    const labels = ["Weak 😟", "Fair 😐", "Good 🙂", "Strong 💪"];
    const widths = [20, 45, 75, 100];
    const idx = Math.max(0, Math.min(score - 1, 3));

    // update bar classes for gradients
    if (bar) {
        bar.classList.remove("very-weak", "weak", "good", "strong");
        if (idx <= 0) bar.classList.add("very-weak");
        else if (idx === 1) bar.classList.add("weak");
        else if (idx === 2) bar.classList.add("good");
        else bar.classList.add("strong");

        const w = widths[idx] || 8;
        bar.style.width = w + "%";
        bar.setAttribute("aria-valuenow", String(w));
    }

    strengthText && (strengthText.textContent = labels[idx] || labels[0]);
    entropyTag && (entropyTag.textContent = `Entropy: ${r.entropy} bits`);
    lenTag && (lenTag.textContent = `Len: ${r.length}`);
    feedback &&
        (feedback.innerHTML = r.suggestions.map((s) => `<li>${s}</li>`).join(""));
}
