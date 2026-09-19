    /* =========================================================
   SCAMLENS — FRONTEND JAVASCRIPT
   Version 2.0
   Rule-Based Scam & Phishing Analyzer
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
   
       
       ELEMENTS
    ===================================================== */

    const messageInput = document.getElementById("messageInput");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const characterCount = document.getElementById("characterCount");
    const resultSection = document.getElementById("resultSection");

    const inputTypes = document.querySelectorAll(".input-type");
    const navLinks = document.querySelectorAll(".nav-link");
    const statNumbers = document.querySelectorAll(".stat-number");

    let currentInputType = "message";

    /* =====================================================
       STATISTICS
    ===================================================== */

    let statistics = {
        total: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    async function loadScanHistory() {

    try {

        const response = await fetch(
            "https://scamlens-backend-0w5v.onrender.com/api/scan"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch scan history");
        }

        const data = await response.json();

        const scans = data.scans;

        console.log("Scan history loaded:", scans);
        displayScanHistory(scans);
        updateDetectionActivity(scans);


        // Calculate statistics from MongoDB data

        statistics.total = scans.length;

        statistics.high = scans.filter(
            scan => scan.riskLevel === "HIGH"
        ).length;

        statistics.medium = scans.filter(
            scan => scan.riskLevel === "MEDIUM"
        ).length;

        statistics.low = scans.filter(
            scan => scan.riskLevel === "LOW"
        ).length;


// =================================================
// SCAM CATEGORY INTELLIGENCE — DYNAMIC DATA
// =================================================

// Categories shown in the dashboard

const scamCategories = [

    "Banking / Phishing Scam",

    "Job / Internship Scam",

    "Prize / Lottery Scam",

    "Account Takeover / Phishing",

    "Payment Scam",

    "General Suspicious Activity"

];


// Create count object

const categoryCounts = {};

scamCategories.forEach(category => {

    categoryCounts[category] = 0;

});


// Count scans from MongoDB

scans.forEach(scan => {

    const category =
        scan.scamCategory ||
        "General Suspicious Activity";

    if (categoryCounts[category] !== undefined) {

        categoryCounts[category]++;

    }

});


// Find highest count

const maxCategoryCount =
    Math.max(
        ...Object.values(categoryCounts),
        1
    );


// Get category rows

const categoryRows =
    document.querySelectorAll(
        "#scamCategoryList .scam-category-row"
    );


// Update every category row

categoryRows.forEach(row => {

    const categoryName =
        row.querySelector(
            ".scam-category-info strong"
        )?.textContent.trim();

    const count =
        categoryCounts[categoryName] || 0;


    // Update count on right

    const countElement =
        row.querySelector(
            ".scam-category-count"
        );

    if (countElement) {

        countElement.textContent =
            count;

    }


    // Update "X scans"

    const scanText =
        row.querySelector(
            ".scam-category-info div span"
        );

    if (scanText) {

        scanText.textContent =
            `${count} scans`;

    }


    // Calculate relative percentage

    const percentage =
        (count / maxCategoryCount) * 100;


    // Remove old progress bar if it exists

    const oldProgress =
        row.querySelector(
            ".scam-category-progress"
        );

    if (oldProgress) {

        oldProgress.remove();

    }


    // Create progress container

    const progress =
        document.createElement("div");

    progress.className =
        "scam-category-progress";


    // Create progress bar

    const progressBar =
        document.createElement("div");

    progressBar.className =
        "scam-category-progress-bar";


    progressBar.style.width =
        `${percentage}%`;


    // Add bar to progress container

    progress.appendChild(progressBar);


    // Add progress bar to row

    row.appendChild(progress);


    // Store data

    row.dataset.count =
        count;

    row.dataset.percentage =
        percentage;

});



// Console check

console.log(
    "Scam category counts:",
    categoryCounts
);

console.log(
    "Most detected category count:",
    maxCategoryCount
);


        // Update existing dashboard

        updateDashboard();

        updateDashboardDistribution();


    } catch (error) {

        console.error(
            "Failed to load scan history:",
            error
        );

    }
}

function displayScanHistory(scans) {

    const historyList =
        document.getElementById("scanHistoryList");

    if (!historyList) return;


    // No scans yet

    if (!scans || scans.length === 0) {

        historyList.innerHTML = `
            <div class="history-empty">
                No scans yet.
            </div>
        `;

        return;
    }


    // Show latest scans first

    const recentScans =
        scans.slice(0, 7);


    historyList.innerHTML =
        recentScans.map((scan, index) => {

            const riskClass =
                scan.riskLevel.toLowerCase();

            const input =
                escapeHTML(scan.input || "No input");

            const score =
                Number(scan.riskScore) || 0;

            const type =
                escapeHTML(
                    scan.messageType || "MESSAGE"
                );

            return `

                <div
                    class="history-item"
                    data-scan-index="${index}"
                >

                    <div class="history-risk ${riskClass}">
                        <strong>${score}%</strong>

                        <span>
                            ${riskClass.toUpperCase()}
                        </span>
                    </div>


                    <div class="history-content">

                        <div class="history-type">
                            ${type}
                        </div>

                        <p>
                            ${input}
                        </p>

                    </div>

                </div>

            `;

        }).join("");


    // Make each history item clickable

    const historyItems =
        document.querySelectorAll(
            ".history-item"
        );

    historyItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        item.dataset.scanIndex
                    );

                const selectedScan =
                    recentScans[index];

                console.log(
                    "Selected scan:",
                    selectedScan
                );
                // Open scan details modal
openScanModal(selectedScan);

            }
        );

    });

}

function updateDetectionActivity(scans) {

    const dayCounts = {
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0
    };


    // Count scans for each day

    scans.forEach(scan => {

        const date = new Date(scan.createdAt);

        const day = date.toLocaleDateString(
            "en-US",
            { weekday: "short" }
        );

        if (dayCounts[day] !== undefined) {
            dayCounts[day]++;
        }
    });


    // Find the highest number of scans

    const maxCount =
        Math.max(...Object.values(dayCounts), 1);


    // Update chart bars

    const bars =
    document.querySelectorAll(
        ".chart-bars > div[data-day]"
    );

    console.log(
    [...bars].map(bar => ({
        day: bar.dataset.day,
        value: bar.dataset.value
    }))
);

    bars.forEach(bar => {

        const day =
            bar.dataset.day;

        const count =
            dayCounts[day] || 0;

        console.log(
    "Bar:",
    day,
    "Count:",
    count
);

        const height =
    count === 0
        ? 4
        : Math.max((count / maxCount) * 100, 8);

        bar.style.height =
            `${height}%`;

        bar.dataset.value =
            count;
    });


    console.log(
        "Detection activity:",
        dayCounts
    );
}


function openScanModal(scan) {

    const modal =
        document.getElementById("scanModal");

    if (!modal) return;


    document.getElementById(
        "modalRiskScore"
    ).textContent =
        `${Number(scan.riskScore) || 0}%`;

const modalRiskLevel =
    document.getElementById(
        "modalRiskLevel"
    );

modalRiskLevel.textContent =
    scan.riskLevel || "UNKNOWN";

modalRiskLevel.className =
    `modal-risk-${(
        scan.riskLevel || "unknown"
    ).toLowerCase()}`;


    document.getElementById(
        "modalScamCategory"
    ).textContent =
        scan.scamCategory ||
        "General Suspicious Activity";


    document.getElementById(
        "modalMessageType"
    ).textContent =
        scan.messageType || "MESSAGE";


    document.getElementById(
        "modalInput"
    ).textContent =
        scan.input || "No input";


    const reasonsContainer =
        document.getElementById(
            "modalReasons"
        );

    if (reasonsContainer) {

        const reasons =
            scan.reasons || [];

        if (reasons.length === 0) {

            reasonsContainer.innerHTML =
                `<div class="modal-reason">
                    No detection reasons available.
                </div>`;

        } else {
                reasonsContainer.innerHTML =
    reasons.map((reason, index) => `
        <div class="modal-reason">

            <span class="modal-reason-number">
                ${String(index + 1).padStart(2, "0")}
            </span>

            <span class="modal-reason-text">
                ${escapeHTML(reason)}
            </span>

        </div>
    `).join("");
        }
    }


    document.getElementById(
        "modalDate"
    ).textContent =
        scan.createdAt
            ? new Date(scan.createdAt)
                .toLocaleString()
            : "Unknown";


    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}


// =========================================================
// SCAN MODAL CLOSE
// =========================================================

const scanModal =
    document.getElementById("scanModal");

const scanModalClose =
    document.getElementById("scanModalClose");

const scanModalOverlay =
    document.querySelector(".scan-modal-overlay");


function closeScanModal() {

    if (scanModal) {
    scanModal.classList.remove("active");
    document.body.style.overflow = "";
}

}


// Close using X button

if (scanModalClose) {

    scanModalClose.addEventListener(
        "click",
        closeScanModal
    );

}


// Close by clicking outside the modal

if (scanModalOverlay) {

    scanModalOverlay.addEventListener(
        "click",
        closeScanModal
    );

}


// Close using Escape key

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {
            closeScanModal();
        }

    }
);



    /* =====================================================
       LOAD SAVED STATISTICS
    ===================================================== */

    try {
        const savedStats = localStorage.getItem("scamLensStats");

        if (savedStats) {
            const parsedStats = JSON.parse(savedStats);

            if (
                typeof parsedStats === "object" &&
                parsedStats !== null
            ) {
                statistics = {
                    total: Number(parsedStats.total) || 0,
                    high: Number(parsedStats.high) || 0,
                    medium: Number(parsedStats.medium) || 0,
                    low: Number(parsedStats.low) || 0
                };
            }
        }
    } catch (error) {
        console.warn("Could not load saved statistics.");
    }

    updateDashboard();


    /* =====================================================
       CHARACTER COUNTER
    ===================================================== */

    if (messageInput && characterCount) {

        messageInput.addEventListener("input", () => {

            const length = messageInput.value.length;

            characterCount.textContent =
                `${length.toLocaleString()} characters`;

            if (length > 4500) {
                characterCount.style.color = "#ff806f";
            }
            else if (length > 3500) {
                characterCount.style.color = "#e7bd64";
            }
            else {
                characterCount.style.color = "";
            }
        });
    }


    /* =====================================================
       INPUT TYPE TABS
    ===================================================== */

    inputTypes.forEach(button => {

        button.addEventListener("click", () => {

            inputTypes.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            currentInputType =
                button.dataset.type || "message";

            updatePlaceholder(currentInputType);

            if (messageInput) {
                messageInput.focus();
            }
        });
    });


    /* =====================================================
       PLACEHOLDER
    ===================================================== */

    function updatePlaceholder(type) {

        if (!messageInput) return;

        const placeholders = {

            message:
                "Paste a suspicious message here...",

            whatsapp:
                "Paste the suspicious WhatsApp message here...",

            email:
                "Paste the suspicious email content here...",

            job:
                "Paste the suspicious job or internship offer here...",

            url:
                "Paste a suspicious URL here..."
        };

        messageInput.placeholder =
            placeholders[type] || placeholders.message;
    }


    /* =====================================================
       CTRL + ENTER
    ===================================================== */

    if (messageInput) {

        messageInput.addEventListener("keydown", event => {

            if (
                event.ctrlKey &&
                event.key === "Enter"
            ) {
                event.preventDefault();
                analyze();
            }
        });
    }


    /* =====================================================
       ANALYZE BUTTON
    ===================================================== */

    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", analyze);
    }


    /* =====================================================
       MAIN ANALYSIS FUNCTION
    ===================================================== */

    async function analyze() {

        if (!messageInput) return;

        const text = messageInput.value.trim();

        if (!text) {
            showInputError();
            return;
        }

        if (analyzeBtn.disabled) return;

        analyzeBtn.disabled = true;
        analyzeBtn.classList.add("scanning");

        const originalButtonHTML =
            analyzeBtn.innerHTML;

        analyzeBtn.innerHTML = `
            <span class="button-symbol">◌</span>
            <span class="button-text">SCANNING...</span>
            <span class="button-arrow">→</span>
        `;
        try {

            // Run the existing ScamLens rule engine
            const analysis = analyzeText(text);
            
            // Send the result to our backend
            const response = await fetch(
                "https://scamlens-backend-0w5v.onrender.com/api/scan",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        input: analysis.text,
                        riskScore: analysis.score,
                        riskLevel: analysis.riskLevel,
                        messageType: analysis.inputType,
                        scamCategory: analysis.scamCategory,
                        reasons: analysis.detections.map(
                            detection => detection.title
                        )
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to save scan");
            }

   const data = await response.json();

analysis.aiAnalysis = data.aiAnalysis;

if (data.scan && data.scan.scamCategory) {
    analysis.scamCategory =
        data.scan.scamCategory;
}

displayResult(analysis);

await loadScanHistory();

        } catch (error) {

            console.error(
                "Scan failed:",
                error
            );

            alert(
                "Could not connect to ScamLens backend. Make sure the server is running."
            );

        } finally {

            analyzeBtn.disabled = false;

            analyzeBtn.classList.remove(
                "scanning"
            );

            analyzeBtn.innerHTML =
                originalButtonHTML;
        }
    }


    /* =====================================================
       RULE-BASED ANALYSIS ENGINE
    ===================================================== */

    function analyzeText(text) {

        const lowerText =
            text.toLowerCase();

        let score = 0;

        const detections = [];
        const detectedTypes = new Set();
        let scamCategory = "General Suspicious Activity";


        /* =================================================
           RULE 1 — URGENCY
        ================================================= */

        const urgencyPatterns = [
            "urgent",
            "immediately",
            "act now",
            "act immediately",
            "hurry",
            "limited time",
            "expires today",
            "last chance",
            "do not delay",
            "within 24 hours",
            "within 12 hours",
            "right now",
            "as soon as possible"
        ];

        if (containsAny(lowerText, urgencyPatterns)) {

            score += 15;

            detections.push({
                type: "urgency",
                title: "Urgency / pressure",
                explanation:
                    "The message pressures you to act quickly instead of giving you time to verify the request.",
                severity: "medium"
            });
        }


        /* =================================================
           RULE 2 — PRIZE / REWARD
        ================================================= */

        const rewardPatterns = [
            "you won",
            "you have won",
            "congratulations",
            "winner",
            "cash prize",
            "prize",
            "reward",
            "lottery",
            "jackpot",
            "free money",
            
        ];

        if (containsAny(lowerText, rewardPatterns)) {

            score += 20;

            detections.push({
                type: "reward",
                title: "Unexpected reward / prize",
                explanation:
                    "Unexpected prizes and financial rewards are commonly used to attract victims and encourage them to click or provide information.",
                severity: "high"
            });
        }


        /* =================================================
           RULE 3 — OTP
        ================================================= */

        const otpPatterns = [
            "otp",
            "one time password",
            "verification code",
            "security code",
            "login code",
            "authentication code"
        ];

        if (containsAny(lowerText, otpPatterns)) {

            score += 25;

            detections.push({
                type: "otp",
                title: "OTP / verification request",
                explanation:
                    "Requests to disclose an OTP or authentication code are a major warning sign.",
                severity: "high"
            });
        }


        /* =================================================
           RULE 4 — PASSWORD
        ================================================= */

        const passwordPatterns = [
            "password",
            "passcode",
            "login credentials",
            "username and password",
            "account password"
        ];

        if (containsAny(lowerText, passwordPatterns)) {

            score += 25;

            detections.push({
                type: "password",
                title: "Password / credential request",
                explanation:
                    "Requests for passwords or login credentials can indicate an attempt to take control of an account.",
                severity: "high"
            });
        }


        /* =================================================
           RULE 5 — BANKING INFORMATION
        ================================================= */

        const bankingPatterns = [
            "bank account",
            "account number",
            "bank details",
            "credit card",
            "debit card",
            "card number",
            "cvv",
            "upi pin",
            "upi id",
            "ifsc",
            "banking details"
        ];

        if (containsAny(lowerText, bankingPatterns)) {

            score += 25;

            detections.push({
                type: "banking",
                title: "Financial information request",
                explanation:
                    "The message asks for sensitive financial information that should not normally be shared through an unsolicited message.",
                severity: "high"
            });
        }


        /* =================================================
           RULE 6 — LINKS
        ================================================= */

        const urlRegex =
            /(?:https?:\/\/|www\.|bit\.ly|tinyurl\.com|t\.co\/|is\.gd\/|goo\.gl\/)/i;

        if (urlRegex.test(text)) {

            score += 30;

            detections.push({
                type: "link",
                title: "Suspicious link detected",
                explanation:
                    "The message contains a web link. Links in unexpected messages can redirect users to fake login pages or malicious websites.",
                severity: "high"
            });
        }


        /* =================================================
           RULE 7 — ACCOUNT VERIFICATION
        ================================================= */

        const verificationPatterns = [
            "verify your account",
            "verify account",
            "account verification",
            "confirm your account",
            "confirm account",
            "verify identity",
            "identity verification",
            "update your account",
            "update account",
            "security verification"
        ];

        if (containsAny(lowerText, verificationPatterns)) {

            score += 20;

            detections.push({
                type: "verification",
                title: "Account verification request",
                explanation:
                    "Scammers often imitate banks, platforms and services by claiming that an account needs immediate verification.",
                severity: "high"
            });
        }


        /* =================================================
           RULE 8 — THREATS
        ================================================= */

        const threatPatterns = [
            "account will be blocked",
            "account will be suspended",
            "account suspended",
            "account blocked",
            "legal action",
            "police complaint",
            "police case",
            "your account will close",
            "service will be terminated",
            "you will be arrested",
            "arrest warrant"
        ];

        if (containsAny(lowerText, threatPatterns)) {

            score += 20;

            detections.push({
                type: "threat",
                title: "Threat / account warning",
                explanation:
                    "Threatening consequences can be used to create fear and force the recipient into making a rushed decision.",
                severity: "high"
            });
        }


        /* =================================================
           RULE 9 — UNREALISTIC OFFERS
        ================================================= */

        const unrealisticPatterns = [
            "guaranteed income",
            "guaranteed profit",
            "earn ₹",
            "earn rs",
            "make money fast",
            "get rich",
            "double your money",
            "100% profit",
            "risk free",
            "no investment",
            "easy money",
            "work from home and earn"
        ];

        if (containsAny(lowerText, unrealisticPatterns)) {

            score += 20;

            detections.push({
                type: "unrealistic",
                title: "Too-good-to-be-true offer",
                explanation:
                    "Promises of unusually easy money or guaranteed returns are common warning signs of fraudulent offers.",
                severity: "high"
            });
        }


        /* =================================================
           RULE 10 — JOB / INTERNSHIP
        ================================================= */

        const jobPatterns = [
            "job offer",
            "job opportunity",
            "internship",
            "work from home",
            "hiring immediately",
            "selected for the job",
            "selected for internship",
            "registration fee",
            "training fee",
            "processing fee",
            "pay to apply",
            "pay registration",
            "joining fee"
        ];

        if (
            currentInputType === "job" ||
            containsAny(lowerText, jobPatterns)
        ) {

            score += 15;

            detections.push({
                type: "job",
                title: "Potentially suspicious job offer",
                explanation:
                    "Unsolicited job offers involving fees, guaranteed selection or unusual payment requests deserve careful verification.",
                severity: "medium"
            });
        }


        /* =================================================
           RULE 11 — PAYMENT REQUEST
        ================================================= */

        const paymentPatterns = [
            "send money",
            "transfer money",
            "make payment",
            "pay now",
            "pay immediately",
            "send payment",
            "deposit money",
            "advance payment",
            "processing fee",
            "registration fee",
            "claim fee"
        ];

        if (containsAny(lowerText, paymentPatterns)) {

            score += 20;

            detections.push({
                type: "payment",
                title: "Payment request",
                explanation:
                    "An unsolicited request for money is a significant warning sign, especially when combined with urgency or rewards.",
                severity: "high"
            });
        }


        /* =================================================
           BONUS — MULTIPLE WARNING SIGNS
        ================================================= */

        /* =================================================
   BONUS — MULTIPLE WARNING SIGNS
================================================= */

if (detections.length >= 3) {
    score += 10;
}


/* =================================================
   BONUS — DANGEROUS COMBINATIONS
================================================= */

// OTP + Link
if (
    lowerText.includes("otp") &&
    urlRegex.test(text)
) {
    score += 15;

    detections.push({
        type: "combination",
        title: "OTP request combined with a link",
        explanation:
            "A message asking for an OTP while directing you to a link is a strong phishing warning sign.",
        severity: "high"
    });
}


// Urgency + Link
if (
    containsAny(lowerText, urgencyPatterns) &&
    urlRegex.test(text)
) {
    score += 10;

    detections.push({
        type: "combination",
        title: "Urgency combined with a link",
        explanation:
            "Urgent instructions combined with a link can pressure users into visiting a potentially unsafe website.",
        severity: "high"
    });
}


// Reward + Payment
if (
    containsAny(lowerText, rewardPatterns) &&
    containsAny(lowerText, paymentPatterns)
) {
    score += 15;

    detections.push({
        type: "combination",
        title: "Reward combined with payment request",
        explanation:
            "Scammers may promise a reward and then ask the victim to pay a fee to receive it.",
        severity: "high"
    });
}


        /* =================================================
           URL ANALYSIS
        ================================================= */

        if (currentInputType === "url") {
           score += analyzeURL(text, detections);
        }

console.log("CATEGORY DEBUG:", {
    text: text,
    lowerText: lowerText,
    hasSignIn: lowerText.includes("sign-in attempt"),
    hasDevice: lowerText.includes("unrecognized device"),
    hasConfirm: lowerText.includes("confirm"),
    hasAccountInfo: lowerText.includes("account information"),
    hasCashBenefit: lowerText.includes("cash benefit"),
    hasCustomerAppreciation: lowerText.includes("customer appreciation"),
    hasClaim: lowerText.includes("claim"),
    hasVerification: lowerText.includes("verification")
});

 /* =================================================
   FEATURE 3A — SCAM CATEGORY DETECTION
================================================= */

if (
    (
        lowerText.includes("job") ||
        lowerText.includes("internship") ||
        lowerText.includes("intern") ||
        lowerText.includes("software internship") ||
        lowerText.includes("work from home") ||
        lowerText.includes("work-from-home") ||
        lowerText.includes("career") ||
        lowerText.includes("employment") ||
        lowerText.includes("vacancy") ||
        lowerText.includes("hiring") ||
        lowerText.includes("recruitment") ||
        lowerText.includes("stipend") ||
        lowerText.includes("joining date")
    )
    &&
    (
        lowerText.includes("fee") ||
        lowerText.includes("pay") ||
        lowerText.includes("payment") ||
        lowerText.includes("registration") ||
        lowerText.includes("deposit") ||
        lowerText.includes("guaranteed") ||
        lowerText.includes("onboarding") ||
        lowerText.includes("processing")
    )
) {

    scamCategory = "Job / Internship Scam";

}

else if (
    (
        lowerText.includes("bank") ||
        lowerText.includes("banking") ||
        lowerText.includes("kyc") ||
        lowerText.includes("account access") ||
        lowerText.includes("financial")
    )
    &&
    (
        lowerText.includes("verify") ||
        lowerText.includes("verification") ||
        lowerText.includes("kyc") ||
        lowerText.includes("restricted") ||
        lowerText.includes("suspension") ||
        lowerText.includes("security review")
    )
) {

    scamCategory = "Banking / Phishing Scam";

}

else if (
    (
        lowerText.includes("new login") ||
        lowerText.includes("new sign-in") ||
        lowerText.includes("sign-in attempt") ||
        lowerText.includes("login attempt") ||
        lowerText.includes("unfamiliar device") ||
        lowerText.includes("unknown device") ||
        lowerText.includes("unrecognized device") ||
        lowerText.includes("device that isn't normally associated") ||
        lowerText.includes("suspicious login") ||
        lowerText.includes("unauthorized login") ||
        lowerText.includes("unauthorized access")
    )
    &&
    (
        lowerText.includes("verify") ||
        lowerText.includes("verification") ||
        lowerText.includes("confirm") ||
        lowerText.includes("secure") ||
        lowerText.includes("account information") ||
        lowerText.includes("prevent further access")
    )
) {

    scamCategory = "Account Takeover / Phishing";

}

else if (
    (
        lowerText.includes("won") ||
        lowerText.includes("winner") ||
        lowerText.includes("prize") ||
        lowerText.includes("reward") ||
        lowerText.includes("lottery") ||
        lowerText.includes("lucky draw") ||
        lowerText.includes("voucher") ||
        lowerText.includes("cash prize") ||
        lowerText.includes("cash benefit") ||
        lowerText.includes("customer appreciation") ||
        lowerText.includes("selected for") ||
        lowerText.includes("benefit for your account")
    )
    &&
    (
        lowerText.includes("claim") ||
        lowerText.includes("processing") ||
        lowerText.includes("fee") ||
        lowerText.includes("payment") ||
        lowerText.includes("contact") ||
        lowerText.includes("verification") ||
        lowerText.includes("processing formalities")
    )
) {

    scamCategory = "Prize / Lottery Scam";

}

else if (
    (
        lowerText.includes("payment") ||
        lowerText.includes("upi") ||
        lowerText.includes("refund") ||
        lowerText.includes("transaction") ||
        lowerText.includes("transfer") ||
        lowerText.includes("pay")
    ) &&
    (
        lowerText.includes("verify") ||
        lowerText.includes("verification") ||
        lowerText.includes("details") ||
        lowerText.includes("pending") ||
        lowerText.includes("confirm") ||
        lowerText.includes("refund")
    )
) {

    scamCategory = "Payment Scam";
}

    

        /* =================================================
           CAP SCORE
        ================================================= */

        score = Math.min(100, score);


        /* =================================================
           CLASSIFICATION
        ================================================= */

        let riskLevel;

        if (score <= 30) {
            riskLevel = "LOW";
        }
        else if (score <= 60) {
            riskLevel = "MEDIUM";
        }
        else {
            riskLevel = "HIGH";
        }


        /* =================================================
           SAFE RESULT
        ================================================= */

        if (detections.length === 0) {

            detections.push({
                type: "none",
                title: "No major scam patterns detected",
                explanation:
                    "The analyzer did not find any warning patterns currently included in ScamLens. This does not guarantee that the content is safe.",
                severity: "low"
            });
        }


        return {
    score,
    riskLevel,
    detections,
    text,
    inputType: currentInputType,
    scamCategory,
    timestamp: new Date().toISOString()
};

    }
    /* =====================================================
       URL ANALYZER
    ===================================================== */

    function analyzeURL(text, detections) {
        let urlScore = 0;

        try {

            let urlText = text.trim();

            if (!/^https?:\/\//i.test(urlText)) {
                urlText = "https://" + urlText;
            }

            const url = new URL(urlText);

            const hostname =
                url.hostname.toLowerCase();


            /* IP ADDRESS */

            if (
                /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
                
            ) {
                urlScore += 15;

                detections.push({
                    type: "ip",
                    title: "IP address used as destination",
                    explanation:
    "This link uses a raw IP address instead of a recognizable domain name. Unexpected links using IP addresses can be harder to verify and may deserve extra caution.",
                    severity: "medium"
                });
            }


            /* URL SHORTENER */

            const shorteners = [
                "bit.ly",
                "tinyurl.com",
                "t.co",
                "is.gd",
                "cutt.ly",
                "shorturl.at"
            ];

            if (
                shorteners.some(
                    domain => hostname === domain ||
                        hostname.endsWith("." + domain)
                )
            ) {
                urlScore += 15;

                detections.push({
                    type: "shortener",
                    title: "URL shortener detected",
                    explanation:
    "This is a shortened URL, so the real destination is hidden. Avoid opening shortened links from unknown or unexpected senders unless you can verify where they lead.",
                    severity: "medium"
                });
            }


            /* COMPLEX DOMAIN */

            const parts =
                hostname.split(".");

            if (parts.length >= 5) {
                urlScore += 10;

                detections.push({
                    type: "subdomain",
                    title: "Unusually complex domain",
                    explanation:
    "This domain contains several subdomains, which can make the address harder to read and verify. Check the main domain carefully before trusting the link.",
                       severity: "medium"
                });
            }


            /* SUSPICIOUS DOMAIN WORDS */

            const suspiciousDomainWords = [
                "verify",
                "secure",
                "login",
                "account",
                "update",
                "claim",
                "bonus",
                "reward",
                "free",
                "wallet"
            ];

            const domainMatch =
                suspiciousDomainWords.some(
                    word => hostname.includes(word)
                );

            if (domainMatch) {
                urlScore += 20;

                detections.push({
                    type: "domain",
                    title: "Suspicious domain keywords",
                    explanation:
    "The domain contains words such as login, verify, secure, or account that may be used to make a link appear trustworthy. Check whether the main domain actually belongs to the claimed service.",
                        severity: "medium"
                });
            }
            /* =================================================
   BRAND IMPERSONATION
================================================= */

const trustedBrands = [
    "google",
    "microsoft",
    "apple",
    "amazon",
    "paypal",
    "paytm",
    "sbi",
    "hdfc",
    "icici",
    "axis",
    "flipkart"
];

const brandMatch =
    trustedBrands.find(
        brand =>
            hostname.includes(brand) &&
            !hostname.endsWith("." + brand + ".com") &&
            hostname !== brand + ".com"
    );

if (brandMatch) {

    urlScore += 25;

    detections.push({

        type: "brand-impersonation",

        title: "Possible brand impersonation",

       explanation:
    `The domain contains "${brandMatch}", but it does not appear to be the official brand domain. This may be an attempt to imitate a trusted service. Verify the website's main domain before entering passwords, OTPs, or payment information.`,

        severity: "high"

    });
}

/* =================================================
   SUSPICIOUS DOMAIN STRUCTURE
================================================= */

const suspiciousStructures = [
    ".com.",
    ".net.",
    ".org.",
    ".in.",
    ".co."
];

const structureMatch =
    suspiciousStructures.some(
        pattern => hostname.includes(pattern)
    );

if (structureMatch) {

    urlScore += 20;

    detections.push({

        type: "suspicious-structure",

        title: "Suspicious domain structure",

        explanation:
    "The domain contains another domain-like section before the actual ending. This structure can be used to make a suspicious website appear connected to a trusted brand. Check the final registered domain carefully.",

        severity: "high"

    });
}

/* =================================================
   DANGEROUS URL CHARACTERS
================================================= */

if (urlText.includes("@")) {

    urlScore += 20;

    detections.push({

        type: "at-symbol",

        title: "Suspicious @ symbol in URL",

        explanation:
    "The URL contains an @ symbol. In URLs, text before @ can be misleading because the actual destination is determined by the hostname after it. Treat unexpected links containing @ with caution.",

        severity: "high"

    });
}

const hyphenCount =
    (hostname.match(/-/g) || []).length;

console.log("URL DEBUG:", hostname, hyphenCount);

if (hyphenCount >= 3) {

    urlScore += 10;

    detections.push({

        type: "excessive-hyphens",

        title: "Excessive hyphens in domain",

        explanation:
    "The domain contains several hyphens, which can be used to create lookalike domains such as brand-login-security.com. Carefully check the actual domain owner before trusting the site.",

        severity: "medium"

    });
}


if (/%[0-9a-f]{2}/i.test(urlText)) {

    urlScore += 10;

    detections.push({

        type: "encoded-url",

        title: "Encoded characters detected",

        explanation:
    "The URL contains encoded characters that make parts of the address harder to read. This can make it more difficult to recognize where the link actually leads.",

        severity: "medium"

    });
}
            return urlScore;

        }
        catch (error) {

            detections.push({
                type: "invalid-url",
                title: "URL format could not be verified",
                explanation:
                    "The provided text does not appear to be a standard URL.",
                severity: "medium"
            });
            return 0;
        }
    }


    /* =====================================================
       CHECK PATTERNS
    ===================================================== */

    function containsAny(text, patterns) {

        return patterns.some(pattern =>
            text.includes(pattern)
        );
    }


    /* =====================================================
       DISPLAY RESULT
    ===================================================== */

    function displayResult(analysis) {

        if (!resultSection) return;
        const aiAnalysis = analysis.aiAnalysis || "";

        const resultColor =
            getRiskColor(analysis.riskLevel);

        const resultIcon =
            getRiskIcon(analysis.riskLevel);


         const uniqueDetections =
    analysis.detections.filter(
        (detection, index, array) =>
            index === array.findIndex(
                item => item.title === detection.title
            )
    );

const detectionHTML =
    uniqueDetections.map(detection => `

                <div class="detection-item">

                    <div class="detection-icon ${detection.severity}">
                        ${getDetectionIcon(detection.severity)}
                    </div>

                    <div class="detection-content">

                        <strong>
                            ${escapeHTML(detection.title)}
                        </strong>

                        <p>
                            ${escapeHTML(detection.explanation)}
                        </p>

                    </div>

                </div>

            `).join("");


        resultSection.innerHTML = `

            <div class="section-container">

                <div
                    class="analysis-result-card"
                    style="--risk-color:${resultColor}"
                >

                    <!-- RESULT HEADER -->

                    <div class="analysis-result-header">

                        <div>

                            <div class="section-kicker">
                                <span></span>
                                ANALYSIS COMPLETE
                            </div>

                            <h2>
                                Threat assessment
                            </h2>

                        </div>

                        <div class="result-type">
                            ${escapeHTML(
                                analysis.inputType.toUpperCase()
                            )}
                        </div>

                    </div>


                    <!-- RISK OVERVIEW -->

                    <div class="risk-overview">

                        <div class="risk-score-wrapper">

                            <div class="risk-ring">

                                <div class="risk-ring-inner">

                                    <strong>
                                        0
                                    </strong>

                                    <span>
                                        / 100
                                    </span>

                                </div>

                            </div>

                        </div>


                        <div class="risk-information">

                            <div
                                class="risk-badge"
                                style="color:${resultColor}"
                            >

                                <span>
                                    ${resultIcon}
                                </span>

                                ${analysis.riskLevel} RISK

                            </div>


                            <h3>
                                ${getRiskHeadline(
                                    analysis.riskLevel
                                )}
                            </h3>


                            <p>
                                ${getRiskDescription(
                                    analysis.riskLevel
                                )}
                            </p>

                        </div>

                    </div>

<!-- SCAM CATEGORY -->

<div class="scam-category-section">

    <div class="result-subheading">
        <span>
            SCAM CATEGORY
        </span>
    </div>

    <div class="scam-category">
        ${escapeHTML(
            analysis.scamCategory ||
            "General Suspicious Activity"
        )}
    </div>

    <div class="category-explanation">

        <strong>
            WHY THIS WAS FLAGGED
        </strong>

        <p>
            ${escapeHTML(
                getCategoryExplanation(analysis)
            )}
        </p>

    </div>

</div>

<!-- AI ANALYSIS -->

<div class="ai-analysis-section">

    <div class="result-subheading">
        <span>
            AI ANALYSIS
        </span>
    </div>

    <div class="ai-analysis-content">

        <div class="ai-analysis-row">
            <span>AI VERDICT</span>

            <strong id="aiVerdict">
                —
            </strong>
        </div>

        <div class="ai-analysis-reason">
            <span>WHY</span>

            <p id="aiReason">
                —
            </p>
        </div>

    </div>

</div>
                    <!-- DETECTIONS -->

                    <div class="detections-section">

                        <div class="result-subheading">

                            <span>
                                DETECTED PATTERNS
                            </span>

                            <strong>
                                ${uniqueDetections.length}
                            </strong>

                        </div>


                        <div class="detections-list">

                            ${detectionHTML}

                        </div>

                    </div>


                    <!-- RECOMMENDATION -->

                    <div class="recommendation">

                        <div class="recommendation-icon">
                            !
                        </div>

                        <div>

                            <strong>
                                What should you do?
                            </strong>

                            <p>
                                ${getRecommendation(
                                    analysis.riskLevel
                                )}
                            </p>

                        </div>

                    </div>


                    <!-- FOOTER -->

                    <div class="analysis-footer">

                        <span>
                            SCAMLENS RULE ENGINE v2.0
                        </span>

                        <span>
                            LOCAL ANALYSIS
                        </span>

                        <span>
                            ${new Date(
                                analysis.timestamp
                            ).toLocaleTimeString()}
                        </span>

                    </div>

                </div>

            </div>
        `;

       
/* AI ANALYSIS */

if (aiAnalysis) {

    const verdictMatch =
        aiAnalysis.match(/VERDICT:\s*(.+)/i);

    const reasonMatch =
        aiAnalysis.match(/REASON:\s*(.+)/i);

    document.getElementById("aiVerdict").textContent =
        verdictMatch
            ? verdictMatch[1].trim()
            : "AI analysis unavailable";

    document.getElementById("aiReason").textContent =
        reasonMatch
            ? reasonMatch[1].trim()
            : "Gemini AI is temporarily unavailable.";

} else {

    document.getElementById("aiVerdict").textContent =
        "AI temporarily unavailable";

    document.getElementById("aiReason").textContent =
        "The scan was completed using ScamLens's rule-based detection engine.";

}

        addResultStyles();


        /* SCROLL TO RESULT */

        setTimeout(() => {

            resultSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);


        /* ANIMATE SCORE */

        animateRiskScore(analysis.score);
    }


    /* =====================================================
       RISK COLOR
    ===================================================== */

    function getRiskColor(level) {

        if (level === "HIGH") {
            return "#ff806f";
        }

        if (level === "MEDIUM") {
            return "#e7bd64";
        }

        return "#64e2bd";
    }


    /* =====================================================
       RISK ICON
    ===================================================== */

    function getRiskIcon(level) {

        if (level === "HIGH") {
            return "!";
        }

        if (level === "MEDIUM") {
            return "!";
        }

        return "✓";
    }


    /* =====================================================
       DETECTION ICON
    ===================================================== */

    function getDetectionIcon(severity) {

        if (severity === "high") {
            return "!";
        }

        if (severity === "medium") {
            return "△";
        }

        return "✓";
    }


    /* =====================================================
       RISK HEADLINE
    ===================================================== */

    function getRiskHeadline(level) {

        if (level === "HIGH") {
            return "Strong scam indicators detected.";
        }

        if (level === "MEDIUM") {
            return "Several warning signs require attention.";
        }

        return "No major warning signs detected.";
    }


    /* =====================================================
       RISK DESCRIPTION
    ===================================================== */

    function getRiskDescription(level) {

        if (level === "HIGH") {

            return "This content contains multiple patterns commonly associated with scams or phishing attempts. Avoid clicking links or sharing sensitive information.";
        }

        if (level === "MEDIUM") {

            return "Some suspicious characteristics were detected. Verify the sender and request independently before taking action.";
        }

        return "The content does not strongly match the scam patterns currently detected by ScamLens. Still verify unexpected requests before trusting them.";
    }


    /* =====================================================
       RECOMMENDATION
    ===================================================== */

    function getRecommendation(level) {

        if (level === "HIGH") {

            return "Do not click suspicious links, send money, or share OTPs, passwords or banking information. Verify the sender through an official channel.";
        }

        if (level === "MEDIUM") {

            return "Pause before responding. Check the sender, verify the website or organization independently, and avoid sharing sensitive information.";
        }

        return "Remain cautious with unexpected messages. ScamLens found no major warning patterns, but automated analysis cannot guarantee safety.";
    }

    /* =====================================================
   CATEGORY EXPLANATION
===================================================== */
function getCategoryExplanation(analysis) {

    if (!analysis.detections || analysis.detections.length === 0) {
        return "No major scam indicators were detected in this input.";
    }

    return analysis.detections
        .slice(0, 3)
        .map(detection => detection.title)
        .join(" • ");
}

    /* =====================================================
       SCORE ANIMATION
    ===================================================== */

   function animateRiskScore(finalScore) {
    const scoreElement = document.querySelector(".risk-ring-inner strong");
    const riskRing = document.querySelector(".risk-ring");

    if (!scoreElement || !riskRing) return;

    let current = 0;
    const duration = 900;
    const startTime = performance.now();

    function update(time) {
        const progress = Math.min(
            (time - startTime) / duration,
            1
        );

        const eased = 1 - Math.pow(1 - progress, 3);

        current = Math.round(finalScore * eased);

        // Update number
        scoreElement.textContent = current;

        // Update circular progress
        const degrees = current * 3.6;

        riskRing.style.background = `
            conic-gradient(
                var(--risk-color) ${degrees}deg,
                rgba(255,255,255,.04) ${degrees}deg
            )
        `;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}
    /* =====================================================
       DASHBOARD COUNTERS
    ===================================================== */

    function updateDashboard() {

        if (!statNumbers.length) return;


        statNumbers.forEach(number => {

            const parent =
                number.closest(".stat-card");

            if (!parent) return;


            const label =
                parent.querySelector(".stat-top span");

            if (!label) return;


            const text =
                label.textContent
                    .trim()
                    .toUpperCase();


            let value = 0;


            if (text.includes("TOTAL")) {

                value = statistics.total;
            }

            else if (text.includes("HIGH")) {

                value = statistics.high;
            }

            else if (text.includes("LOW")) {

                value = statistics.low;
            }

            else if (
                text.includes("DETECTION RULES")
            ) {

                value = 11;
            }


            number.textContent =
                value.toLocaleString();

        });


        updateDashboardDistribution();
    }


    /* =====================================================
   DASHBOARD DISTRIBUTION
===================================================== */

function updateDashboardDistribution() {

    const total =
        statistics.total;


    const legend =
        document.querySelectorAll(
            ".legend > div"
        );


    const donut =
        document.querySelector(
            ".donut-chart"
        );


    if (legend.length >= 3) {

        const lowPercent =
            total
                ? Math.round(
                    statistics.low /
                    total *
                    100
                )
                : 0;


        const mediumPercent =
            total
                ? Math.round(
                    statistics.medium /
                    total *
                    100
                )
                : 0;


        const highPercent =
            total
                ? Math.round(
                    statistics.high /
                    total *
                    100
                )
                : 0;


        const values = [
            lowPercent,
            mediumPercent,
            highPercent
        ];


        /* =========================================
           UPDATE LEGEND
        ========================================= */

        legend.forEach((item, index) => {

            const strong =
                item.querySelector("strong");

            if (strong) {

                strong.textContent =
                    `${values[index]}%`;

            }

        });


        /* =========================================
           UPDATE DONUT
        ========================================= */

        if (donut) {

            const mediumEnd =
                lowPercent +
                mediumPercent;


            donut.style.background = `
                conic-gradient(
                    #5ee7d7 0 ${lowPercent}%,
                    #27b8b2 ${lowPercent}% ${mediumEnd}%,
                    #087f82 ${mediumEnd}% 100%
                )
            `;

        }
        /* =========================================
   UPDATE DONUT TOOLTIP
========================================= */

const donutTooltip =
    document.querySelector(
        ".donut-tooltip"
    );

if (donutTooltip) {

    const tooltipTitle =
        donutTooltip.querySelector("strong");

    const tooltipPercentage =
        donutTooltip.querySelector("span");

    if (tooltipTitle && tooltipPercentage) {

        tooltipTitle.textContent =
            "Low Risk";

        tooltipPercentage.textContent =
            `${lowPercent}%`;

    }
}

    }


    /* =============================================
       UPDATE TOTAL
    ============================================= */

    const donutInner =
        document.querySelector(
            ".donut-inner strong"
        );


    if (donutInner) {

        donutInner.textContent =
            total || "—";

    }

}

/* =====================================================
   DONUT HOVER DETAILS
===================================================== */

const donutChart =
    document.querySelector(".donut-chart");

const donutTooltip =
    document.querySelector(".donut-tooltip");

const tooltipTitle =
    donutTooltip?.querySelector("strong");

const tooltipPercentage =
    donutTooltip?.querySelector("span");


if (
    donutChart &&
    donutTooltip &&
    tooltipTitle &&
    tooltipPercentage
) {

    donutChart.addEventListener(
        "mousemove",
        function (event) {

            const rect =
                donutChart.getBoundingClientRect();

            const centerX =
                rect.left +
                rect.width / 2;

            const centerY =
                rect.top +
                rect.height / 2;


            const x =
                event.clientX -
                centerX;

            const y =
                event.clientY -
                centerY;


            /* Find cursor angle */

            let angle =
                Math.atan2(y, x) *
                180 /
                Math.PI;

            angle =
                (angle + 90 + 360) %
                360;


            /* Current percentages */

            const total =
                statistics.total;

            if (!total) return;


            const low =
                Math.round(
                    statistics.low /
                    total *
                    100
                );

            const medium =
                Math.round(
                    statistics.medium /
                    total *
                    100
                );

            const high =
                Math.round(
                    statistics.high /
                    total *
                    100
                );


            /* Determine segment */

            if (angle < low * 3.6) {

                tooltipTitle.textContent =
                    "Low Risk";

                tooltipPercentage.textContent =
                    `${low}%`;

            }

            else if (
                angle <
                (low + medium) * 3.6
            ) {

                tooltipTitle.textContent =
                    "Medium Risk";

                tooltipPercentage.textContent =
                    `${medium}%`;

            }

            else {

                tooltipTitle.textContent =
                    "High Risk";

                tooltipPercentage.textContent =
                    `${high}%`;

            }

        }
    );

}

    /* =====================================================
       INPUT ERROR
    ===================================================== */

    function showInputError() {

        if (!messageInput) return;

        messageInput.classList.add(
            "input-error"
        );

        messageInput.focus();


        setTimeout(() => {

            messageInput.classList.remove(
                "input-error"
            );

        }, 800);
    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            navLinks.forEach(item => {

                item.classList.remove("active");
            });

            link.classList.add("active");
        });
    });


    /* =====================================================
       SCROLL NAVIGATION
    ===================================================== */

    const sections =
        document.querySelectorAll(
            "section[id]"
        );


    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(

                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting)
                            return;


                        const id =
                            entry.target.id;


                        navLinks.forEach(link => {

                            link.classList.toggle(
                                "active",
                                link.getAttribute("href") ===
                                `#${id}`
                            );

                        });

                    });

                },

                {
                    threshold: 0.35
                }
            );


        sections.forEach(section => {

            observer.observe(section);
        });
    }


    /* =====================================================
       PARTICLE SYSTEM
    ===================================================== */

    createParticles();


    function createParticles() {

        const container =
            document.getElementById(
                "particles"
            );


        if (!container) return;


        const particleCount =
            window.innerWidth < 700
                ? 25
                : 55;


        for (
            let i = 0;
            i < particleCount;
            i++
        ) {

            const particle =
                document.createElement("span");


            particle.className =
                "scam-particle";


            particle.style.left =
                `${Math.random() * 100}%`;


            particle.style.top =
                `${Math.random() * 100}%`;


            particle.style.animationDelay =
                `${Math.random() * 8}s`;


            particle.style.animationDuration =
                `${5 + Math.random() * 8}s`;


            const size =
                1 + Math.random() * 2;


            particle.style.width =
                `${size}px`;


            particle.style.height =
                `${size}px`;


            container.appendChild(
                particle
            );
        }
    }


    /* =====================================================
       3D TILT
    ===================================================== */

    const visual =
        document.querySelector(
            ".hero-visual"
        );


    if (
        visual &&
        window.matchMedia("(pointer:fine)").matches
    ) {

        visual.addEventListener(
            "mousemove",
            event => {

                const rect =
                    visual.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left;


                const y =
                    event.clientY -
                    rect.top;


                const centerX =
                    rect.width / 2;


                const centerY =
                    rect.height / 2;


                const rotateY =
                    ((x - centerX) /
                        centerX) * 5;


                const rotateX =
                    ((centerY - y) /
                        centerY) * 5;


                visual.style.transform =
                    `perspective(1200px)
                     rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)`;
            }
        );


        visual.addEventListener(
            "mouseleave",
            () => {

                visual.style.transform =
                    "perspective(1200px) rotateX(0deg) rotateY(0deg)";
            }
        );
    }


    /* =====================================================
       MAGNETIC BUTTON EFFECT
    ===================================================== */

    document
        .querySelectorAll(
            ".btn-primary, .analyze-button"
        )
        .forEach(button => {

            button.addEventListener(
                "mousemove",
                event => {

                    if (window.innerWidth < 700)
                        return;


                    const rect =
                        button.getBoundingClientRect();


                    const x =
                        event.clientX -
                        rect.left -
                        rect.width / 2;


                    const y =
                        event.clientY -
                        rect.top -
                        rect.height / 2;


                    button.style.transform =
                        `translate(
                            ${x * 0.08}px,
                            ${y * 0.08}px
                        )`;
                }
            );


            button.addEventListener(
                "mouseleave",
                () => {

                    button.style.transform =
                        "";
                }
            );
        });


    /* =====================================================
       REVEAL ON SCROLL
    ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".stat-card, .intelligence-card, .pipeline-step, .analyzer-console"
        );


    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(

                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "revealed"
                            );


                            revealObserver.unobserve(
                                entry.target
                            );
                        }

                    });

                },

                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(element => {

            revealObserver.observe(element);
        });
    }


    /* =====================================================
       RESULT CSS
    ===================================================== */

    function addResultStyles() {

        if (
            document.getElementById(
                "scamlens-result-styles"
            )
        ) {
            return;
        }


        const style =
            document.createElement("style");


        style.id =
            "scamlens-result-styles";


        style.textContent = `

            .analysis-result-card {
                position: relative;
                padding: 34px;
                border-radius: 18px;

                background:
                    linear-gradient(
                        145deg,
                        rgba(16,35,37,.95),
                        rgba(7,18,21,.98)
                    );

                border:
                    1px solid
                    rgba(105,225,213,.18);

                box-shadow:
                    0 30px 100px
                    rgba(0,0,0,.45),

                    inset 0 1px 0
                    rgba(255,255,255,.04);

                overflow: hidden;

                animation:
                    resultReveal .7s
                    cubic-bezier(.2,.8,.2,1)
                    both;
            }


            .analysis-result-card::before {

                content: "";

                position: absolute;

                width: 450px;
                height: 450px;

                top: -250px;
                right: -180px;

                border-radius: 50%;

                background:
                    var(--risk-color);

                opacity: .07;

                filter: blur(80px);

                pointer-events: none;
            }


            .analysis-result-header {

                display: flex;

                justify-content:
                    space-between;

                align-items:
                    flex-start;

                padding-bottom: 25px;

                border-bottom:
                    1px solid
                    rgba(255,255,255,.06);
            }


            .analysis-result-header h2 {

                margin-top: 8px;

                font-family:
                    'Space Grotesk',
                    sans-serif;

                font-size: 28px;
            }


            .result-type {

                padding:
                    7px 11px;

                border-radius: 6px;

                color: #6f9290;

                background:
                    rgba(99,234,217,.05);

                border:
                    1px solid
                    rgba(99,234,217,.12);

                font-family:
                    monospace;

                font-size: 9px;

                letter-spacing: 1.5px;
            }


            .risk-overview {

                display: grid;

                grid-template-columns:
                    230px 1fr;

                align-items:
                    center;

                gap: 40px;

                padding:
                    35px 0;
            }


            .risk-score-wrapper {

                display: flex;

                justify-content:
                    center;
            }


            .risk-ring {

                width: 190px;
                height: 190px;

                border-radius: 50%;

                display: grid;

                place-items:
                    center;

                background:
                    conic-gradient(
                        var(--risk-color)
                        0deg,
                        rgba(255,255,255,.04)
                        0deg
                    );

                box-shadow:
                    0 0 50px
                    rgba(99,234,217,.12);

                animation:
                    ringAppear 1s
                    ease both;
            }


            .risk-ring-inner {

                width: 158px;
                height: 158px;

                border-radius: 50%;

                display: flex;

                align-items:
                    center;

                justify-content:
                    center;

                flex-direction:
                    column;

                background:
                    #081417;

                box-shadow:
                    inset 0 0 30px
                    rgba(0,0,0,.5);
            }


            .risk-ring-inner strong {

                font-family:
                    'Space Grotesk',
                    sans-serif;

                font-size: 52px;

                line-height: 1;

                color:
                    var(--risk-color);
            }


            .risk-ring-inner span {

                color:
                    #526a6b;

                font-size: 11px;

                margin-top: 5px;
            }


            .risk-information {

                max-width: 620px;
            }


            .risk-badge {

                display: inline-flex;

                align-items:
                    center;

                gap: 8px;

                padding:
                    7px 12px;

                border-radius:
                    50px;

                background:
                    rgba(255,255,255,.025);

                border:
                    1px solid
                    rgba(255,255,255,.07);

                font-family:
                    monospace;

                font-size: 11px;

                letter-spacing: 1px;

                font-weight:
                    700;
            }


            .risk-information h3 {

                margin-top:
                    18px;

                font-family:
                    'Space Grotesk',
                    sans-serif;

                font-size:
                    24px;
            }


            .risk-information p {

                max-width:
                    620px;

                margin-top:
                    10px;

                color:
                    #789090;

                font-size:
                    13px;

                line-height:
                    1.8;
            }


            .detections-section {

                border-top:
                    1px solid
                    rgba(255,255,255,.06);

                padding-top:
                    25px;
            }


            .result-subheading {

                display:
                    flex;

                justify-content:
                    space-between;

                color:
                    #6d8988;

                font-family:
                    monospace;

                font-size:
                    9px;

                letter-spacing:
                    1.5px;

                margin-bottom:
                    14px;
            }


            .result-subheading strong {

                color:
                    #b7d7d4;
            }


            .detections-list {

                display:
                    grid;

                gap:
                    9px;
            }


            .detection-item {

                display:
                    flex;

                gap:
                    13px;

                padding:
                    15px;

                border-radius:
                    10px;

                background:
                    rgba(255,255,255,.018);

                border:
                    1px solid
                    rgba(255,255,255,.045);

                transition:
                    transform .25s ease,
                    border-color .25s ease;
            }


            .detection-item:hover {

                transform:
                    translateX(5px);

                border-color:
                    rgba(99,234,217,.2);
            }


            .detection-icon {

                width:
                    30px;

                height:
                    30px;

                flex:
                    0 0 30px;

                display:
                    grid;

                place-items:
                    center;

                border-radius:
                    8px;

                font-weight:
                    800;

                background:
                    rgba(255,255,255,.04);
            }


            .detection-icon.high {

                color:
                    #ff806f;

                background:
                    rgba(255,128,111,.08);
            }


            .detection-icon.medium {

                color:
                    #e7bd64;

                background:
                    rgba(231,189,100,.08);
            }


            .detection-icon.low {

                color:
                    #64e2bd;

                background:
                    rgba(100,226,189,.08);
            }


            .detection-content strong {

                font-size:
                    13px;
            }


            .detection-content p {

                margin-top:
                    4px;

                color:
                    #647c7c;

                font-size:
                    11px;

                line-height:
                    1.65;
            }


            .recommendation {

                display:
                    flex;

                gap:
                    13px;

                margin-top:
                    25px;

                padding:
                    17px;

                border-radius:
                    10px;

                background:
                    rgba(99,234,217,.035);

                border:
                    1px solid
                    rgba(99,234,217,.10);
            }


            .recommendation-icon {

                width:
                    29px;

                height:
                    29px;

                flex:
                    0 0 29px;

                display:
                    grid;

                place-items:
                    center;

                border-radius:
                    50%;

                color:
                    #63ead9;

                border:
                    1px solid
                    rgba(99,234,217,.3);
            }


            .recommendation strong {

                font-size:
                    12px;
            }


            .recommendation p {

                margin-top:
                    4px;

                color:
                    #718686;

                font-size:
                    11px;

                line-height:
                    1.65;
            }


            .analysis-footer {

                display:
                    flex;

                justify-content:
                    space-between;

                gap:
                    15px;

                margin-top:
                    25px;

                padding-top:
                    17px;

                border-top:
                    1px solid
                    rgba(255,255,255,.05);

                color:
                    #455b5c;

                font-family:
                    monospace;

                font-size:
                    8px;

                letter-spacing:
                    1px;
            }


            .input-error {

                animation:
                    inputShake .4s ease;

                border-color:
                    #ff806f !important;

                box-shadow:
                    0 0 20px
                    rgba(255,128,111,.12) !important;
            }


            .scam-particle {

                position:
                    absolute;

                display:
                    block;

                border-radius:
                    50%;

                background:
                    #63ead9;

                box-shadow:
                    0 0 7px
                    #63ead9;

                opacity:
                    .25;

                pointer-events:
                    none;

                animation:
                    particleFloat
                    linear infinite;
            }


            .analyze-button.scanning {

                animation:
                    scanButton 1s
                    ease-in-out infinite;
            }


            @keyframes resultReveal {

                from {
                    opacity: 0;

                    transform:
                        translateY(25px)
                        scale(.98);
                }

                to {
                    opacity: 1;

                    transform:
                        translateY(0)
                        scale(1);
                }
            }


            @keyframes ringAppear {

                from {

                    transform:
                        scale(.7)
                        rotate(-30deg);

                    opacity: 0;
                }

                to {

                    transform:
                        scale(1)
                        rotate(0);

                    opacity: 1;
                }
            }


            @keyframes inputShake {

                0%, 100% {
                    transform:
                        translateX(0);
                }

                25% {
                    transform:
                        translateX(-7px);
                }

                75% {
                    transform:
                        translateX(7px);
                }
            }


            @keyframes particleFloat {

                0% {

                    transform:
                        translateY(0)
                        translateX(0);

                    opacity: 0;
                }

                15% {
                    opacity: .3;
                }

                50% {

                    transform:
                        translateY(-80px)
                        translateX(30px);
                }

                85% {
                    opacity: .15;
                }

                100% {

                    transform:
                        translateY(-160px)
                        translateX(-20px);

                    opacity: 0;
                }
            }


            @keyframes scanButton {

                50% {

                    box-shadow:
                        0 0 35px
                        rgba(99,234,217,.35);
                }
            }


            @media (max-width: 700px) {

                .analysis-result-card {
                    padding:
                        22px;
                }


                .risk-overview {

                    grid-template-columns:
                        1fr;

                    text-align:
                        center;
                }


                .risk-information {

                    margin:
                        auto;
                }


                .risk-badge {

                    justify-content:
                        center;
                }


                .analysis-result-header {

                    gap:
                        15px;
                }


                .analysis-result-header h2 {

                    font-size:
                        22px;
                }


                .analysis-footer {

                    flex-direction:
                        column;
                }
            }

        `;


        document.head.appendChild(style);
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value)

            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       INITIAL SETUP
    ===================================================== */

    updatePlaceholder("message");

    // last existing code here

loadScanHistory();

/* =========================================================
   FAQ ACCORDION
========================================================= */

const faqItems =
    document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const question =
        item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        const isActive =
            item.classList.contains("active");

        /* Close all other FAQs */

        faqItems.forEach(otherItem => {
            otherItem.classList.remove("active");
        });

        /* Open clicked FAQ */

        if (!isActive) {
            item.classList.add("active");
        }

    });

});

/* =========================================================
   QUERY FORM
========================================================= */

const queryForm =
    document.getElementById("queryForm");

const queryStatus =
    document.getElementById("queryStatus");

if (queryForm) {

    queryForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById("queryName")
                    .value
                    .trim();

            const email =
                document.getElementById("queryEmail")
                    .value
                    .trim();

            const question =
                document.getElementById("queryQuestion")
                    .value
                    .trim();

            if (!name || !email || !question) {
                queryStatus.textContent =
                    "Please fill in all fields.";

                queryStatus.className =
                    "query-status error";

                return;
            }

            queryStatus.textContent =
                "Sending query...";

            queryStatus.className =
                "query-status";


            try {

                const response =
                    await fetch(
                        "https://scamlens-backend-0w5v.onrender.com/api/queries",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                question
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to submit query"
                    );
                }


                queryStatus.textContent =
                    "✓ Query submitted successfully!";

                queryStatus.className =
                    "query-status success";


                queryForm.reset();


            } catch (error) {

                console.error(
                    "Query submission failed:",
                    error
                );

                queryStatus.textContent =
                    "Could not submit your query. Please try again.";

                queryStatus.className =
                    "query-status error";

            }

        }
    );

}
});
