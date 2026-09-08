// @ts-nocheck

// ==========================================
// YUKESHWARAN YARN STORAGE SYSTEM
// CONE COMPANY
// OPTIMIZED VERSION
// PART 1 / 2
// ==========================================


// ==========================================
// FIREBASE
// ==========================================

let db;
let collection;
let getDocs;
let setDoc;
let doc;
let deleteDoc;


// ==========================================
// DEFAULT COMPANIES
// ==========================================

const defaultCompanies = [
    "AYM Cone",
    "Kejerwal Cone",
    "Guru Cone"
];


// ==========================================
// COMPANIES
// ==========================================

let companies = [];

let editingIndex = -1;


// ==========================================
// CACHE
// ==========================================

const CACHE_KEY = "fast_cone_companies";


// ==========================================
// ELEMENTS
// ==========================================

const companyList =
    document.getElementById("companyList");

const addBtn =
    document.getElementById("addBtn");

const popupOverlay =
    document.getElementById("popupOverlay");

const closePopup =
    document.getElementById("closePopup");

const cancelBtn =
    document.getElementById("cancelBtn");

const saveBtn =
    document.getElementById("saveBtn");

const companyNameInput =
    document.getElementById("companyName");

const errorMessage =
    document.getElementById("errorMessage");

const popupTitle =
    document.getElementById("popupTitle");

const backBtn =
    document.getElementById("backBtn");


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================
// SAVE CACHE
// ==========================================

function saveCache() {

    try {

        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify(companies)
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

        if (!Array.isArray(data)) {

            return false;

        }

        companies = data;

        displayCompanies();

        return true;

    } catch (error) {

        console.log(
            "Cache load skipped"
        );

        return false;
    }
}


// ==========================================
// INITIALIZE FIREBASE
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

        setDoc =
            firebase.setDoc;

        doc =
            firebase.doc;

        deleteDoc =
            firebase.deleteDoc;

        return true;

    } catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );

        return false;
    }
}


// ==========================================
// LOAD COMPANIES FROM FIREBASE
// ==========================================

async function loadCompanies() {

    if (!db) {

        return;

    }

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "coneCompanies"
                )
            );


        const firebaseCompanies = [];


        snapshot.forEach(
            function(docSnap) {

                const data =
                    docSnap.data();

                if (data.name) {

                    firebaseCompanies.push(
                        data.name
                    );

                }

            }
        );


        // ==================================
        // IF FIREBASE IS EMPTY
        // ==================================

        if (
            firebaseCompanies.length === 0
        ) {

            companies =
                [...defaultCompanies];

            await saveData();

        } else {

            companies =
                firebaseCompanies;

        }


        // ==================================
        // REMOVE DUPLICATES
        // ==================================

        companies =
            [...new Set(companies)];


        // ==================================
        // SORT COMPANIES
        // ==================================

        companies.sort(
            function(a, b) {

                return a.localeCompare(b);

            }
        );


        // ==================================
        // DISPLAY
        // ==================================

        displayCompanies();


        // ==================================
        // SAVE CACHE
        // ==================================

        saveCache();


        console.log(
            "Companies loaded from Firebase"
        );


    } catch (error) {

        console.error(
            "Firebase load error:",
            error
        );


        // ==================================
        // FALLBACK
        // ==================================

        if (!loadCache()) {

            companies =
                [...defaultCompanies];

            displayCompanies();

        }

    }
}


// ==========================================
// SAVE ALL COMPANIES
// ==========================================

async function saveData() {

    try {

        for (
            const company of companies
        ) {

            await setDoc(

                doc(
                    db,
                    "coneCompanies",
                    company
                ),

                {
                    name: company
                }

            );

        }


        saveCache();


        console.log(
            "Companies saved to Firebase"
        );


    } catch (error) {

        console.error(
            "Firebase save error:",
            error
        );


        alert(
            "Firebase Error:\n\n" +
            error.code +
            "\n\n" +
            error.message
        );

    }
}


// ==========================================
// DISPLAY COMPANIES
// ==========================================

function displayCompanies() {

    if (!companyList) {

        return;

    }


    companyList.innerHTML = "";


    // ==================================
    // NO COMPANIES
    // ==================================

    if (companies.length === 0) {

        companyList.innerHTML = `

            <div class="empty-message">

                No cone companies added yet.

                <br><br>

                Tap + to add a company.

            </div>

        `;

        return;
    }


    // ==================================
    // CREATE CARDS
    // ==================================

    companies.forEach(
        function(company, index) {

            const card =
                document.createElement("div");


            card.className =
                "company-card";


            // ==================================
            // CARD HTML
            // ==================================

            card.innerHTML = `

                <div class="company-number">
                    ${index + 1}
                </div>


                <div class="company-info">

                    <h3>
                        ${escapeHTML(company)}
                    </h3>

                    <p>
                        Polyester Cone Company
                    </p>

                </div>


                <div class="company-actions">

                    <button
                        class="edit-btn"
                        data-index="${index}"
                        type="button">
                        ✏️
                    </button>


                    <button
                        class="delete-btn"
                        data-index="${index}"
                        type="button">
                        🗑️
                    </button>

                </div>

            `;


            // ==================================
            // OPEN CONE STOCK
            // ==================================

            card.addEventListener(
                "click",
                function() {

                    window.location.href =
                        "Cone-stock.html?company=" +
                        encodeURIComponent(
                            company
                        );

                }
            );


            // ==================================
            // EDIT
            // ==================================

            const editButton =
                card.querySelector(
                    ".edit-btn"
                );


            editButton.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    openEditPopup(index);

                }
            );


            // ==================================
            // DELETE
            // ==================================

            const deleteButton =
                card.querySelector(
                    ".delete-btn"
                );


            deleteButton.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    deleteCompany(index);

                }
            );


            // ==================================
            // ADD CARD
            // ==================================

            companyList.appendChild(card);

        }
    );

}


// ==========================================
// OPEN ADD POPUP
// ==========================================

addBtn.addEventListener(
    "click",
    function() {

        editingIndex = -1;


        popupTitle.textContent =
            "Add Cone Company";


        companyNameInput.value = "";


        errorMessage.textContent = "";


        popupOverlay.classList.add(
            "show"
        );


        setTimeout(
            function() {

                companyNameInput.focus();

            },
            100
        );

    }
);


// ==========================================
// OPEN EDIT POPUP
// ==========================================

function openEditPopup(index) {

    editingIndex = index;


    popupTitle.textContent =
        "Edit Cone Company";


    companyNameInput.value =
        companies[index];


    errorMessage.textContent = "";


    popupOverlay.classList.add(
        "show"
    );


    setTimeout(
        function() {

            companyNameInput.focus();

            companyNameInput.select();

        },
        100
    );

}


// ==========================================
// CLOSE POPUP
// ==========================================

function closeAddPopup() {

    popupOverlay.classList.remove(
        "show"
    );


    companyNameInput.value = "";


    errorMessage.textContent = "";


    editingIndex = -1;

}


// ==========================================
// CLOSE BUTTON
// ==========================================

closePopup.addEventListener(
    "click",
    closeAddPopup
);


// ==========================================
// CANCEL BUTTON
// ==========================================

cancelBtn.addEventListener(
    "click",
    closeAddPopup
);
// ==========================================
// SAVE / UPDATE COMPANY
// ==========================================

saveBtn.addEventListener(
    "click",
    async function() {

        const name =
            companyNameInput.value.trim();


        // ==================================
        // EMPTY NAME
        // ==================================

        if (name === "") {

            errorMessage.textContent =
                "Please enter company name.";

            companyNameInput.focus();

            return;
        }


        // ==================================
        // CHECK DUPLICATE
        // ==================================

        const duplicate =
            companies.some(
                function(company, index) {

                    return (
                        index !== editingIndex &&
                        company.toLowerCase() ===
                        name.toLowerCase()
                    );

                }
            );


        if (duplicate) {

            errorMessage.textContent =
                "This company already exists.";

            companyNameInput.focus();

            return;
        }


        // ==================================
        // CHECK FIREBASE
        // ==================================

        if (!db) {

            errorMessage.textContent =
                "Database is not ready. Please try again.";

            return;
        }


        try {

            // ==================================
            // EDIT EXISTING COMPANY
            // ==================================

            if (editingIndex !== -1) {

                const oldName =
                    companies[editingIndex];


                // ==================================
                // DELETE OLD DOCUMENT
                // ==================================

                await deleteDoc(
                    doc(
                        db,
                        "coneCompanies",
                        oldName
                    )
                );


                // ==================================
                // UPDATE LOCAL ARRAY
                // ==================================

                companies[editingIndex] =
                    name;


                // ==================================
                // CREATE NEW DOCUMENT
                // ==================================

                await setDoc(

                    doc(
                        db,
                        "coneCompanies",
                        name
                    ),

                    {
                        name: name
                    }

                );

            }


            // ==================================
            // ADD NEW COMPANY
            // ==================================

            else {

                companies.push(name);


                await setDoc(

                    doc(
                        db,
                        "coneCompanies",
                        name
                    ),

                    {
                        name: name
                    }

                );

            }


            // ==================================
            // SORT
            // ==================================

            companies.sort(
                function(a, b) {

                    return a.localeCompare(b);

                }
            );


            // ==================================
            // SAVE CACHE
            // ==================================

            saveCache();


            // ==================================
            // UPDATE SCREEN
            // ==================================

            displayCompanies();


            // ==================================
            // CLOSE POPUP
            // ==================================

            closeAddPopup();


            console.log(
                "Company saved:",
                name
            );


        } catch (error) {

            console.error(
                "Firebase save/update error:",
                error
            );


            // ==================================
            // RESTORE FROM FIREBASE
            // ==================================

            errorMessage.textContent =
                "Could not save company. Please try again.";

        }

    }
);


// ==========================================
// DELETE COMPANY
// ==========================================

async function deleteCompany(index) {

    const company =
        companies[index];


    if (!company) {

        return;

    }


    // ==================================
    // CONFIRM DELETE
    // ==================================

    const confirmed =
        confirm(
            `Delete "${company}"?`
        );


    if (!confirmed) {

        return;

    }


    // ==================================
    // CHECK FIREBASE
    // ==================================

    if (!db) {

        alert(
            "Database is not ready. Please try again."
        );

        return;

    }


    try {

        // ==================================
        // DELETE FROM FIREBASE
        // ==================================

        await deleteDoc(
            doc(
                db,
                "coneCompanies",
                company
            )
        );


        // ==================================
        // DELETE FROM LOCAL ARRAY
        // ==================================

        companies.splice(
            index,
            1
        );


        // ==================================
        // SAVE CACHE
        // ==================================

        saveCache();


        // ==================================
        // UPDATE SCREEN
        // ==================================

        displayCompanies();


        console.log(
            "Company deleted:",
            company
        );


    } catch (error) {

        console.error(
            "Firebase delete error:",
            error
        );


        alert(
            "Could not delete company.\n\n" +
            error.code +
            "\n\n" +
            error.message
        );

    }

}


// ==========================================
// ENTER KEY
// ==========================================

companyNameInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            saveBtn.click();

        }

    }
);


// ==========================================
// BACK BUTTON
// ==========================================

backBtn.addEventListener(
    "click",
    function() {

        window.location.href =
            "index.html";

    }
);


// ==========================================
// TOUCH ANIMATION
// ==========================================

document.addEventListener(
    "touchstart",
    function(event) {

        const card =
            event.target.closest(
                ".company-card"
            );


        if (card) {

            card.style.transform =
                "scale(0.97)";

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
                ".company-card"
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
// TOUCH CANCEL
// ==========================================

document.addEventListener(
    "touchcancel",
    function(event) {

        const card =
            event.target.closest(
                ".company-card"
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
// START
// ==========================================


// Show cached companies immediately.
// This makes repeat navigation faster.

const hasCache =
    loadCache();


// Initialize Firebase in background.

initializeFirebase()
    .then(
        function(ready) {

            if (!ready) {

                if (!hasCache) {

                    companies =
                        [...defaultCompanies];

                    displayCompanies();

                }

                return;

            }


            // ==================================
            // REFRESH FROM FIREBASE
            // ==================================

            loadCompanies();

        }
    );


// ==========================================
// END
// ==========================================
