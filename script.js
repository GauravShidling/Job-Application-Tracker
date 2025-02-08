// Add this at the beginning of your script.js
let modal = null;
let closeBtn = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for Enter key on search input
    const searchInput = document.getElementById("jobSearch");
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                fetchJobs();
            }
        });
    }

    modal = document.getElementById("scheduleModal");
    closeBtn = document.querySelector('.close');
    
    if (modal && closeBtn) {
        // Close modal when clicking the X
        closeBtn.onclick = () => {
            modal.style.display = "none";
        };

        // Close modal when clicking outside
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        };
    }

    // Clear any default content first
    clearDefaultContent();
    
    // Load saved positions from localStorage
    loadSavedPositions();
    
    // Load saved interviews
    loadSavedInterviews();
});

document.addEventListener("DOMContentLoaded", function () {
    const jobContainers = document.querySelectorAll(".job-container");

    jobContainers.forEach(container => {
        // Highlight drop zones
        container.addEventListener("dragenter", (e) => {
            e.preventDefault();
            container.classList.add("drag-hover");
        });

        container.addEventListener("dragleave", (e) => {
            e.preventDefault();
            container.classList.remove("drag-hover");
        });

        container.addEventListener("dragover", (e) => {
            e.preventDefault();
            const dragging = document.querySelector(".dragging");
            if (!dragging) return;

            const closestItem = getClosestJobItem(container, e.clientY);
            
            if (closestItem) {
                container.insertBefore(dragging, closestItem);
            } else {
                container.appendChild(dragging);
            }
        });

        container.addEventListener("drop", (e) => {
            e.preventDefault();
            container.classList.remove("drag-hover");
            const dragging = document.querySelector(".dragging");
            if (dragging) {
                dragging.classList.remove("dragging");
                // Add a nice drop animation
                dragging.classList.add("dropped");
                setTimeout(() => {
                    dragging.classList.remove("dropped");
                }, 300);
                saveJobPositions();
            }
        });
    });

    // Load saved job positions from localStorage on page load
    loadJobPositions();

    const pastInterviewsContainer = document.querySelector("#interview .job-container");
    const offerContainer = document.querySelector("#offer .job-container");

    if (pastInterviewsContainer && offerContainer) {
        // Make past interviews draggable
        pastInterviewsContainer.addEventListener("dragover", (e) => {
            e.preventDefault();
            const dragging = document.querySelector(".dragging");
            if (dragging && dragging.classList.contains('past-interview-card')) {
                pastInterviewsContainer.classList.add("drag-hover");
            }
        });

        // Make offer section droppable
        offerContainer.addEventListener("dragover", (e) => {
            e.preventDefault();
            const dragging = document.querySelector(".dragging");
            // Only allow past interview cards to be dropped
            if (dragging && dragging.classList.contains('past-interview-card')) {
                offerContainer.classList.add("drag-hover");
            }
        });

        offerContainer.addEventListener("dragleave", (e) => {
            e.preventDefault();
            offerContainer.classList.remove("drag-hover");
        });

        offerContainer.addEventListener("drop", (e) => {
            e.preventDefault();
            offerContainer.classList.remove("drag-hover");
            const dragging = document.querySelector(".dragging");
            if (dragging && dragging.classList.contains('past-interview-card')) {
                // Remove the status tag when moving to offer section
                const statusTag = dragging.querySelector('.status');
                if (statusTag) {
                    statusTag.remove();
                }
                
                dragging.classList.remove("dragging");
                // Add a nice drop animation
                dragging.classList.add("dropped");
                offerContainer.appendChild(dragging);
                setTimeout(() => {
                    dragging.classList.remove("dropped");
                }, 300);
                saveJobPositions();
            }
        });

        // Prevent dropping on other sections
        const jobListContainer = document.querySelector("#job-list .job-container");
        const appliedContainer = document.querySelector("#applied .job-container");

        [jobListContainer, appliedContainer].forEach(container => {
            if (container) {
                container.addEventListener("dragover", (e) => {
                    const dragging = document.querySelector(".dragging");
                    if (dragging && dragging.classList.contains('past-interview-card')) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "none"; // Show "not-allowed" cursor
                    }
                });
            }
        });
    }
});

// Helper function to get the closest job item below the cursor
function getClosestJobItem(container, y) {
    const jobItems = Array.from(container.querySelectorAll(".job-item:not(.dragging)"));

    return jobItems.reduce((closest, item) => {
        const box = item.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: item };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 🔹 Adzuna API Credentials
const BASE_URL = "https://api.adzuna.com/v1/api/jobs/us/search/1";
const API_ID = "a4e7f047";  // Your Adzuna App ID
const API_KEY = "9df4de4c116203076d297303ca64dd6a";  // Your Adzuna API Key

// 🔹 Fetch Jobs from Adzuna API
async function fetchJobs() {
    const jobTitle = document.getElementById("jobSearch").value.trim();
    if (!jobTitle) {
        alert("Please enter a job title!");
        return;
    }

    const url = `${BASE_URL}?app_id=${API_ID}&app_key=${API_KEY}&what=${jobTitle}&where=Remote`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            displayJobs(data.results);
            
            // Scroll to job listings section
            const jobListSection = document.getElementById("job-list");
            if (jobListSection) {
                jobListSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start'
                });
            }
        } else {
            alert("No jobs found. Try another search.");
        }
    } catch (error) {
        console.error("Error fetching jobs:", error);
    }
}

// 🔹 Display Jobs in the Job Listings Column
function displayJobs(jobs) {
    console.log("Displaying jobs...");
    const jobListContainer = document.querySelector("#job-list .job-container");
    
    if (!jobListContainer) {
        console.error("Job list container not found!");
        return;
    }
    
    jobListContainer.innerHTML = "";

    jobs.slice(0, 5).forEach(job => {
        const jobItem = document.createElement("div");
        jobItem.classList.add("job-item");
        jobItem.draggable = true;
        jobItem.dataset.jobId = job.id;

        jobItem.innerHTML = `
            <div class="job-header">
                <h4>${job.title}</h4>
                <button class="delete-btn" aria-label="Delete job">×</button>
            </div>
            <div class="job-details">
                <p><strong>Company:</strong> ${job.company.display_name}</p>
                <p><strong>Location:</strong> ${job.location.display_name}</p>
                <div class="job-actions">
                    <a href="${job.redirect_url}" target="_blank" class="apply-btn" data-job-id="${job.id}">Apply Now</a>
                    <button class="schedule-interview" disabled>Schedule Interview</button>
                </div>
            </div>
        `;

        // Add event listeners
        const scheduleBtn = jobItem.querySelector('.schedule-interview');
        if (scheduleBtn) {
            scheduleBtn.addEventListener('click', () => {
                handleScheduleInterview(job.title, job.company.display_name, jobItem);
            });
        }

        // Add apply button functionality
        const applyBtn = jobItem.querySelector('.apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', (e) => {
                // Don't prevent default - let the link open in new tab
                handleJobApply(jobItem, job);
            });
        }

        // Add delete button functionality
        const deleteBtn = jobItem.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                jobItem.classList.add('fade-out');
                setTimeout(() => {
                    jobItem.remove();
                    saveJobPositions();
                }, 300);
            });
        }

        // Add drag events
        jobItem.addEventListener("dragstart", (e) => {
            e.dataTransfer.effectAllowed = "move";
            jobItem.classList.add("dragging");
        });

        jobItem.addEventListener("dragend", () => {
            jobItem.classList.remove("dragging");
        });

        jobListContainer.appendChild(jobItem);
    });

    // Enable schedule buttons if APIs are initialized
    if (window.gapiInited && window.gisInited) {
        document.querySelectorAll('.schedule-interview').forEach(btn => {
            btn.disabled = false;
        });
    }

    try {
        saveJobPositions();
    } catch (error) {
        console.log("Error in initial save:", error);
    }
}

// Function to handle job application
function handleJobApply(jobItem, jobData) {
    // Get the Applied section container
    const appliedContainer = document.querySelector("#applied .job-container");
    if (!appliedContainer) return;

    // Wait a brief moment to ensure the link click is processed
    setTimeout(() => {
        // Clone the job item
        const clonedItem = jobItem.cloneNode(true);
        
        // Remove the Apply Now button from the cloned item
        const jobActions = clonedItem.querySelector('.job-actions');
        const applyBtn = clonedItem.querySelector('.apply-btn');
        if (applyBtn) {
            applyBtn.remove();
        }
        
        // Add animation class for smooth transition
        clonedItem.classList.add('move-to-applied');
        
        // Re-attach event listeners to the cloned item
        attachJobItemEventListeners(clonedItem, jobData);
        
        // Add to Applied section
        appliedContainer.appendChild(clonedItem);
        
        // Remove original item from job listings with animation
        jobItem.style.opacity = '0';
        jobItem.style.transform = 'scale(0.9)';
        jobItem.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            jobItem.remove();
            // Save the updated positions
            saveJobPositions();
        }, 300);
    }, 100);
}

// Function to attach event listeners to job items
function attachJobItemEventListeners(jobItem, jobData) {
    // Reattach schedule interview button listener
    const scheduleBtn = jobItem.querySelector('.schedule-interview');
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', () => {
            handleScheduleInterview(jobData.title, jobData.company.display_name, jobItem);
        });
    }

    // Only reattach apply button listener if it exists (not in Applied section)
    const applyBtn = jobItem.querySelector('.apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            handleJobApply(jobItem, jobData);
        });
    }

    // Reattach delete button listener
    const deleteBtn = jobItem.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            jobItem.classList.add('fade-out');
            setTimeout(() => {
                jobItem.remove();
                saveJobPositions();
            }, 300);
        });
    }

    // Reattach drag events
    jobItem.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        jobItem.classList.add("dragging");
    });

    jobItem.addEventListener("dragend", () => {
        jobItem.classList.remove("dragging");
        saveJobPositions();
    });
}

// Add this CSS animation
const style = document.createElement('style');
style.textContent += `
    @keyframes moveToApplied {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        100% {
            transform: scale(1);
        }
    }

    .move-to-applied {
        animation: moveToApplied 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);

// 🔹 Save Job Positions in LocalStorage
function saveJobPositions() {
    const columns = document.querySelectorAll('.column');
    const positions = {};
    
    columns.forEach((column, columnIndex) => {
        // Skip saving job-list section
        if (column.id === 'job-list') return;
        
        const jobContainer = column.querySelector('.job-container');
        if (jobContainer) {
            const jobs = jobContainer.querySelectorAll('.job-item');
            positions[columnIndex] = Array.from(jobs).map(job => {
                return {
                    title: job.querySelector('h4')?.textContent || '',
                    company: job.querySelector('p:first-of-type')?.textContent || '',
                    location: job.querySelector('p:last-of-type')?.textContent || '',
                    applyLink: job.querySelector('.apply-btn')?.href || '',
                    jobId: job.dataset.jobId
                };
            });
        }
    });

    saveToLocalStorage('jobPositions', positions);
}

// 🔹 Load Job Positions from LocalStorage on Page Load
function loadJobPositions() {
    const savedPositions = getFromLocalStorage('jobPositions');
    if (!savedPositions) return;

    Object.entries(savedPositions).forEach(([columnIndex, jobs]) => {
        const column = document.querySelectorAll('.column')[columnIndex];
        if (!column) return;

        const jobContainer = column.querySelector('.job-container');
        if (!jobContainer) return;

        jobs.forEach(job => {
            const jobItem = createJobItem(job);
            jobContainer.appendChild(jobItem);
        });
    });
}

// Helper function to create job items
function createJobItem(job) {
    const jobItem = document.createElement("div");
    jobItem.classList.add("job-item");
    jobItem.dataset.jobId = job.jobId;

    // Check if this is for the Applied section
    const isApplied = job.company.startsWith('Company:');

    jobItem.innerHTML = `
        <div class="job-header">
            <h4>${job.title}</h4>
            <button class="delete-btn" aria-label="Delete job">×</button>
        </div>
        <div class="job-details">
            <p>${job.company}</p>
            <p>${job.location}</p>
            <div class="job-actions">
                ${!isApplied ? 
                    `<a href="${job.applyLink}" target="_blank" class="apply-btn">Apply Now</a>` 
                    : ''
                }
                <button class="schedule-interview" ${window.gapiInited && window.gisInited ? '' : 'disabled'}>Schedule Interview</button>
            </div>
        </div>
    `;

    // Add event listeners
    const deleteBtn = jobItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        // Add fade out animation
        jobItem.classList.add('fade-out');
        
        setTimeout(() => {
            // Get the parent column to identify which section this job is in
            const parentColumn = jobItem.closest('.column');
            if (parentColumn && parentColumn.id === 'applied') {
                // Remove from localStorage if in Applied section
                const savedPositions = getFromLocalStorage('jobPositions') || {};
                Object.entries(savedPositions).forEach(([columnIndex, jobs]) => {
                    savedPositions[columnIndex] = jobs.filter(savedJob => 
                        savedJob.jobId !== job.jobId
                    );
                });
                saveToLocalStorage('jobPositions', savedPositions);
            }
            
            jobItem.remove();
            saveJobPositions();
        }, 300);
    });

    const scheduleBtn = jobItem.querySelector('.schedule-interview');
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', () => {
            const companyName = job.company.replace('Company:', '').trim();
            handleScheduleInterview(job.title, companyName, jobItem);
        });
    }

    // Only add apply button listener if it exists
    const applyBtn = jobItem.querySelector('.apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            handleJobApply(jobItem, job);
        });
    }

    return jobItem;
}

// Add this new code for handling calendar functionality
function handleScheduleInterview(jobTitle, companyName, jobItem) {
    console.log("Handling schedule interview for:", jobTitle);
    
    // Create a formatted list of test emails
    const testEmails = [
        'gaurav.24bcs10069@sst.scaler.com',
        'Mrinal.Bhattacharya@scaler.com',
        'gauravshidling@gmail.com'
    ];

    const emailList = testEmails.map(email => `• ${email}`).join('\n');
    
    const testUserMessage = `🔒 Testing Phase Access Only\n\n` +
        `This application is currently in testing phase.\n` +
        `Only the following email addresses have access:\n\n` +
        `${emailList}\n\n` +
        `If you have one of these emails, click OK to proceed with Google Sign-in.\n` +
        `Otherwise, click Cancel.`;
    
    if (!confirm(testUserMessage)) {
        return;
    }

    // First, check if user is authenticated
    if (!gapi.client.getToken()) {
        window.tokenClient.callback = async (response) => {
            if (response.error !== undefined) {
                if (response.error === 'access_denied') {
                    alert('Authentication failed. Please make sure you are using one of the authorized test emails.');
                    return;
                }
                throw (response);
            }
            console.log("User authenticated successfully");
            showScheduleModal(jobTitle, companyName, jobItem);
        };
        window.tokenClient.requestAccessToken();
        return;
    }
    
    showScheduleModal(jobTitle, companyName, jobItem);
}

// Separate function to show the modal
function showScheduleModal(jobTitle, companyName, jobItem) {
    const modal = document.getElementById("scheduleModal");
    if (!modal) {
        console.error("Modal not found!");
        return;
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('interviewDate');
    if (dateInput) {
        dateInput.min = today;
    }

    const titleInput = document.getElementById('interviewTitle');
    if (titleInput) {
        titleInput.value = `Interview for ${jobTitle} at ${companyName}`;
    }

    modal.style.display = "block";

    const form = document.getElementById('scheduleForm');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                await createCalendarEvent();
                modal.style.display = "none";
                form.reset();
                
                // Remove the old job movement logic
                alert("Interview scheduled successfully!");
            } catch (error) {
                console.error("Error scheduling interview:", error);
                alert("Error scheduling interview. Please try again.");
            }
        };
    }
}

// Add createCalendarEvent function if not already present
async function createCalendarEvent() {
    const form = document.getElementById('scheduleForm');
    const title = document.getElementById('interviewTitle').value;
    const date = document.getElementById('interviewDate').value;
    const time = document.getElementById('interviewTime').value;
    const duration = parseInt(document.getElementById('interviewDuration').value);
    const participants = document.getElementById('participants').value;

    if (!title || !date || !time || !duration) {
        alert('Please fill in all required fields');
        return;
    }

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const event = {
        'summary': title,
        'start': {
            'dateTime': startDateTime.toISOString(),
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        'end': {
            'dateTime': endDateTime.toISOString(),
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
    };

    if (participants) {
        event.attendees = participants.split(',').map(email => ({
            'email': email.trim()
        }));
    }

    try {
        const response = await gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': event,
            'sendUpdates': 'all'
        });

        // Add company name to the event data for the interview card
        const eventData = response.result;
        eventData.companyName = document.querySelector('#scheduleForm').getAttribute('data-company');

        // Create and display the interview card
        createInterviewCard(eventData);

        // Close the modal and reset the form
        modal.style.display = "none";
        form.reset();

        alert('Interview scheduled successfully!');
    } catch (err) {
        console.error('Error creating calendar event:', err);
        alert('Error scheduling interview. Please try again.');
    }
}

// Add these functions at the beginning of your script.js
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Add function to load saved positions
function loadSavedPositions() {
    const savedPositions = getFromLocalStorage('jobPositions');
    if (!savedPositions) return;

    // Clear only the job listing section
    const jobListContainer = document.querySelector("#job-list .job-container");
    if (jobListContainer) {
        jobListContainer.innerHTML = '';
    }

    Object.entries(savedPositions).forEach(([columnIndex, jobs]) => {
        const column = document.querySelectorAll('.column')[columnIndex];
        if (!column || column.id === 'job-list') return; // Skip job-list section
        
        const jobContainer = column.querySelector('.job-container');
        if (!jobContainer) return;

        jobs.forEach(job => {
            const jobItem = createJobItem(job);
            jobContainer.appendChild(jobItem);
        });
    });
}

// Add function to clear all default content
function clearDefaultContent() {
    // Clear all job containers
    document.querySelectorAll('.job-container').forEach(container => {
        container.innerHTML = '';
    });
}

// Function to create and add an interview card
function createInterviewCard(eventData) {
    const container = document.querySelector('.interview-cards-container');
    if (!container) return;

    const card = document.createElement('div');
    card.classList.add('interview-card');
    card.dataset.eventId = eventData.id; // Store event ID for reference
    
    const date = new Date(eventData.start.dateTime);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    card.innerHTML = `
        <h3>${eventData.summary}</h3>
        <p class="company">${eventData.companyName || 'Company'}</p>
        <div class="details">
            <span>📅 ${formattedDate}</span>
            <span>⏰ ${formattedTime}</span>
            ${eventData.location ? `<span>📍 ${eventData.location}</span>` : ''}
            ${eventData.hangoutLink ? `<span>🎥 Virtual Meeting</span>` : ''}
        </div>
        <div class="card-actions">
            ${eventData.htmlLink ? 
                `<a href="${eventData.htmlLink}" target="_blank" class="calendar-link">View in Calendar</a>` : 
                ''
            }
            <button class="done-btn">Mark as Done</button>
        </div>
    `;

    // Add click handler for done button
    const doneBtn = card.querySelector('.done-btn');
    doneBtn.addEventListener('click', () => markInterviewAsDone(eventData, card));

    // Insert the new card at the beginning of the container
    container.insertBefore(card, container.firstChild);
    
    // Save the interview to localStorage
    saveInterview(eventData);
}

// Function to mark an interview as done
function markInterviewAsDone(eventData, card) {
    // Remove from upcoming interviews
    card.remove();
    
    // Create past interview card
    const pastContainer = document.querySelector('.past-interviews');
    if (!pastContainer) return;

    const pastCard = createPastInterviewCard({
        ...eventData,
        status: 'completed',
        completedAt: new Date().toISOString()
    });

    // Add to past interviews section
    pastContainer.insertBefore(pastCard, pastContainer.firstChild);

    // Update localStorage
    moveInterviewToPast(eventData);
}

// Function to move interview from upcoming to past in localStorage
function moveInterviewToPast(eventData) {
    let upcomingInterviews = getFromLocalStorage('upcomingInterviews') || [];
    let pastInterviews = getFromLocalStorage('pastInterviews') || [];

    // Remove from upcoming interviews
    upcomingInterviews = upcomingInterviews.filter(interview => 
        interview.id !== eventData.id
    );

    // Add to past interviews with completed status
    const completedInterview = {
        ...eventData,
        status: 'completed',
        completedAt: new Date().toISOString()
    };
    pastInterviews.unshift(completedInterview);

    // Save both updated lists
    saveToLocalStorage('upcomingInterviews', upcomingInterviews);
    saveToLocalStorage('pastInterviews', pastInterviews);
}

// Function to load saved interviews
function loadSavedInterviews() {
    // Load upcoming interviews
    const savedInterviews = getFromLocalStorage('upcomingInterviews') || [];
    const upcomingContainer = document.querySelector('.interview-cards-container');
    if (upcomingContainer) {
        upcomingContainer.innerHTML = ''; // Clear existing cards
    }
    
    savedInterviews.forEach(interview => {
        createInterviewCard(interview);
    });

    // Load past interviews
    const pastInterviews = getFromLocalStorage('pastInterviews') || [];
    const pastContainer = document.querySelector('.past-interviews');
    if (pastContainer) {
        pastContainer.innerHTML = ''; // Clear existing cards
        
        pastInterviews.forEach(interview => {
            const pastCard = createPastInterviewCard(interview);
            pastContainer.appendChild(pastCard);
        });
    }
}

// Function to save interview to localStorage
function saveInterview(eventData) {
    const savedInterviews = getFromLocalStorage('upcomingInterviews') || [];
    // Check if interview already exists
    const exists = savedInterviews.some(interview => interview.id === eventData.id);
    if (!exists) {
        savedInterviews.unshift(eventData);
        saveToLocalStorage('upcomingInterviews', savedInterviews);
    }
}

// Function to delete past interview
function deletePastInterview(interviewId) {
    let pastInterviews = getFromLocalStorage('pastInterviews') || [];
    
    // Remove the interview from past interviews
    pastInterviews = pastInterviews.filter(interview => interview.id !== interviewId);
    
    // Save the updated list
    saveToLocalStorage('pastInterviews', pastInterviews);
}

// Function to create past interview card
function createPastInterviewCard(interview) {
    const pastCard = document.createElement('div');
    pastCard.classList.add('past-interview-card');
    pastCard.dataset.interviewId = interview.id;
    pastCard.draggable = true; // Make card draggable
    
    const date = new Date(interview.start.dateTime);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    pastCard.innerHTML = `
        <button class="delete-past-btn" aria-label="Delete interview">×</button>
        <span class="status">Completed</span>
        <h4>${interview.summary}</h4>
        <p class="company">${interview.companyName || 'Company'}</p>
        <div class="details">
            <p> ${formattedDate}</p>
        </div>
    `;

    // Add delete functionality
    const deleteBtn = pastCard.querySelector('.delete-past-btn');
    deleteBtn.addEventListener('click', () => {
        // Add fade out animation
        pastCard.style.opacity = '0';
        pastCard.style.transform = 'scale(0.9)';
        pastCard.style.transition = 'all 0.3s ease';
        
        // Remove card and update localStorage after animation
        setTimeout(() => {
            pastCard.remove();
            deletePastInterview(interview.id);
        }, 300);
    });

    // Add drag events
    pastCard.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        pastCard.classList.add("dragging");
    });

    pastCard.addEventListener("dragend", () => {
        pastCard.classList.remove("dragging");
        saveJobPositions();
    });

    return pastCard;
}
