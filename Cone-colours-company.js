// @ts-nocheck

/* =========================================
   CONE COLOUR COMPANY SYSTEM
   FIREBASE VERSION
========================================= */


/* =========================================
   DEFAULT COMPANIES
========================================= */

const defaultCompanies = [
    "Radhika Company",
    "Valson Company",
    "SR Company"
];


/* =========================================
   FIREBASE
========================================= */

let db = null;
let firebaseFunctions = null;


/* =========================================
   DATA
========================================= */

let companies = [];

let editingId = null;


/* =========================================
   ELEMENTS
========================================= */

const companyList =
    document.getElementById("companyList");

const emptyMessage =
    document.getElementById("emptyMessage");

const addBtn =
    document.getElementById("addBtn");

const backBtn =
    document.getElementById("backBtn");

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

const popupTitle =
    document.getElementById("popupTitle");

const errorMessage =
    document.getElementById("errorMessage");


/* =========================================
   FIREBASE INITIALIZE
========================================= */

async function initializeFirebase() {

    try {

        const firebaseConfig =
            await import("./firebase-config.js");


        const firestore =
            await import(
                "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js"
            );


        db =
            firebaseConfig.db;

        firebaseFunctions =
            firestore;


        await loadCompanies();


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
   LOAD COMPANIES
========================================= */

async function loadCompanies() {

    try {

        const companiesRef =
            firebaseFunctions.collection(
                db,
                "coneColourCompanies"
            );


        const snapshot =
            await firebaseFunctions.getDocs(
                companiesRef
            );


        companies = [];


        snapshot.forEach(
            function(docSnap) {

                const data =
                    docSnap.data();


                companies.push({

                    id:
                        docSnap.id,

                    name:
                        data.name || "",

                    createdAt:
                        data.createdAt || null,

                    updatedAt:
                        data.updatedAt || null

                });

            }
        );


        /*
         * Create default companies
         * when Firebase collection is empty
         */

        if (companies.length === 0) {

            for (
                const name of defaultCompanies
            ) {

                const docRef =
                    await firebaseFunctions.addDoc(
                        companiesRef,
                        {

                            name:
                                name,

                            createdAt:
                                firebaseFunctions.serverTimestamp(),

                            updatedAt:
                                firebaseFunctions.serverTimestamp()

                        }
                    );


                companies.push({

                    id:
                        docRef.id,

                    name:
                        name

                });

            }

        }


        sortCompanies();

        displayCompanies();


    } catch (error) {

        console.error(
            "Load companies error:",
            error
        );

        alert(
            "Could not load colour companies."
        );

    }

}


/* =========================================
   SORT COMPANIES
========================================= */

function sortCompanies() {

    companies.sort(
        function(a, b) {

            const aTime =
                getTimeValue(a.createdAt);

            const bTime =
                getTimeValue(b.createdAt);


            return aTime - bTime;

        }
    );

}


/* =========================================
   GET TIME VALUE
========================================= */

function getTimeValue(value) {

    if (!value) {
        return 0;
    }


    if (
        typeof value.toMillis ===
        "function"
    ) {

        return value.toMillis();

    }


    if (
        value.seconds !== undefined
    ) {

        return (
            Number(value.seconds) * 1000
        );

    }


    const time =
        new Date(value).getTime();


    return isNaN(time)
        ? 0
        : time;

}


/* =========================================
   DISPLAY COMPANIES
========================================= */

function displayCompanies() {

    companyList.innerHTML = "";


    if (companies.length === 0) {

        emptyMessage.style.display =
            "block";

        return;

    }


    emptyMessage.style.display =
        "none";


    companies.forEach(
        function(company, index) {

            const card =
                document.createElement("div");


            card.className =
                "company-card";


            /* =========================
               NUMBER
            ========================== */

            const number =
                document.createElement("div");

            number.className =
                "company-number";

            number.textContent =
                index + 1;


            /* =========================
               INFO
            ========================== */

            const info =
                document.createElement("div");

            info.className =
                "company-info";


            const heading =
                document.createElement("h3");

            heading.textContent =
                company.name;


            const subtitle =
                document.createElement("p");

            subtitle.textContent =
                "Yarn Colour Company";


            info.appendChild(
                heading
            );

            info.appendChild(
                subtitle
            );


            /* =========================
               ACTIONS
            ========================== */

            const actions =
                document.createElement("div");

            actions.className =
                "company-actions";


            const editBtn =
                document.createElement("button");

            editBtn.className =
                "edit-btn";

            editBtn.type =
                "button";

            editBtn.textContent =
                "✏️";


            const deleteBtn =
                document.createElement("button");

            deleteBtn.className =
                "delete-btn";

            deleteBtn.type =
                "button";

            deleteBtn.textContent =
                "🗑️";


            actions.appendChild(
                editBtn
            );

            actions.appendChild(
                deleteBtn
            );


            /* =========================
               CARD
            ========================== */

            card.appendChild(
                number
            );

            card.appendChild(
                info
            );

            card.appendChild(
                actions
            );


            /* =========================
               OPEN COMPANY
            ========================== */

            card.addEventListener(
                "click",
                function() {

                    window.location.href =
                        "Cone-colours.html?company=" +
                        encodeURIComponent(
                            company.name
                        );

                }
            );


            /* =========================
               EDIT
            ========================== */

            editBtn.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    openEditPopup(
                        company
                    );

                }
            );


            /* =========================
               DELETE
            ========================== */

            deleteBtn.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    deleteCompany(
                        company
                    );

                }
            );


            companyList.appendChild(
                card
            );

        }
    );

}


/* =========================================
   OPEN ADD POPUP
========================================= */

addBtn.addEventListener(
    "click",
    function() {

        editingId = null;


        popupTitle.textContent =
            "Add Colour Company";


        companyNameInput.value =
            "";


        errorMessage.textContent =
            "";


        popupOverlay.classList.add(
            "active"
        );


        setTimeout(
            function() {

                companyNameInput.focus();

            },
            100
        );

    }
);


/* =========================================
   OPEN EDIT POPUP
========================================= */

function openEditPopup(company) {

    editingId =
        company.id;


    popupTitle.textContent =
        "Edit Colour Company";


    companyNameInput.value =
        company.name;


    errorMessage.textContent =
        "";


    popupOverlay.classList.add(
        "active"
    );


    setTimeout(
        function() {

            companyNameInput.focus();

            companyNameInput.select();

        },
        100
    );

}


/* =========================================
   CLOSE POPUP
========================================= */

function closePopupBox() {

    popupOverlay.classList.remove(
        "active"
    );


    companyNameInput.value =
        "";


    errorMessage.textContent =
        "";


    editingId =
        null;

}


closePopup.addEventListener(
    "click",
    closePopupBox
);


cancelBtn.addEventListener(
    "click",
    closePopupBox
);


/* =========================================
   SAVE COMPANY
========================================= */

saveBtn.addEventListener(
    "click",
    async function() {

        const name =
            companyNameInput.value.trim();


        /* =========================
           VALIDATION
        ========================== */

        if (name === "") {

            errorMessage.textContent =
                "Please enter colour company name.";

            companyNameInput.focus();

            return;

        }


        /* =========================
           DUPLICATE CHECK
        ========================== */

        const duplicate =
            companies.some(
                function(company) {

                    return (
                        company.id !== editingId &&
                        company.name
                            .toLowerCase() ===
                        name.toLowerCase()
                    );

                }
            );


        if (duplicate) {

            errorMessage.textContent =
                "This company already exists.";

            return;

        }


        if (!db) {

            errorMessage.textContent =
                "Firebase is not connected.";

            return;

        }


        saveBtn.disabled =
            true;

        saveBtn.textContent =
            "Saving...";


        try {

            /* =========================
               EDIT
            ========================== */

            if (editingId !== null) {

                const companyRef =
                    firebaseFunctions.doc(
                        db,
                        "coneColourCompanies",
                        editingId
                    );


                await firebaseFunctions.setDoc(
                    companyRef,
                    {

                        name:
                            name,

                        updatedAt:
                            firebaseFunctions.serverTimestamp()

                    },
                    {
                        merge: true
                    }
                );

            }


            /* =========================
               ADD
            ========================== */

            else {

                await firebaseFunctions.addDoc(
                    firebaseFunctions.collection(
                        db,
                        "coneColourCompanies"
                    ),
                    {

                        name:
                            name,

                        createdAt:
                            firebaseFunctions.serverTimestamp(),

                        updatedAt:
                            firebaseFunctions.serverTimestamp()

                    }
                );

            }


            await loadCompanies();

            closePopupBox();


        } catch (error) {

            console.error(
                "Save company error:",
                error
            );

            errorMessage.textContent =
                "Could not save company.";

        }


        saveBtn.disabled =
            false;

        saveBtn.textContent =
            "Save";

    }
);
/* =========================================
   DELETE COMPANY
========================================= */

async function deleteCompany(company) {

    const confirmed =
        confirm(
            `Delete "${company.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await firebaseFunctions.deleteDoc(
            firebaseFunctions.doc(
                db,
                "coneColourCompanies",
                company.id
            )
        );


        await loadCompanies();


    } catch (error) {

        console.error(
            "Delete company error:",
            error
        );

        alert(
            "Could not delete company."
        );

    }

}


/* =========================================
   ENTER KEY
========================================= */

companyNameInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            saveBtn.click();

        }

    }
);


/* =========================================
   CLOSE OUTSIDE POPUP
========================================= */

popupOverlay.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            popupOverlay
        ) {

            closePopupBox();

        }

    }
);


/* =========================================
   BACK BUTTON
========================================= */

backBtn.addEventListener(
    "click",
    function() {

        window.location.href =
            "index.html";

    }
);


/* =========================================
   START FIREBASE
========================================= */

initializeFirebase();
