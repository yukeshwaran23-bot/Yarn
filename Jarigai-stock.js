// @ts-nocheck

/* =========================================
   JARIGAI STOCK SYSTEM - FIREBASE VERSION
========================================= */


/* =========================================
   FIREBASE
========================================= */

let db = null;
let firebaseFunctions = null;


/* =========================================
   GET COMPANY NAME
========================================= */

const params =
    new URLSearchParams(window.location.search);

const companyName =
    params.get("company") ||
    "Sri Lakshmi Jarigai";


/* =========================================
   ELEMENTS
========================================= */

const companyNameElement =
    document.getElementById("companyName");

const totalBags =
    document.getElementById("totalBags");

const buyBags =
    document.getElementById("buyBags");

const returnBags =
    document.getElementById("returnBags");

const transactionList =
    document.getElementById("transactionList");

const emptyMessage =
    document.getElementById("emptyMessage");

const searchInput =
    document.getElementById("searchInput");

const addBtn =
    document.getElementById("addBtn");

const backBtn =
    document.getElementById("backBtn");

const popupOverlay =
    document.getElementById("popupOverlay");

const closePopup =
    document.getElementById("closePopup");

const popupTitle =
    document.getElementById("popupTitle");

const buyBtn =
    document.getElementById("buyBtn");

const returnBtn =
    document.getElementById("returnBtn");

const bagsInput =
    document.getElementById("bagsInput");

const colourInput =
    document.getElementById("colourInput");

const weightInput =
    document.getElementById("weightInput");

const saveBtn =
    document.getElementById("saveBtn");


/* =========================================
   VARIABLES
========================================= */

let transactions = [];

let selectedType = "buy";

let editingId = null;

let companyId = null;


/* =========================================
   SHOW COMPANY NAME
========================================= */

companyNameElement.textContent =
    companyName;


/* =========================================
   INITIALIZE FIREBASE
========================================= */

async function initializeFirebase() {

    try {

        /*
         * Load your firebase-config.js
         */
        const firebaseConfig =
            await import("./firebase-config.js");


        /*
         * Load Firestore functions
         */
        const firestore =
            await import(
                "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js"
            );


        db =
            firebaseConfig.db;

        firebaseFunctions =
            firestore;


        /*
         * Find the Jarigai company document
         */
        await findCompany();


    } catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );

        alert(
            "Firebase connection failed. Check firebase-config.js."
        );

    }

}


/* =========================================
   FIND COMPANY DOCUMENT
========================================= */

async function findCompany() {

    try {

        const companiesRef =
            firebaseFunctions.collection(
                db,
                "jarigaiCompanies"
            );


        const snapshot =
            await firebaseFunctions.getDocs(
                companiesRef
            );


        companyId = null;


        snapshot.forEach(
            function(docSnap) {

                const data =
                    docSnap.data();


                if (
                    data.name &&
                    data.name.toLowerCase() ===
                    companyName.toLowerCase()
                ) {

                    companyId =
                        docSnap.id;

                }

            }
        );


        /*
         * Company must exist before stock is loaded
         */
        if (!companyId) {

            console.error(
                "Jarigai company not found:",
                companyName
            );

            alert(
                "Company not found in Firebase."
            );

            return;

        }


        await loadTransactions();

    } catch (error) {

        console.error(
            "Company loading error:",
            error
        );

        alert(
            "Could not load company."
        );

    }

}


/* =========================================
   TRANSACTIONS COLLECTION
========================================= */

function getTransactionsCollection() {

    return firebaseFunctions.collection(
        db,
        "jarigaiCompanies",
        companyId,
        "transactions"
    );

}


/* =========================================
   LOAD TRANSACTIONS
========================================= */

async function loadTransactions() {

    try {

        const transactionsRef =
            getTransactionsCollection();


        const snapshot =
            await firebaseFunctions.getDocs(
                transactionsRef
            );


        transactions = [];


        snapshot.forEach(
            function(docSnap) {

                const data =
                    docSnap.data();


                transactions.push({

                    id: docSnap.id,

                    type:
                        data.type || "buy",

                    number:
                        data.number || 1,

                    bags:
                        Number(data.bags) || 0,

                    colour:
                        data.colour || "",

                    weight:
                        data.weight === null ||
                        data.weight === undefined
                            ? null
                            : Number(data.weight),

                    date:
                        data.date || "",

                    createdAt:
                        data.createdAt || null,

                    updatedAt:
                        data.updatedAt || null

                });

            }
        );


        /*
         * Newest transactions first
         */
        transactions.sort(
            function(a, b) {

                const aTime =
                    getTimeValue(a);

                const bTime =
                    getTimeValue(b);

                return bTime - aTime;

            }
        );


        renderTransactions();


    } catch (error) {

        console.error(
            "Transaction loading error:",
            error
        );

        alert(
            "Could not load Jarigai stock."
        );

    }

}


/* =========================================
   GET TIME VALUE
========================================= */

function getTimeValue(item) {

    if (!item.createdAt) {
        return 0;
    }


    /*
     * Firestore Timestamp
     */
    if (
        typeof item.createdAt.toMillis ===
        "function"
    ) {

        return item.createdAt.toMillis();

    }


    /*
     * Firebase Timestamp object
     */
    if (
        item.createdAt.seconds !== undefined
    ) {

        return (
            Number(item.createdAt.seconds) *
            1000
        );

    }


    /*
     * JavaScript date/string
     */
    const time =
        new Date(
            item.createdAt
        ).getTime();


    return isNaN(time)
        ? 0
        : time;

}


/* =========================================
   OPEN ADD POPUP
========================================= */

addBtn.addEventListener(
    "click",
    function() {

        editingId = null;

        popupTitle.textContent =
            "Add Transaction";


        selectedType = "buy";

        buyBtn.classList.add("active");

        returnBtn.classList.remove("active");


        bagsInput.value = "";

        colourInput.value = "";

        weightInput.value = "";


        popupOverlay.classList.add(
            "active"
        );

    }
);


/* =========================================
   BUY
========================================= */

buyBtn.addEventListener(
    "click",
    function() {

        selectedType = "buy";

        buyBtn.classList.add("active");

        returnBtn.classList.remove("active");

    }
);


/* =========================================
   RETURN
========================================= */

returnBtn.addEventListener(
    "click",
    function() {

        selectedType = "return";

        returnBtn.classList.add("active");

        buyBtn.classList.remove("active");

    }
);


/* =========================================
   SAVE TRANSACTION
========================================= */

saveBtn.addEventListener(
    "click",
    async function() {

        const bags =
            parseInt(
                bagsInput.value
            );


        const colour =
            colourInput.value.trim();


        const weightText =
            weightInput.value.trim();


        const weight =
            weightText === ""
                ? null
                : parseFloat(weightText);


        /* =========================
           VALIDATION
        ========================== */

        if (
            !bags ||
            bags < 1
        ) {

            alert(
                "Please enter number of bags."
            );

            bagsInput.focus();

            return;

        }


        if (colour === "") {

            alert(
                "Please enter colour."
            );

            colourInput.focus();

            return;

        }


        if (
            weightText !== "" &&
            (
                isNaN(weight) ||
                weight < 0
            )
        ) {

            alert(
                "Please enter a valid weight."
            );

            weightInput.focus();

            return;

        }


        if (!companyId) {

            alert(
                "Company is not connected to Firebase."
            );

            return;

        }


        /* =========================
           DISABLE BUTTON
        ========================== */

        saveBtn.disabled = true;

        saveBtn.textContent =
            "Saving...";


        try {

            /* =========================
               EDIT EXISTING
            ========================== */

            if (editingId !== null) {

                const transactionRef =
                    firebaseFunctions.doc(
                        db,
                        "jarigaiCompanies",
                        companyId,
                        "transactions",
                        editingId
                    );


                await firebaseFunctions.setDoc(
                    transactionRef,
                    {

                        type:
                            selectedType,

                        bags:
                            bags,

                        colour:
                            colour,

                        weight:
                            weight,

                        updatedAt:
                            firebaseFunctions.serverTimestamp()

                    },
                    {
                        merge: true
                    }
                );


            }


            /* =========================
               NEW TRANSACTION
            ========================== */

            else {

                const number =
                    getNextNumber(
                        selectedType
                    );


                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];


                await firebaseFunctions.addDoc(
                    getTransactionsCollection(),
                    {

                        type:
                            selectedType,

                        number:
                            number,

                        bags:
                            bags,

                        colour:
                            colour,

                        weight:
                            weight,

                        date:
                            today,

                        createdAt:
                            firebaseFunctions.serverTimestamp(),

                        updatedAt:
                            firebaseFunctions.serverTimestamp()

                    }
                );

            }


            /*
             * Reload from Firebase
             */
            await loadTransactions();


            closeTransactionPopup();


        } catch (error) {

            console.error(
                "Save transaction error:",
                error
            );

            alert(
                "Could not save transaction."
            );

        }


        saveBtn.disabled = false;

        saveBtn.textContent =
            "Save";

    }
);
/* =========================================
   NEXT TRANSACTION NUMBER
========================================= */

function getNextNumber(type) {

    const numbers =
        transactions
            .filter(
                function(item) {

                    return (
                        item.type === type
                    );

                }
            )
            .map(
                function(item) {

                    return Number(
                        item.number
                    ) || 0;

                }
            );


    if (numbers.length === 0) {

        return 1;

    }


    return (
        Math.max(...numbers) + 1
    );

}


/* =========================================
   RENDER TRANSACTIONS
========================================= */

function renderTransactions() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    transactionList.innerHTML =
        "";


    const filtered =
        transactions.filter(
            function(item) {

                if (!search) {
                    return true;
                }


                return (

                    String(item.type)
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(item.colour)
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(item.bags)
                        .includes(search)

                    ||

                    String(item.number)
                        .includes(search)

                    ||

                    (
                        item.weight !== null &&
                        String(item.weight)
                            .includes(search)
                    )

                );

            }
        );


    if (filtered.length === 0) {

        emptyMessage.style.display =
            "block";

    } else {

        emptyMessage.style.display =
            "none";

    }


    filtered.forEach(
        function(item) {

            const card =
                createCard(item);


            transactionList.appendChild(
                card
            );

        }
    );


    calculateTotals();

}


/* =========================================
   CREATE TRANSACTION CARD
========================================= */

function createCard(item) {

    const card =
        document.createElement("div");


    card.className =
        "transaction-card " +
        (
            item.type === "buy"
                ? "buy-card"
                : "return-card"
        );


    /* =========================
       HEADER
    ========================== */

    const header =
        document.createElement("div");

    header.className =
        "card-header";


    /* =========================
       ICON
    ========================== */

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
            ? "↓"
            : "↑";


    /* =========================
       TITLE
    ========================== */

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


    const date =
        document.createElement("p");


    date.textContent =
        formatDate(item.date);


    title.appendChild(
        heading
    );

    title.appendChild(
        date
    );


    /* =========================
       EDIT BUTTON
    ========================== */

    const edit =
        document.createElement("button");

    edit.className =
        "edit-btn";

    edit.textContent =
        "✏️ Edit";


    edit.type =
        "button";


    edit.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            openEditPopup(item);

        }
    );


    header.appendChild(icon);

    header.appendChild(title);

    header.appendChild(edit);


    /* =========================
       DETAILS
    ========================== */

    const details =
        document.createElement("div");

    details.className =
        "details";


    /* BAGS */

    const bags =
        document.createElement("span");

    bags.className =
        "detail";

    bags.textContent =
        item.bags +
        " bags";


    /* COLOUR */

    const colour =
        document.createElement("span");

    colour.className =
        "detail";

    colour.textContent =
        item.colour;


    details.appendChild(
        bags
    );

    details.appendChild(
        colour
    );


    /* =========================
       ADD TO CARD
    ========================== */

    card.appendChild(
        header
    );

    card.appendChild(
        details
    );


    /* =========================
       WEIGHT
    ========================== */

    if (
        item.weight !== null &&
        item.weight !== undefined
    ) {

        const weight =
            document.createElement("div");


        weight.className =
            "card-weight";


        weight.textContent =
            "Weight: ";


        const strong =
            document.createElement("strong");


        strong.textContent =
            Number(item.weight)
                .toFixed(3) +
            " kg";


        weight.appendChild(
            strong
        );


        card.appendChild(
            weight
        );

    }


    return card;

}


/* =========================================
   OPEN EDIT POPUP
========================================= */

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


    bagsInput.value =
        item.bags;


    colourInput.value =
        item.colour;


    weightInput.value =
        item.weight === null ||
        item.weight === undefined
            ? ""
            : item.weight;


    popupOverlay.classList.add(
        "active"
    );

}


/* =========================================
   CLOSE POPUP
========================================= */

function closeTransactionPopup() {

    popupOverlay.classList.remove(
        "active"
    );


    editingId =
        null;


    saveBtn.disabled =
        false;

    saveBtn.textContent =
        "Save";

}


/* =========================================
   CLOSE BUTTON
========================================= */

closePopup.addEventListener(
    "click",
    closeTransactionPopup
);


/* =========================================
   CLOSE WHEN CLICKING OUTSIDE
========================================= */

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


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    renderTransactions
);


/* =========================================
   CALCULATE TOTALS
========================================= */

function calculateTotals() {

    let bought = 0;

    let returned = 0;


    transactions.forEach(
        function(item) {

            const bags =
                Number(item.bags) || 0;


            if (
                item.type === "buy"
            ) {

                bought += bags;

            } else {

                returned += bags;

            }

        }
    );


    const total =
        bought - returned;


    buyBags.textContent =
        bought;


    returnBags.textContent =
        returned;


    totalBags.textContent =
        total;

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(date) {

    if (!date) {
        return "";
    }


    /*
     * Firestore Timestamp support
     */
    if (
        typeof date.toDate ===
        "function"
    ) {

        date =
            date.toDate()
                .toISOString()
                .split("T")[0];

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


/* =========================================
   BACK BUTTON
========================================= */

backBtn.addEventListener(
    "click",
    function() {

        window.location.href =
            "Jarigai-company.html";

    }
);


/* =========================================
   START
========================================= */

initializeFirebase();