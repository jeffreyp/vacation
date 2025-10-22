// Firebase configuration - YOU NEED TO REPLACE THESE WITH YOUR OWN VALUES
// See README.md for setup instructions
const firebaseConfig = {
    apiKey: "AIzaSyCCaTuj37iBAkPBi7F_bEoFsAm-qMTxHkA",
    authDomain: "prattvacations-b03a1.firebaseapp.com",
    projectId: "prattvacations-b03a1",
    storageBucket: "prattvacations-b03a1.appspot.com",
    messagingSenderId: "617668195871",
    appId: "1:617668195871:web:dec271243b2b81c434c72a"
};

// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    updateDoc,
    doc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const addVacationForm = document.getElementById('add-vacation-form');
const vacationsList = document.getElementById('vacations-list');

let currentUser = null;

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        authSection.style.display = 'none';
        mainSection.style.display = 'block';
        loadVacations();
    } else {
        currentUser = null;
        authSection.style.display = 'block';
        mainSection.style.display = 'none';
    }
});

// Sign Up
signupBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Account created successfully!');
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

// Sign In
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

// Sign Out
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

// Add Vacation
addVacationForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('vacation-title').value;
    const link = document.getElementById('vacation-link').value;
    const month = document.getElementById('vacation-month').value;

    try {
        await addDoc(collection(db, 'vacations'), {
            title,
            link: link || null,
            preferredMonth: month,
            createdBy: currentUser.email,
            createdAt: serverTimestamp(),
            votes: [],
            voteCount: 0
        });

        // Reset form
        addVacationForm.reset();
    } catch (error) {
        alert(`Error adding vacation: ${error.message}`);
    }
});

// Load Vacations with Real-time Updates
function loadVacations() {
    const q = query(collection(db, 'vacations'), orderBy('voteCount', 'desc'));

    onSnapshot(q, (snapshot) => {
        vacationsList.innerHTML = '';

        if (snapshot.empty) {
            vacationsList.innerHTML = '<div class="empty-state">No vacation ideas yet. Add one above!</div>';
            return;
        }

        snapshot.forEach((doc) => {
            const vacation = doc.data();
            const vacationEl = createVacationElement(doc.id, vacation);
            vacationsList.appendChild(vacationEl);
        });
    });
}

// Create Vacation Element
function createVacationElement(id, vacation) {
    const div = document.createElement('div');
    div.className = 'vacation-item';

    const hasVoted = vacation.votes && vacation.votes.includes(currentUser.email);
    const voteCount = vacation.voteCount || 0;

    const titleHTML = vacation.link
        ? `<a href="${vacation.link}" target="_blank" rel="noopener noreferrer">${vacation.title}</a>`
        : vacation.title;

    const monthDisplay = vacation.preferredMonth === 'any'
        ? 'Any month'
        : vacation.preferredMonth;

    div.innerHTML = `
        <div class="vacation-header">
            <div class="vacation-info">
                <div class="vacation-title">${titleHTML}</div>
                <div class="vacation-meta">
                    <div class="vacation-month">
                        <span>📅</span>
                        <span>${monthDisplay}</span>
                    </div>
                    <div class="vacation-author">
                        <span>👤</span>
                        <span>${vacation.createdBy}</span>
                    </div>
                </div>
            </div>
            <div class="vote-section">
                <button class="vote-btn ${hasVoted ? 'voted' : ''}" data-id="${id}">
                    ${hasVoted ? '✓ Voted' : 'Vote'}
                </button>
                <div class="vote-count">${voteCount} vote${voteCount !== 1 ? 's' : ''}</div>
            </div>
        </div>
    `;

    // Add vote button listener
    const voteBtn = div.querySelector('.vote-btn');
    voteBtn.addEventListener('click', () => toggleVote(id, hasVoted));

    return div;
}

// Toggle Vote
async function toggleVote(vacationId, hasVoted) {
    const vacationRef = doc(db, 'vacations', vacationId);

    try {
        if (hasVoted) {
            // Remove vote
            await updateDoc(vacationRef, {
                votes: arrayRemove(currentUser.email),
                voteCount: arrayRemove(currentUser.email).length
            });
        } else {
            // Add vote
            await updateDoc(vacationRef, {
                votes: arrayUnion(currentUser.email),
                voteCount: arrayUnion(currentUser.email).length
            });
        }

        // Update vote count
        const vacationDoc = await getDoc(vacationRef);
        const votes = vacationDoc.data().votes || [];
        await updateDoc(vacationRef, {
            voteCount: votes.length
        });
    } catch (error) {
        alert(`Error voting: ${error.message}`);
    }
}

// Fix for vote count update
import { getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
