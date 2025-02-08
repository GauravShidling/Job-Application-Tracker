// Add this at the beginning of your script.js
let modal = null;
let closeBtn = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
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
                    <a href="${job.redirect_url}" target="_blank" class="apply-btn">Apply Now</a>
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
    jobItem.draggable = true;
    jobItem.dataset.jobId = job.jobId;

    jobItem.innerHTML = `
        <div class="job-header">
            <h4>${job.title}</h4>
            <button class="delete-btn" aria-label="Delete job">×</button>
        </div>
        <div class="job-details">
            <p>${job.company}</p>
            <p>${job.location}</p>
            <div class="job-actions">
                <a href="${job.applyLink}" target="_blank" class="apply-btn">Apply Now</a>
                <button class="schedule-interview" ${window.gapiInited && window.gisInited ? '' : 'disabled'}>Schedule Interview</button>
            </div>
        </div>
    `;

    // Add event listeners
    const deleteBtn = jobItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        jobItem.classList.add('fade-out');
        setTimeout(() => {
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

    // Add drag events
    jobItem.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        jobItem.classList.add("dragging");
    });

    jobItem.addEventListener("dragend", () => {
        jobItem.classList.remove("dragging");
        saveJobPositions();
    });

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
                
                // Move job card to interview section
                const interviewContainer = document.querySelector("#interview .job-container");
                if (interviewContainer && jobItem) {
                    // Add animation class
                    jobItem.classList.add('move-to-interview');
                    
                    // Wait for animation to complete
                    setTimeout(() => {
                        interviewContainer.appendChild(jobItem);
                        jobItem.classList.remove('move-to-interview');
                        saveJobPositions(); // Save the new positions
                    }, 500);
                    
                    alert("Interview scheduled successfully! Job moved to Interview section.");
                } else {
                    alert("Interview scheduled successfully!");
                }
            } catch (error) {
                console.error("Error scheduling interview:", error);
                alert("Error scheduling interview. Please try again.");
            }
        };
    }
}

// Add createCalendarEvent function if not already present
async function createCalendarEvent() {
    const title = document.getElementById('interviewTitle').value;
    const date = document.getElementById('interviewDate').value;
    const time = document.getElementById('interviewTime').value;
    const duration = parseInt(document.getElementById('duration').value);
    const participants = document.getElementById('participants').value
        .split(',')
        .map(email => ({ email: email.trim() }));

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const event = {
        summary: title,
        start: {
            dateTime: startDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
            dateTime: endDateTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: participants,
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 30 }
            ]
        }
    };

    try {
        const request = await gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            sendUpdates: 'all'
        });
        return request.result;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
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

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // Clear any default content first
    clearDefaultContent();
    
    // Then load saved positions from localStorage
    loadSavedPositions();
    
    // Add drag and drop listeners to containers
    document.querySelectorAll('.job-container').forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                container.appendChild(draggable);
            }
        });
    });
});
