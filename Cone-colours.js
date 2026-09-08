// @ts-nocheck

/* =========================================
   CONE COLOURS
   FIREBASE VERSION
========================================= */


/* =========================================
   GET COMPANY NAME
========================================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const companyName =
    params.get("company") ||
    "Radhika Company";


/* =========================================
   SHOW COMPANY
========================================= */

document.getElementById(
    "companyName"
).textContent =
    companyName;


document.getElementById(
    "pageSubtitle"
).textContent =
    "View and manage colours for " +
    companyName;


/* =========================================
   FIREBASE
========================================= */

let db = null;

let firebaseFunctions = null;


/* =========================================
   DATA
========================================= */

let colours = [];

let editingId = null;


/* =========================================
   ELEMENTS
========================================= */

const colourList =
    document.getElementById(
        "colourList"
    );


const emptyMessage =
    document.getElementById(
        "emptyMessage"
    );


const addBtn =
    document.getElementById(
        "addBtn"
    );


const backBtn =
    document.getElementById(
        "backBtn"
    );


const popupOverlay =
    document.getElementById(
        "popupOverlay"
    );


const closePopup =
    document.getElementById(
        "closePopup"
    );


const cancelBtn =
    document.getElementById(
        "cancelBtn"
    );


const saveBtn =
    document.getElementById(
        "saveBtn"
    );


const colourNameInput =
    document.getElementById(
        "colourName"
    );


const shadeNoInput =
    document.getElementById(
        "shadeNo"
    );


const popupTitle =
    document.getElementById(
        "popupTitle"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


/* =========================================
   FIREBASE INITIALIZE
========================================= */

async function initializeFirebase() {

    try {

        const firebaseConfig =
            await import(
                "./firebase-config.js"
            );


        const firestore =
            await import(
                "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js"
            );


        db =
            firebaseConfig.db;


        firebaseFunctions =
            firestore;


        await loadColours();


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
   LOAD COLOURS
========================================= */

async function loadColours() {

    try {

        const coloursRef =
            firebaseFunctions.collection(
                db,
                "coneColours"
            );


        const snapshot =
            await firebaseFunctions.getDocs(
                coloursRef
            );


        colours = [];


        snapshot.forEach(
            function(docSnap) {

                const data =
                    docSnap.data();


                /*
                 * Only load colours belonging
                 * to this company
                 */

                if (
                    data.company &&
                    data.company.toLowerCase() ===
                    companyName.toLowerCase()
                ) {

                    colours.push({

                        id:
                            docSnap.id,

                        name:
                            data.name || "",

                        shade:
                            data.shade || "",

                        company:
                            data.company || "",

                        createdAt:
                            data.createdAt || null,

                        updatedAt:
                            data.updatedAt || null

                    });

                }

            }
        );


        /*
         * If Firebase has no colours,
         * check old localStorage data.
         */
        if (
            colours.length === 0
        ) {

            await migrateOldLocalStorage();

        }


        sortColours();

        displayColours();


    } catch (error) {

        console.error(
            "Load colours error:",
            error
        );


        alert(
            "Could not load colours."
        );

    }

}


/* =========================================
   MIGRATE OLD LOCALSTORAGE
========================================= */

async function migrateOldLocalStorage() {

    try {

        const storageKey =
            "coneColours_" +
            companyName;


        const oldData =
            localStorage.getItem(
                storageKey
            );


        if (!oldData) {

            return;

        }


        let oldColours;


        try {

            oldColours =
                JSON.parse(
                    oldData
                );

        } catch (error) {

            console.error(
                "Old colour data error:",
                error
            );

            return;

        }


        if (
            !Array.isArray(oldColours) ||
            oldColours.length === 0
        ) {

            return;

        }


        console.log(
            "Migrating old colours to Firebase..."
        );


        const coloursRef =
            firebaseFunctions.collection(
                db,
                "coneColours"
            );


        for (
            const item of oldColours
        ) {

            if (
                !item.name ||
                !item.shade
            ) {

                continue;

            }


            await firebaseFunctions.addDoc(
                coloursRef,
                {

                    name:
                        item.name,

                    shade:
                        item.shade,

                    company:
                        companyName,

                    createdAt:
                        firebaseFunctions.serverTimestamp(),

                    updatedAt:
                        firebaseFunctions.serverTimestamp()

                }
            );

        }


        /*
         * Remove old localStorage data
         * after successful migration.
         */

        localStorage.removeItem(
            storageKey
        );


        /*
         * Load the newly migrated
         * Firebase data.
         */

        const newSnapshot =
            await firebaseFunctions.getDocs(
                coloursRef
            );


        colours = [];


        newSnapshot.forEach(
            function(docSnap) {

                const data =
                    docSnap.data();


                if (
                    data.company &&
                    data.company.toLowerCase() ===
                    companyName.toLowerCase()
                ) {

                    colours.push({

                        id:
                            docSnap.id,

                        name:
                            data.name || "",

                        shade:
                            data.shade || "",

                        company:
                            data.company || "",

                        createdAt:
                            data.createdAt || null,

                        updatedAt:
                            data.updatedAt || null

                    });

                }

            }
        );


    } catch (error) {

        console.error(
            "Migration error:",
            error
        );

    }

}


/* =========================================
   SORT COLOURS
========================================= */

function sortColours() {

    colours.sort(
        function(a, b) {

            return (
                getTimeValue(
                    a.createdAt
                ) -
                getTimeValue(
                    b.createdAt
                )
            );

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
            Number(value.seconds) *
            1000
        );

    }


    const time =
        new Date(value).getTime();


    return isNaN(time)
        ? 0
        : time;

}


/* =========================================
   DISPLAY COLOURS
========================================= */

function displayColours() {

    colourList.innerHTML =
        "";


    if (
        colours.length === 0
    ) {

        emptyMessage.style.display =
            "block";

        return;

    }


    emptyMessage.style.display =
        "none";


    colours.forEach(
        function(item, index) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "colour-card";


            /* =========================
               NUMBER
            ========================== */

            const number =
                document.createElement(
                    "div"
                );


            number.className =
                "colour-number";


            number.textContent =
                index + 1;


            /* =========================
               INFO
            ========================== */

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "colour-info";


            const heading =
                document.createElement(
                    "h3"
                );


            heading.textContent =
                item.name;


            const shade =
                document.createElement(
                    "p"
                );


            shade.textContent =
                "Shade: " +
                item.shade;


            info.appendChild(
                heading
            );


            info.appendChild(
                shade
            );


            /* =========================
               ACTIONS
            ========================== */

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "colour-actions";


            const editBtn =
                document.createElement(
                    "button"
                );


            editBtn.className =
                "edit-btn";


            editBtn.type =
                "button";


            editBtn.textContent =
                "✏️";


            const deleteBtn =
                document.createElement(
                    "button"
                );


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
               EDIT
            ========================== */

            editBtn.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    openEditPopup(
                        item
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

                    deleteColour(
                        item
                    );

                }
            );


            /*
             * IMPORTANT:
             *
             * There is NO click event
             * on the card.
             *
             * Tapping the card does nothing.
             */


            colourList.appendChild(
                card
            );

        }
    );

}


/* =========================================
   ADD POPUP
========================================= */

addBtn.addEventListener(
    "click",
    function() {

        editingId = null;


        popupTitle.textContent =
            "Add Colour";


        colourNameInput.value =
            "";


        shadeNoInput.value =
            "";


        errorMessage.textContent =
            "";


        popupOverlay.classList.add(
            "active"
        );


        setTimeout(
            function() {

                colourNameInput.focus();

            },
            100
        );

    }
);


/* =========================================
   EDIT POPUP
========================================= */

function openEditPopup(item) {

    editingId =
        item.id;


    popupTitle.textContent =
        "Edit Colour";


    colourNameInput.value =
        item.name;


    shadeNoInput.value =
        item.shade;


    errorMessage.textContent =
        "";


    popupOverlay.classList.add(
        "active"
    );


    setTimeout(
        function() {

            colourNameInput.focus();

            colourNameInput.select();

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


    colourNameInput.value =
        "";


    shadeNoInput.value =
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
   SAVE COLOUR
========================================= */

saveBtn.addEventListener(
    "click",
    async function() {

        const name =
            colourNameInput.value.trim();


        const shade =
            shadeNoInput.value.trim();


        /* =========================
           VALIDATION
        ========================== */

        if (
            name === ""
        ) {

            errorMessage.textContent =
                "Please enter colour name.";

            colourNameInput.focus();

            return;

        }


        if (
            shade === ""
        ) {

            errorMessage.textContent =
                "Please enter shade number.";

            shadeNoInput.focus();

            return;

        }


        /* =========================
           DUPLICATE CHECK
        ========================== */

        const duplicate =
            colours.some(
                function(item) {

                    return (

                        item.id !==
                            editingId &&

                        item.name
                            .toLowerCase() ===
                            name.toLowerCase() &&

                        item.shade
                            .toLowerCase() ===
                            shade.toLowerCase()

                    );

                }
            );


        if (duplicate) {

            errorMessage.textContent =
                "This colour already exists.";

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

            if (
                editingId !== null
            ) {

                const colourRef =
                    firebaseFunctions.doc(
                        db,
                        "coneColours",
                        editingId
                    );


                await firebaseFunctions.setDoc(
                    colourRef,
                    {

                        name:
                            name,

                        shade:
                            shade,

                        company:
                            companyName,

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
                        "coneColours"
                    ),
                    {

                        name:
                            name,

                        shade:
                            shade,

                        company:
                            companyName,

                        createdAt:
                            firebaseFunctions.serverTimestamp(),

                        updatedAt:
                            firebaseFunctions.serverTimestamp()

                    }
                );

            }


            await loadColours();


            closePopupBox();


        } catch (error) {

            console.error(
                "Save colour error:",
                error
            );


            errorMessage.textContent =
                "Could not save colour.";

        }


        saveBtn.disabled =
            false;


        saveBtn.textContent =
            "Save";

    }
);
/* =========================================
   DELETE COLOUR
========================================= */

async function deleteColour(item) {

    const confirmed =
        confirm(
            `Delete "${item.name}" - Shade ${item.shade}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await firebaseFunctions.deleteDoc(
            firebaseFunctions.doc(
                db,
                "coneColours",
                item.id
            )
        );


        await loadColours();


    } catch (error) {

        console.error(
            "Delete colour error:",
            error
        );


        alert(
            "Could not delete colour."
        );

    }

}


/* =========================================
   ENTER KEY
========================================= */

shadeNoInput.addEventListener(
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
            "Cone-colours-company.html";

    }
);


/* =========================================
   START
========================================= */

initializeFirebase();