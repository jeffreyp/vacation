# Family Vacation Planner

A simple web app for families to propose vacation ideas, vote on them, and see everyone's preferences in real-time.

## Features

- Add vacation ideas with title, optional link, and preferred month
- Vote on vacation ideas (one vote per user)
- Real-time updates when anyone adds or votes
- Simple email/password authentication
- Mobile-friendly design
- Sorted by popularity (most votes first)

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "family-vacation")
4. Disable Google Analytics (optional, not needed for this app)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click on "Email/Password" under "Sign-in method"
4. Enable "Email/Password" (toggle the switch)
5. Click "Save"

### 3. Create Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in test mode" (you can update security rules later)
4. Choose a location closest to your family
5. Click "Enable"

### 4. Update Firestore Security Rules (Optional but Recommended)

1. In Firestore Database, go to the "Rules" tab
2. Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /vacations/{vacation} {
      // Anyone authenticated can read
      allow read: if request.auth != null;
      // Anyone authenticated can create
      allow create: if request.auth != null;
      // Anyone authenticated can update (for voting)
      allow update: if request.auth != null;
      // Only the creator can delete
      allow delete: if request.auth != null &&
                       request.auth.token.email == resource.data.createdBy;
    }
  }
}
```

3. Click "Publish"

### 5. Get Your Firebase Config

1. Click the gear icon next to "Project Overview" and select "Project settings"
2. Scroll down to "Your apps" and click the web icon `</>`
3. Register your app with a nickname (e.g., "vacation-app")
4. Copy the `firebaseConfig` object values

### 6. Configure the App

1. Copy the config template file:
   ```bash
   cp config.template.js config.js
   ```

2. Open `config.js` in your text editor (NOT `app.js`)
3. Replace the placeholder values with your actual Firebase values from step 5:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

**IMPORTANT**: The `config.js` file is gitignored and should NEVER be committed to git. Only modify this file locally.

### 7. Deploy to GitHub Pages

1. Create a new GitHub repository
2. Push these files to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. In your GitHub repository, go to Settings > Pages
4. Under "Source", select "main" branch and "/" (root) folder
5. Click "Save"
6. Your site will be available at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### 8. Create User Accounts

1. Visit your deployed site
2. Each family member should click "Sign Up"
3. Create an account with email and password
4. Now everyone can add vacation ideas and vote!

## Usage

- **Add a vacation**: Fill in the title, optional link (e.g., hotel website), and preferred month
- **Vote**: Click the "Vote" button on any vacation idea
- **Unvote**: Click "✓ Voted" to remove your vote
- **View results**: Vacations are automatically sorted by most votes

## Local Development

To test locally before deploying:

1. Install a local web server (Python example):
   ```bash
   python3 -m http.server 8000
   ```

2. Visit `http://localhost:8000` in your browser

## Tips

- Use a family email or ask everyone to use their personal email for signup
- Passwords must be at least 6 characters
- The link field accepts any URL (Airbnb, hotel websites, blog posts, etc.)
- Everyone sees updates in real-time without refreshing!

## Troubleshooting

- **"Firebase not configured"**: Make sure you've replaced the config values in `app.js`
- **"Permission denied"**: Check your Firestore security rules
- **Can't sign up**: Check that Email/Password auth is enabled in Firebase Console
- **Changes not showing**: Make sure you've saved `app.js` with your Firebase config and re-deployed
