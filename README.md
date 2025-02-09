# Job Application Tracker

A modern, interactive web application for tracking job applications, interviews, and offers. Built with vanilla JavaScript and integrated with Google Calendar for seamless interview scheduling.

![Job Application Tracker](https://github.com/user-attachments/assets/d7eec19e-4939-4e63-b086-4be53f5f7a62)

## Features

- 🔍 **Job Search**: Search and fetch job listings from Adzuna API
- 📋 **Kanban Board Layout**: Organize jobs in different stages:
  - Job Listings
  - Applied Jobs
  - Interviews
  - Offers
- 📅 **Interview Management**:
  - Schedule interviews with Google Calendar integration
  - Track upcoming interviews
  - Record past interviews
  - Drag and drop completed interviews to the offer section
- 💾 **Data Persistence**: All data is saved in localStorage
- 🎨 **Modern UI/UX**:
  - Responsive design
  - Smooth animations
  - Drag and drop functionality
  - Modal dialogs

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/job-application-tracker.git
cd job-application-tracker
```

2. Set up Google Calendar API:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Add your credentials to `calendar-config.js`

3. Set up Adzuna API:
   - Sign up for an API key at [Adzuna API](https://developer.adzuna.com/)
   - Replace the `API_ID` and `API_KEY` in `script.js` with your credentials

4. Serve the application:
   - Use a local development server (e.g., Live Server in VS Code)
   - Or use Python's built-in server:
```bash
python -m http.server 8000
```

## Usage

1. **Search for Jobs**:
   - Enter a job title in the search bar
   - Press Enter or click the search button
   - Jobs will appear in the Job Listings section

2. **Track Applications**:
   - Click "Apply" on a job listing to move it to the Applied section
   - Jobs in the Applied section can be scheduled for interviews

3. **Manage Interviews**:
   - Click "Schedule Interview" on an applied job
   - Fill in the interview details in the modal
   - The interview will be added to your Google Calendar
   - View all upcoming interviews in the Upcoming Interviews section

4. **Track Offers**:
   - After completing an interview, click "Mark as Done"
   - The interview will move to Past Interviews
   - Drag completed interviews to the Offers section if you receive an offer

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Google Calendar API
- Adzuna Jobs API
- LocalStorage for data persistence

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Acknowledgments

- Adzuna API for job listings
- Google Calendar API for interview scheduling
- Inter font family by Rasmus Andersson 
