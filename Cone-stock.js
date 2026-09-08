// @ts-nocheck

// ==========================================
// YUKESHWARAN YARN STORAGE SYSTEM
// CONE STOCK - CORRECTED FAST VERSION
// PART 1 / 3
// ==========================================

let db;
let collection;
let getDocs;
let addDoc;
let setDoc;
let doc;

let firebaseReady = false;
let firebasePromise = null;

const params =
    new URLSearchParams(
        window.location.search
    );

const companyName =
    params.get("company") || "AYM Cone";


// ==========================================
// COMPANY NAME
// ==========================================

const companyTitle =
    document.getElementById(
        "companyName"
    );

if (companyTitle) {
    companyTitle.textContent =
        companyName;
}


// ==========================================
// ELEMENTS
// ==========================================

const transactionList =
    document.getElementById(
        "transactionList"
    );

const emptyMessage =
    document.getElementById(
        "emptyMessage"
    );

const totalWeight =
    document.getElementById(
        "totalWeight"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const popupOverlay =
    document.getElementById(
        "popupOverlay"
    );

const popupTitle =
    document.getElementById(
        "popupTitle"
    );

const closePopup =
    document.getElementById(
        "closePopup"
    );

const addBtn =
    document.getElementById(
        "addBtn"
    );

const buyBtn =
    document.getElementById(
        "buyBtn"
    );

const returnBtn =
    document.getElementById(
        "returnBtn"
    );

const dateInput =
    document.getElementById(
        "dateInput"
    );

const boxCount =
    document.getElementById(
        "boxCount"
    );

const weightInputs =
    document.getElementById(
        "weightInputs"
    );

const popupTotal =
    document.getElementById(
        "popupTotal"
    );

const saveBtn =
    document.getElementById(
        "saveBtn"
    );

const backBtn =
    document.getElementById(
        "backBtn"
    );


// ==========================================
// DATA
// ==========================================

let transactions = [];

let selectedType = "buy";

let editingId = null;


// ==========================================
// CACHE
// ==========================================

const CACHE_KEY =
    "fast_cone_stock_" +
    companyName;


// ==========================================
// FIREBASE REFERENCE
// ==========================================

let transactionsRef = null;


// ==========================================
// TIME VALUE
// ==========================================

function getTimeValue(value) {

    if (!value) {
        return 0;
    }


    if (
        typeof value ===
        "number"
    ) {
        return value;
    }


    if (
        typeof value ===
        "string"
    ) {

        const number =
            Number(value);

        if (
            !isNaN(number)
        ) {
            return number;
        }


        const date =
            new Date(value)
                .getTime();

        return isNaN(date)
            ? 0
            : date;
    }


    if (
        typeof value.toMillis ===
        "function"
    ) {
        return value.toMillis();
    }


    if (
        value.seconds !==
        undefined
    ) {
        return (
            Number(value.seconds) *
            1000
        );
    }


    return 0;
}


// ==========================================
// SORT TRANSACTIONS
// ==========================================

function sortTransactions() {

    transactions.sort(
        function(a, b) {

            return (
                getTimeValue(
                    b.createdAt
                ) -
                getTimeValue(
                    a.createdAt
                )
            );

        }
    );

}


// ==========================================
// SAVE CACHE
// ==========================================

function saveCache() {

    try {

        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify(
                transactions
            )
        );

    } catch (error) {

        console.log(
            "Cache save skipped"
        );

    }

}


// ==========================================
// LOAD CACHE
// ==========================================

function loadCache() {

    try {

        const saved =
            localStorage.getItem(
                CACHE_KEY
            );


        if (!saved) {
            return false;
        }


        const data =
            JSON.parse(saved);


        if (
            !Array.isArray(data)
        ) {
            return false;
        }


        transactions = data;

        sortTransactions();

        renderTransactions();

        return true;

    } catch (error) {

        console.log(
            "Cache load skipped"
        );

        return false;
    }

}


// ==========================================
// FIREBASE INITIALIZATION
// ==========================================

async function initializeFirebase() {

    try {

        const firebase =
            await import(
                "./firebase-config.js"
            );


        db =
            firebase.db;

        collection =
            firebase.collection;

        getDocs =
            firebase.getDocs;

        addDoc =
            firebase.addDoc;

        setDoc =
            firebase.setDoc;

        doc =
            firebase.doc;


        transactionsRef =
            collection(
                db,
                "coneCompanies",
                companyName,
                "transactions"
            );


        firebaseReady = true;

        return true;

    } catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );

        firebaseReady = false;

        return false;
    }

}


// ==========================================
// START FIREBASE
// ==========================================

function startFirebase() {

    if (!firebasePromise) {

        firebasePromise =
            initializeFirebase();

    }

    return firebasePromise;
}


// ==========================================
// LOAD FIREBASE DATA
// ==========================================

async function loadTransactions() {

    if (
        !firebaseReady ||
        !transactionsRef
    ) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                transactionsRef
            );


        const fresh = [];


        snapshot.forEach(
            function(docSnap) {

                fresh.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        transactions = fresh;

        sortTransactions();

        saveCache();

        renderTransactions();


    } catch (error) {

        console.error(
            "Firebase load error:",
            error
        );


        if (
            transactions.length ===
            0
        ) {

            if (emptyMessage) {

                emptyMessage.style.display =
                    "block";

            }

        }

    }

}


// ==========================================
// ADD BUTTON
// ==========================================

if (addBtn) {

    addBtn.addEventListener(
        "click",
        function() {

            editingId = null;


            popupTitle.textContent =
                "Add Transaction";


            selectedType =
                "buy";


            buyBtn.classList.add(
                "active"
            );

            returnBtn.classList.remove(
                "active"
            );


            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            dateInput.value =
                today;


            boxCount.value =
                "";


            weightInputs.innerHTML =
                "";


            popupTotal.textContent =
                "0.000 kg";


            popupOverlay.classList.add(
                "active"
            );

        }
    );

}


// ==========================================
// BUY BUTTON
// ==========================================

if (buyBtn) {

    buyBtn.addEventListener(
        "click",
        function() {

            selectedType =
                "buy";


            buyBtn.classList.add(
                "active"
            );


            returnBtn.classList.remove(
                "active"
            );

        }
    );

}


// ==========================================
// RETURN BUTTON
// ==========================================

if (returnBtn) {

    returnBtn.addEventListener(
        "click",
        function() {

            selectedType =
                "return";


            returnBtn.classList.add(
                "active"
            );


            buyBtn.classList.remove(
                "active"
            );

        }
    );

}


// ==========================================
// BOX COUNT
// ==========================================

if (boxCount) {

    boxCount.addEventListener(
        "input",
        function() {

            let count =
                parseInt(
                    boxCount.value
                );


            if (
                !count ||
                count < 1
            ) {

                weightInputs.innerHTML =
                    "";

                popupTotal.textContent =
                    "0.000 kg";

                return;
            }


            if (count > 100) {

                count = 100;

                boxCount.value =
                    "100";

            }


            const oldValues = [];


            document
                .querySelectorAll(
                    ".weight-value"
                )
                .forEach(
                    function(input) {

                        oldValues.push(
                            input.value
                        );

                    }
                );


            weightInputs.innerHTML =
                "";


            for (
                let i = 0;
                i < count;
                i++
            ) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "weight-input-row";


                const number =
                    document.createElement(
                        "div"
                    );


                number.className =
                    "weight-index";


                number.textContent =
                    i + 1;


                const input =
                    document.createElement(
                        "input"
                    );


                input.type =
                    "number";

                input.step =
                    "0.001";

                input.min =
                    "0";

                input.placeholder =
                    "Weight in kg";

                input.className =
                    "weight-value";


                if (
                    oldValues[i] !==
                    undefined
                ) {

                    input.value =
                        oldValues[i];

                }


                input.addEventListener(
                    "input",
                    calculatePopupTotal
                );


                row.appendChild(
                    number
                );

                row.appendChild(
                    input
                );

                weightInputs.appendChild(
                    row
                );

            }


            calculatePopupTotal();

        }
    );

}


// ==========================================
// POPUP TOTAL
// ==========================================

function calculatePopupTotal() {

    let total = 0;


    document
        .querySelectorAll(
            ".weight-value"
        )
        .forEach(
            function(input) {

                const value =
                    parseFloat(
                        input.value
                    );


                if (
                    !isNaN(value) &&
                    value >= 0
                ) {

                    total += value;

                }

            }
        );


    popupTotal.textContent =
        total.toFixed(3) +
        " kg";

}
// ==========================================
// SAVE TRANSACTION
// ==========================================

if (saveBtn) {

    saveBtn.addEventListener(
        "click",
        async function() {

            const date =
                dateInput.value;


            const count =
                parseInt(
                    boxCount.value
                );


            // ==============================
            // DATE
            // ==============================

            if (!date) {

                alert(
                    "Please select date"
                );

                return;
            }


            // ==============================
            // BOX COUNT
            // ==============================

            if (
                !count ||
                count < 1
            ) {

                alert(
                    "Please enter total boxes"
                );

                return;
            }


            const inputs =
                document.querySelectorAll(
                    ".weight-value"
                );


            if (
                inputs.length !== count
            ) {

                alert(
                    "Please enter total boxes correctly"
                );

                return;
            }


            // ==============================
            // WEIGHTS
            // ==============================

            const weights = [];

            let invalid = false;


            inputs.forEach(
                function(input) {

                    const value =
                        parseFloat(
                            input.value
                        );


                    if (
                        isNaN(value) ||
                        value < 0
                    ) {

                        invalid = true;

                    } else {

                        weights.push(
                            value
                        );

                    }

                }
            );


            if (invalid) {

                alert(
                    "Please enter all box weights"
                );

                return;
            }


            // ==============================
            // TOTAL
            // ==============================

            const total =
                weights.reduce(
                    function(sum, value) {

                        return sum + value;

                    },
                    0
                );


            // ==============================
            // BUTTON
            // ==============================

            saveBtn.disabled = true;

            saveBtn.textContent =
                "Connecting...";


            // ==============================
            // WAIT FOR FIREBASE
            // ==============================

            const ready =
                await startFirebase();


            if (!ready) {

                alert(
                    "Database connection failed. Please check your internet connection and try again."
                );


                saveBtn.disabled = false;

                saveBtn.textContent =
                    "💾 Save";

                return;
            }


            saveBtn.textContent =
                "Saving...";


            try {

                // ==========================
                // EDIT
                // ==========================

                if (
                    editingId !== null
                ) {

                    const existing =
                        transactions.find(
                            function(item) {

                                return (
                                    item.id ===
                                    editingId
                                );

                            }
                        );


                    if (!existing) {

                        alert(
                            "Transaction not found"
                        );

                        return;
                    }


                    const updatedData = {

                        type:
                            selectedType,

                        number:
                            existing.number,

                        date:
                            date,

                        weights:
                            weights,

                        total:
                            total,

                        createdAt:
                            existing.createdAt ||
                            Date.now(),

                        updatedAt:
                            Date.now()

                    };


                    await setDoc(

                        doc(
                            db,

                            "coneCompanies",

                            companyName,

                            "transactions",

                            editingId
                        ),

                        updatedData

                    );


                    const index =
                        transactions.findIndex(
                            function(item) {

                                return (
                                    item.id ===
                                    editingId
                                );

                            }
                        );


                    if (
                        index !== -1
                    ) {

                        transactions[index] = {

                            id:
                                editingId,

                            ...updatedData

                        };

                    }

                }


                // ==========================
                // NEW TRANSACTION
                // ==========================

                else {

                    const number =
                        getNextNumber(
                            selectedType
                        );


                    const now =
                        Date.now();


                    const newData = {

                        type:
                            selectedType,

                        number:
                            number,

                        date:
                            date,

                        weights:
                            weights,

                        total:
                            total,

                        createdAt:
                            now,

                        updatedAt:
                            now

                    };


                    const docRef =
                        await addDoc(

                            transactionsRef,

                            newData

                        );


                    transactions.unshift({

                        id:
                            docRef.id,

                        ...newData

                    });

                }


                // ==========================
                // UPDATE CACHE
                // ==========================

                sortTransactions();

                saveCache();


                // ==========================
                // CLOSE POPUP
                // ==========================

                closeTransactionPopup();


                // ==========================
                // REFRESH DISPLAY
                // ==========================

                renderTransactions();


            } catch (error) {

                console.error(
                    "Firebase save error:",
                    error
                );


                alert(
                    "Could not save transaction.\n\n" +
                    (error.code || "") +
                    "\n\n" +
                    error.message
                );


            } finally {

                saveBtn.disabled =
                    false;

                saveBtn.textContent =
                    "💾 Save";

            }

        }
    );

}


// ==========================================
// GET NEXT NUMBER
// ==========================================

function getNextNumber(type) {

    let maxNumber = 0;


    transactions.forEach(
        function(item) {

            if (
                item.type === type
            ) {

                const number =
                    Number(
                        item.number
                    ) || 0;


                if (
                    number > maxNumber
                ) {

                    maxNumber =
                        number;

                }

            }

        }
    );


    return maxNumber + 1;

}


// ==========================================
// CLOSE POPUP
// ==========================================

function closeTransactionPopup() {

    if (popupOverlay) {

        popupOverlay.classList.remove(
            "active"
        );

    }


    editingId = null;

}


if (closePopup) {

    closePopup.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            closeTransactionPopup();

        }
    );

}


// ==========================================
// CLOSE BY TAPPING OUTSIDE
// ==========================================

if (popupOverlay) {

    popupOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                popupOverlay
            ) {

                closeTransactionPopup();

            }

        }
    );

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(date) {

    if (!date) {

        return "";

    }


    const parts =
        String(date).split("-");


    if (
        parts.length !== 3
    ) {

        return date;

    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );

}
// ==========================================
// RENDER TRANSACTIONS
// ==========================================

function renderTransactions() {

    if (!transactionList) {
        return;
    }


    transactionList.innerHTML = "";


    const search =
        searchInput
            ? (
                searchInput.value || ""
            )
            .trim()
            .toLowerCase()
            : "";


    const filtered =
        transactions.filter(
            function(item) {

                if (!search) {
                    return true;
                }


                const type =
                    item.type === "buy"
                        ? "buy"
                        : "return";


                const number =
                    String(
                        item.number || ""
                    );


                const date =
                    String(
                        item.date || ""
                    );


                return (
                    type.includes(search) ||
                    number.includes(search) ||
                    date.includes(search)
                );

            }
        );


    if (
        filtered.length === 0
    ) {

        if (emptyMessage) {

            emptyMessage.style.display =
                "block";

        }

    } else {

        if (emptyMessage) {

            emptyMessage.style.display =
                "none";

        }


        filtered.forEach(
            function(item) {

                transactionList.appendChild(
                    createTransactionCard(item)
                );

            }
        );

    }


    calculateOverallTotal();

}


// ==========================================
// CREATE TRANSACTION CARD
// ==========================================

function createTransactionCard(item) {

    const card =
        document.createElement("div");


    card.className =
        "transaction-card " +
        (
            item.type === "buy"
                ? "buy-card"
                : "return-card"
        );


    // ==================================
    // HEADER
    // ==================================

    const header =
        document.createElement("div");


    header.className =
        "card-header";


    // ==================================
    // ICON
    // ==================================

    const icon =
        document.createElement("div");


    icon.className =
        "type-icon " +
        (
            item.type === "buy"
                ? "buy-icon"
                : "return-icon"
        );


    icon.textContent =
        item.type === "buy"
            ? "🛒"
            : "↩";


    // ==================================
    // TITLE
    // ==================================

    const title =
        document.createElement("div");


    title.className =
        "card-title";


    const heading =
        document.createElement("h3");


    heading.textContent =
        (
            item.type === "buy"
                ? "Buy "
                : "Return "
        ) +
        item.number;


    const dateText =
        document.createElement("p");


    dateText.textContent =
        formatDate(
            item.date
        );


    title.appendChild(
        heading
    );


    title.appendChild(
        dateText
    );


    // ==================================
    // EDIT BUTTON
    // ==================================

    const edit =
        document.createElement("button");


    edit.className =
        "edit-btn";


    edit.type =
        "button";


    edit.textContent =
        "✏️ Edit";


    edit.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            openEditPopup(item);

        }
    );


    header.appendChild(icon);

    header.appendChild(title);

    header.appendChild(edit);


    // ==================================
    // BOX COUNT
    // ==================================

    const safeWeights =
        Array.isArray(item.weights)
            ? item.weights
            : [];


    const boxText =
        document.createElement("div");


    boxText.className =
        "box-count";


    boxText.textContent =
        "Total boxes: " +
        safeWeights.length;


    // ==================================
    // WEIGHTS
    // ==================================

    const weights =
        document.createElement("div");


    weights.className =
        "weights";


    safeWeights.forEach(
        function(weight, index) {

            const row =
                document.createElement("div");


            row.className =
                "weight-row";


            const number =
                document.createElement("span");


            number.className =
                "weight-number";


            number.textContent =
                (index + 1) + ".";


            const value =
                document.createElement("span");


            const numericWeight =
                Number(weight);


            value.textContent =
                (
                    isNaN(numericWeight)
                        ? "0.000"
                        : numericWeight.toFixed(3)
                ) +
                " kg";


            row.appendChild(
                number
            );


            row.appendChild(
                value
            );


            weights.appendChild(
                row
            );

        }
    );


    // ==================================
    // TOTAL
    // ==================================

    const cardTotal =
        document.createElement("div");


    cardTotal.className =
        "card-total";


    const numericTotal =
        Number(item.total) || 0;


    cardTotal.textContent =
        "Total weight = " +
        numericTotal.toFixed(3) +
        " kg";


    // ==================================
    // ADD TO CARD
    // ==================================

    card.appendChild(
        header
    );


    card.appendChild(
        boxText
    );


    card.appendChild(
        weights
    );


    card.appendChild(
        cardTotal
    );


    return card;

}


// ==========================================
// EDIT TRANSACTION
// ==========================================

function openEditPopup(item) {

    editingId =
        item.id;


    popupTitle.textContent =
        "Edit Transaction";


    selectedType =
        item.type;


    if (
        item.type === "buy"
    ) {

        buyBtn.classList.add(
            "active"
        );


        returnBtn.classList.remove(
            "active"
        );

    } else {

        returnBtn.classList.add(
            "active"
        );


        buyBtn.classList.remove(
            "active"
        );

    }


    dateInput.value =
        item.date || "";


    const weights =
        Array.isArray(item.weights)
            ? item.weights
            : [];


    boxCount.value =
        weights.length;


    weightInputs.innerHTML =
        "";


    weights.forEach(
        function(weight, index) {

            const row =
                document.createElement("div");


            row.className =
                "weight-input-row";


            const number =
                document.createElement("div");


            number.className =
                "weight-index";


            number.textContent =
                index + 1;


            const input =
                document.createElement("input");


            input.type =
                "number";


            input.step =
                "0.001";


            input.min =
                "0";


            input.placeholder =
                "Weight in kg";


            input.className =
                "weight-value";


            input.value =
                weight;


            input.addEventListener(
                "input",
                calculatePopupTotal
            );


            row.appendChild(
                number
            );


            row.appendChild(
                input
            );


            weightInputs.appendChild(
                row
            );

        }
    );


    calculatePopupTotal();


    popupOverlay.classList.add(
        "active"
    );

}


// ==========================================
// SEARCH
// ==========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            renderTransactions();

        }
    );

}


// ==========================================
// OVERALL TOTAL
// ==========================================

function calculateOverallTotal() {

    let total = 0;


    transactions.forEach(
        function(item) {

            const value =
                Number(item.total) || 0;


            if (
                item.type === "buy"
            ) {

                total += value;

            } else {

                total -= value;

            }

        }
    );


    if (totalWeight) {

        totalWeight.textContent =
            total.toFixed(3) +
            " kg";

    }

}


// ==========================================
// BACK BUTTON
// ==========================================

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();


            // Close popup if open

            if (popupOverlay) {

                popupOverlay.classList.remove(
                    "active"
                );

            }


            editingId = null;


            window.location.href =
                "./Cone-company.html";

        }
    );

}


// ==========================================
// TOUCH ANIMATION
// ==========================================

document.addEventListener(
    "touchstart",
    function(event) {

        const card =
            event.target.closest(
                ".transaction-card"
            );


        if (card) {

            card.style.transform =
                "scale(0.98)";

        }

    },
    {
        passive: true
    }
);


document.addEventListener(
    "touchend",
    function(event) {

        const card =
            event.target.closest(
                ".transaction-card"
            );


        if (card) {

            card.style.transform =
                "scale(1)";

        }

    },
    {
        passive: true
    }
);


document.addEventListener(
    "touchcancel",
    function(event) {

        const card =
            event.target.closest(
                ".transaction-card"
            );


        if (card) {

            card.style.transform =
                "scale(1)";

        }

    },
    {
        passive: true
    }
);


// ==========================================
// FAST STARTUP
// ==========================================

// 1. Show cached data immediately
// 2. Start Firebase
// 3. Refresh with latest data

const hasCache =
    loadCache();


startFirebase()
    .then(
        function(ready) {

            if (!ready) {

                if (!hasCache) {

                    renderTransactions();

                }

                return;

            }


            loadTransactions();

        }
    );


// ==========================================
// END
// ==========================================