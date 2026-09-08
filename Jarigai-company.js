// @ts-nocheck

/* =========================================
   JARIGAI COMPANY SYSTEM
   FIREBASE VERSION
========================================= */


/* =========================================
   DEFAULT COMPANIES
========================================= */

const defaultCompanies = [
    "Sri Lakshmi Jarigai",
    "Raja Jarigai",
    "Kumar Jarigai"
];


/* =========================================
   FIREBASE
========================================= */

let db = null;

let firebaseFunctions = null;


/*
   Your HTML currently loads this file
   as a normal script.

   So Firebase is loaded dynamically.
*/

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


        console.log(
            "Firebase connected"
        );


        await loadCompanies();


    } catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );


        alert(
            "Firebase connection failed.\n\n" +
            error.message
        );

    }

}


/* =========================================
   ELEMENTS
========================================= */

const companyList =
    document.getElementById(
        "companyList"
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


const companyNameInput =
    document.getElementById(
        "companyName"
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
   DATA
========================================= */


/*
   Each company is stored as:

   {
       id: Firebase document ID,
       name: company name,
       createdAt: timestamp,
       updatedAt: timestamp
   }
*/

let companies = [];


let editingId = null;


/* =========================================
   FIREBASE COLLECTION
========================================= */

function getCompaniesCollection() {

    return firebaseFunctions.collection(
        db,
        "jarigaiCompanies"
    );

}


/* =========================================
   LOAD COMPANIES FROM FIREBASE
========================================= */

async function loadCompanies() {

    try {

        const snapshot =
            await firebaseFunctions.getDocs(
                getCompaniesCollection()
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
                        data.createdAt || 0,

                    updatedAt:
                        data.updatedAt || 0

                });

            }
        );


        /*
           If Firebase is empty,
           create the three default companies.
        */

        if (companies.length === 0) {

            await createDefaultCompanies();

        }


        /*
           Newest company first.
        */

        companies.sort(
            function(a, b) {

                return (
                    Number(b.createdAt || 0) -
                    Number(a.createdAt || 0)
                );

            }
        );


        displayCompanies();


        console.log(
            "Jarigai companies loaded from Firebase"
        );


    } catch (error) {

        console.error(
            "Firebase load error:",
            error
        );


        alert(
            "Could not load Jarigai companies.\n\n" +
            error.code +
            "\n\n" +
            error.message
        );

    }

}


/* =========================================
   CREATE DEFAULT COMPANIES
========================================= */

async function createDefaultCompanies() {

    const now =
        Date.now();


    for (
        let i = 0;
        i < defaultCompanies.length;
        i++
    ) {

        const name =
            defaultCompanies[i];


        await firebaseFunctions.addDoc(
            getCompaniesCollection(),
            {

                name:
                    name,

                createdAt:
                    now + i,

                updatedAt:
                    now + i

            }
        );

    }


    /*
       Load them again from Firebase.
    */

    const snapshot =
        await firebaseFunctions.getDocs(
            getCompaniesCollection()
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
                    data.createdAt || 0,

                updatedAt:
                    data.updatedAt || 0

            });

        }
    );

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
                document.createElement(
                    "div"
                );


            card.className =
                "company-card";


            /*
               Build card safely.
            */

            const number =
                document.createElement(
                    "div"
                );

            number.className =
                "company-number";

            number.textContent =
                index + 1;


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "company-info";


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                company.name;


            const subtitle =
                document.createElement(
                    "p"
                );

            subtitle.textContent =
                "Jarigai Cone Company";


            info.appendChild(title);

            info.appendChild(subtitle);


            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "company-actions";


            /*
               EDIT BUTTON
            */

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


            /*
               DELETE BUTTON
            */

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
            ========================= */

            card.addEventListener(
                "click",
                function() {

                    window.location.href =
                        "Jarigai-stock.html?company=" +
                        encodeURIComponent(
                            company.name
                        );

                }
            );


            /* =========================
               EDIT
            ========================= */

            editBtn.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    openEditPopup(
                        company.id
                    );

                }
            );


            /* =========================
               DELETE
            ========================= */

            deleteBtn.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();

                    deleteCompany(
                        company.id
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

        editingId =
            null;


        popupTitle.textContent =
            "Add Jarigai Company";


        companyNameInput.value =
            "";


        errorMessage.textContent =
            "";


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


/* =========================================
   OPEN EDIT POPUP
========================================= */

function openEditPopup(id) {

    const company =
        companies.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!company) {

        return;

    }


    editingId =
        id;


    popupTitle.textContent =
        "Edit Jarigai Company";


    companyNameInput.value =
        company.name;


    errorMessage.textContent =
        "";


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


/* =========================================
   CLOSE POPUP
========================================= */

function closePopupBox() {

    popupOverlay.classList.remove(
        "show"
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
   FIREBASE
========================================= */

saveBtn.addEventListener(
    "click",
    async function() {

        const name =
            companyNameInput.value.trim();


        /*
           Empty name
        */

        if (name === "") {

            errorMessage.textContent =
                "Please enter jarigai company name.";

            companyNameInput.focus();

            return;

        }


        /*
           Duplicate checking
        */

        const duplicate =
            companies.some(
                function(company) {

                    return (
                        company.id !==
                        editingId &&

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


        saveBtn.disabled =
            true;


        saveBtn.textContent =
            "Saving...";


        try {

            /* =========================
               EDIT EXISTING COMPANY
            ========================= */

            if (editingId !== null) {

                const updatedData = {

                    name:
                        name,

                    updatedAt:
                        Date.now()

                };


                await firebaseFunctions.setDoc(

                    firebaseFunctions.doc(
                        db,
                        "jarigaiCompanies",
                        editingId
                    ),

                    updatedData,

                    {
                        merge: true
                    }

                );


                const index =
                    companies.findIndex(
                        function(company) {

                            return (
                                company.id ===
                                editingId
                            );

                        }
                    );


                if (index !== -1) {

                    companies[index].name =
                        name;

                    companies[index].updatedAt =
                        Date.now();

                }

            }


            /* =========================
               ADD NEW COMPANY
            ========================= */

            else {

                const newData = {

                    name:
                        name,

                    createdAt:
                        Date.now(),

                    updatedAt:
                        Date.now()

                };


                const docRef =
                    await firebaseFunctions.addDoc(

                        getCompaniesCollection(),

                        newData

                    );


                companies.unshift({

                    id:
                        docRef.id,

                    ...newData

                });

            }


            displayCompanies();

            closePopupBox();


            console.log(
                "Jarigai company saved to Firebase"
            );


        } catch (error) {

            console.error(
                "Firebase save error:",
                error
            );


            errorMessage.textContent =
                "Could not save company.";


            alert(
                "Firebase save error.\n\n" +
                error.code +
                "\n\n" +
                error.message
            );

        } finally {

            saveBtn.disabled =
                false;

            saveBtn.textContent =
                "Save";

        }

    }
);
/* =========================================
   DELETE COMPANY
   FIREBASE
========================================= */

async function deleteCompany(id) {

    const company =
        companies.find(
            function(item) {
                return item.id === id;
            }
        );


    if (!company) {
        return;
    }


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
                "jarigaiCompanies",
                id
            )

        );


        companies =
            companies.filter(
                function(item) {
                    return item.id !== id;
                }
            );


        displayCompanies();


        console.log(
            "Jarigai company deleted from Firebase"
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


/* =========================================
   ENTER KEY TO SAVE
========================================= */

companyNameInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            saveBtn.click();

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
   CLOSE POPUP BY TAPPING OUTSIDE
========================================= */

popupOverlay.addEventListener(
    "click",
    function(event) {

        if (
            event.target === popupOverlay
        ) {

            closePopupBox();

        }

    }
);


/* =========================================
   START FIREBASE
========================================= */

initializeFirebase();
