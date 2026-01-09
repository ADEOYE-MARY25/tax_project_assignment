# TaxQA NG – Intelligent Nigerian Tax Assistant 
## User Interface
### Desktop View
- [Landing Page] <img width="1597" height="768" alt="Image" src="https://github.com/user-attachments/assets/2f467b28-dc57-4727-82c2-d481049b2269" />
- [Dark mode] <img width="1598" height="764" alt="Image" src="https://github.com/user-attachments/assets/324d0b43-ff3f-4e7f-88dc-cc1a99560d92" />
- [Chat Page] <img width="1600" height="768" alt="Image" src="https://github.com/user-attachments/assets/26970f8f-3635-40a5-a33d-4a390c2fad7e" />
- [Login Page] <img width="1593" height="763" alt="Image" src="https://github.com/user-attachments/assets/6b55f6e6-c8e0-482c-b133-86cef3638e9b" />
- [signup Page] <img width="1595" height="765" alt="Image" src="https://github.com/user-attachments/assets/587b7f1a-82d4-485e-9687-f87712e3ec39" />
- [Authenticated Page] <img width="1595" height="757" alt="Image" src="https://github.com/user-attachments/assets/ad40e74f-476e-45fa-b5d2-7628ba39ea58" />

### Mobile View
- [Landing Page] <img width="419" height="675" alt="Image" src="https://github.com/user-attachments/assets/06f64766-4950-4c08-9e5a-26982ad0caba" />
- [Navbar ] <img width="393" height="692" alt="Image" src="https://github.com/user-attachments/assets/db831f92-5c4e-4166-abcc-8b3d96d2d5ae" />
- [Login Page] <img width="375" height="680" alt="Image" src="https://github.com/user-attachments/assets/b7cfadf9-8501-4fb0-be6a-6438ca68a82f" />
- [Signup Page] <img width="378" height="677" alt="Image" src="https://github.com/user-attachments/assets/5d05e0c4-6aa9-418a-bbe2-0dcf32e73262" />

The National Assembly just passed 4 tax reform bills that will completely change how Nigeria collects taxes starting January 2026.

**On Twitter, people are panicking:**
- I heard I'll pay 50% tax now!
- This will destroy the North!
- Small businesses will collapse!

But when you read the actual bills? Most of the panic is based on misinformation.

**Aunty Ngozi** runs a small restaurant in Lagos. She heard about the tax reforms on the radio and is terrified she'll pay more tax. But she doesn't know where to find the actual bills or how to understand them.

**Chidi** is a software developer. He wants to know if his income tax will increase or decrease, but the 200-page bill is too dense to read.

**Governor Yahaya** is worried about how VAT derivation will affect his state's revenue, but he's getting conflicting information from advisors.

This TaxQA NG is a modern, responsive, AI-powered web application designed to help users understand and navigate **Nigerian tax policies** through natural language conversations.  
It delivers a ChatGPT-style experience with authentication, conversation management, theme toggling, and real-time AI responses.

This repository contains the **frontend implementation**, built with **React and Tailwind CSS**, and designed to integrate seamlessly with a FastAPI backend.



##  Core Features

###  AI-Powered Tax Conversations
- Ask natural language questions about Nigerian tax policies
- AI responses generated in real time
- Response generation time displayed per message

###  Chat Experience
- Clear separation of user and AI messages
- Edit and regenerate previous user questions
- Copy AI responses to clipboard
- Loading animation during AI response generation

###  Authentication
- User signup and login
- JWT-based authentication
- Token persistence via `localStorage`
- Auth-aware UI and protected flows

### Theme System
- Light and Dark mode toggle
- Global theme state
- Fully Tailwind-based styling

### Responsive Design
- Optimized for mobile, tablet, and desktop
- Sidebar converts to slide-in menu on mobile
- Responsive input bars and layout

### Conversation Utilities
- New chat initiation
- Recent searches (state-ready for persistence)
- Smooth navigation without page reloads



##  Tech Stack

| Layer | Technology |
|-----|-----------|
| Frontend | React (Functional Components) |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| State Management | React Hooks |
| Routing | Internal state routing |
| API Communication | Fetch wrapper |
| Authentication | JWT |
| Backend  | FastAPI |



## Project Structure

src/
├── components/
│ ├── AIMessage.jsx
│ ├── UserMessage.jsx
│ ├── ChatPage.jsx
│ ├── LandingPage.jsx
│ ├── InputBar.jsx
│ ├── LoadingAnimation.jsx
│ ├── Header.jsx
│ ├── Navbar.jsx
│ ├── LoginPage.jsx
│ ├── SignupPage.jsx
│
├── utils/
│ ├── api.js
│ ├── validation.js
│
├── assets/
│ └── logo.png
│
├── App.jsx
└── main.jsx





##  Component Overview

### App.jsx
- Root component and global state manager
- Handles authentication, theming, messages, and navigation
- Coordinates API calls and chat lifecycle

### ChatPage
- Renders the full chat interface
- Displays user messages, AI responses, and loading states
- Integrates editing, regeneration, and copy actions

### AIMessage
- Displays AI responses
- Copy-to-clipboard support
- Response generation time indicator

### UserMessage
- Displays user messages
- Inline editing
- Regenerate AI response from edited input

### InputBar
- Shared input component for landing and chat pages
- Responsive layout
- Supports “Enter to send”

### LandingPage
- Initial user experience
- Encourages first interaction
- Transitions automatically to chat view

### Navbar
- Desktop sidebar and mobile slide-in menu
- New chat, recent searches, logout, and theme toggle

### Header
- App branding and logo
- Auth-aware actions (Login / Signup or User avatar)



##  API Integration

All API communication is centralized via a fetch utility.

### Base URL
```bash
http://127.0.0.1:8000
```



### Endpoints Used

| Endpoint | Method | Purpose |
|--------|--------|--------|
| `/register` | POST | User registration |
| `/login` | POST | User authentication |
| `/me` | GET | Fetch authenticated user |
| `/query` | POST | Generate AI response |
| `/session` | GET | 
| `/reset` | POST |
| `/debug/retrieval` | GET |

### Authentication
- JWT stored in `localStorage`
- Automatically attached to requests using:
- Authorization: Bearer <token>
  

## Validation & Security

### Email Validation
- Standard regex-based validation

### Password Requirements
- Minimum 8 characters
- At least:
- One uppercase letter
- One lowercase letter
- One number

### Password Strength Indicator
- Visual meter ranging from Weak to Strong


##  Theming System

- Global `isDarkMode` state
- Tailwind conditional class rendering
- Consistent appearance across all pages



##  Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/ADEOYE-MARY25/tax_project_assignment.git
cd tax-policy
```
### 2. Install Dwpendencies
```bash
npm install react-router-dom
npm install lucide-react
npm install tailwindcss @tailwindcss/vite
```

### 3. Run Development Server
```bash
npm run dev
```

4. Backend Requirement
Ensure the FastAPI backend is running at:
```bash
http://127.0.0.1:8000
```



## Developers and Engineers
1. Bankole Babafemi Usman (developer) ([Github](https://github.com/babafemibank))
2. Adeoye Mary Funmilayo (Engineer) ([Github](https://github.com/ADEOYE-MARY25))
3. Okemakinde Sherif S. (Engineer) ([Github](https://github.com/cheryvmak))
4. esther m. egharevba(Developer) ([Github](https://github.com/Egharevb9))
