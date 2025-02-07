// // // 🔹 Your Adzuna API Credentials
// // const BASE_URL = "https://api.adzuna.com/v1/api/jobs/us/search/1";
// // const API_ID = "a4e7f047";  // Your App ID
// // const API_KEY = "9df4de4c116203076d297303ca64dd6a";  // Your API Key

// // // 🔹 Fetch Jobs from Adzuna API
// // async function fetchJobs() {
// //     const jobTitle = document.getElementById("jobSearch").value;
// //     if (!jobTitle) {
// //         alert("Please enter a job title!");
// //         return;
// //     }

// //     // 🔹 API request with both `app_id` & `app_key`
// //     const url = `${BASE_URL}?app_id=${API_ID}&app_key=${API_KEY}&what=${jobTitle}&where=Remote`;

// //     try {
// //         const response = await fetch(url);
// //         const data = await response.json();

// //         if (data.results && data.results.length > 0) {
// //             displayJobs(data.results);
// //         } else {
// //             alert("No jobs found. Try another search.");
// //         }
// //     } catch (error) {
// //         console.error("Error fetching jobs:", error);
// //     }
// // }

// // // 🔹 Display Jobs in the Job Listings Column
// // function displayJobs(jobs) {
// //     const jobListContainer = document.querySelector("#job-list .job-container");
// //     jobListContainer.innerHTML = ""; // Clear previous results

// //     jobs.slice(0, 5).forEach(job => {  // Show top 5 jobs
// //         const jobItem = document.createElement("div");
// //         jobItem.classList.add("job-item");
// //         jobItem.draggable = true;
// //         jobItem.innerHTML = `
// //             <h4>${job.title}</h4>
// //             <p><strong>Company:</strong> ${job.company.display_name}</p>
// //             <p><strong>Location:</strong> ${job.location.display_name}</p>
// //             <a href="${job.redirect_url}" target="_blank">Apply Now</a>
// //         `;

// //         // Drag Start Event
// //         jobItem.addEventListener("dragstart", () => {
// //             jobItem.classList.add("dragging");
// //         });

// //         // Drag End Event
// //         jobItem.addEventListener("dragend", () => {
// //             jobItem.classList.remove("dragging");
// //         });

// //         jobListContainer.appendChild(jobItem);
// //     });
// // }









// document.addEventListener("DOMContentLoaded", function () {
//     const jobContainers = document.querySelectorAll(".job-container");

//     // Allow dropping into containers
//     jobContainers.forEach(container => {
//         container.addEventListener("dragover", (e) => {
//             e.preventDefault();  // Required to allow dropping
//             const dragging = document.querySelector(".dragging");
//             if (dragging) {
//                 container.appendChild(dragging);
//             }
//         });

//         container.addEventListener("drop", (e) => {
//             e.preventDefault();
//             const dragging = document.querySelector(".dragging");
//             if (dragging) {
//                 container.appendChild(dragging);
//                 dragging.classList.remove("dragging");
//             }
//         });
//     });
// });

// // 🔹 Adzuna API Credentials
// const BASE_URL = "https://api.adzuna.com/v1/api/jobs/us/search/1";
// const API_ID = "a4e7f047";  // Your Adzuna App ID
// const API_KEY = "9df4de4c116203076d297303ca64dd6a";  // Your Adzuna API Key

// // 🔹 Fetch Jobs from Adzuna API
// async function fetchJobs() {
//     const jobTitle = document.getElementById("jobSearch").value.trim();
//     if (!jobTitle) {
//         alert("Please enter a job title!");
//         return;
//     }

//     const url = `${BASE_URL}?app_id=${API_ID}&app_key=${API_KEY}&what=${jobTitle}&where=Remote`;

//     try {
//         const response = await fetch(url);
//         const data = await response.json();

//         if (data.results && data.results.length > 0) {
//             displayJobs(data.results);
//         } else {
//             alert("No jobs found. Try another search.");
//         }
//     } catch (error) {
//         console.error("Error fetching jobs:", error);
//     }
// }

// // 🔹 Display Jobs in the Job Listings Column
// function displayJobs(jobs) {
//     const jobListContainer = document.querySelector("#job-list .job-container");
//     jobListContainer.innerHTML = ""; // Clear previous results

//     jobs.slice(0, 5).forEach(job => {  // Show top 5 jobs
//         const jobItem = document.createElement("div");
//         jobItem.classList.add("job-item");
//         jobItem.draggable = true;
//         jobItem.innerHTML = `
//             <h4>${job.title}</h4>
//             <p><strong>Company:</strong> ${job.company.display_name}</p>
//             <p><strong>Location:</strong> ${job.location.display_name}</p>
//             <a href="${job.redirect_url}" target="_blank">Apply Now</a>
//         `;

//         // Add drag events to job items
//         jobItem.addEventListener("dragstart", () => {
//             jobItem.classList.add("dragging");
//         });

//         jobItem.addEventListener("dragend", () => {
//             jobItem.classList.remove("dragging");
//         });

//         jobListContainer.appendChild(jobItem);
//     });
// }
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
    const jobListContainer = document.querySelector("#job-list .job-container");
    jobListContainer.innerHTML = ""; // Clear previous results

    jobs.slice(0, 5).forEach(job => {  // Show top 5 jobs
        const jobItem = document.createElement("div");
        jobItem.classList.add("job-item");
        jobItem.draggable = true;
        jobItem.dataset.jobId = job.id;
        jobItem.innerHTML = `
            <div class="job-header">
                <h4>${job.title}</h4>
                <button class="delete-btn" aria-label="Delete job">×</button>
            </div>
            <p><strong>Company:</strong> ${job.company.display_name}</p>
            <p><strong>Location:</strong> ${job.location.display_name}</p>
            <a href="${job.redirect_url}" target="_blank">Apply Now</a>
        `;

        // Add delete functionality
        const deleteBtn = jobItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            jobItem.classList.add('fade-out');
            setTimeout(() => {
                jobItem.remove();
                saveJobPositions();
            }, 300); // Match this with CSS transition duration
        });

        // Enhanced drag events
        jobItem.addEventListener("dragstart", (e) => {
            e.dataTransfer.effectAllowed = "move";
            jobItem.classList.add("dragging");
            
            // Add a custom ghost image
            const ghost = jobItem.cloneNode(true);
            ghost.style.opacity = "0.5";
            ghost.style.position = "absolute";
            ghost.style.top = "-1000px";
            document.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, 0, 0);
            
            // Clean up ghost element after drag
            setTimeout(() => {
                document.body.removeChild(ghost);
            }, 0);
        });

        jobItem.addEventListener("dragend", () => {
            jobItem.classList.remove("dragging");
        });

        jobListContainer.appendChild(jobItem);
    });

    saveJobPositions();
}

// 🔹 Save Job Positions in LocalStorage
function saveJobPositions() {
    const jobColumns = document.querySelectorAll(".column");

    const jobData = {};
    jobColumns.forEach(column => {
        const jobItems = Array.from(column.querySelectorAll(".job-item"));
        jobData[column.id] = jobItems.map(item => ({
            title: item.querySelector("h4").textContent,
            company: item.querySelector("p strong").textContent,
            location: item.querySelector("p:nth-child(3)").textContent,
            link: item.querySelector("a").href
        }));
    });

    localStorage.setItem("jobTrackerData", JSON.stringify(jobData));
}

// 🔹 Load Job Positions from LocalStorage on Page Load
function loadJobPositions() {
    const jobData = JSON.parse(localStorage.getItem("jobTrackerData"));
    if (!jobData) return;

    Object.keys(jobData).forEach(columnId => {
        const column = document.getElementById(columnId);
        if (column) {
            jobData[columnId].forEach(job => {
                const jobItem = document.createElement("div");
                jobItem.classList.add("job-item");
                jobItem.draggable = true;
                jobItem.innerHTML = `
                    <h4>${job.title}</h4>
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <a href="${job.link}" target="_blank">Apply Now</a>
                `;

                jobItem.addEventListener("dragstart", () => {
                    jobItem.classList.add("dragging");
                });

                jobItem.addEventListener("dragend", () => {
                    jobItem.classList.remove("dragging");
                });

                column.querySelector(".job-container").appendChild(jobItem);
            });
        }
    });
}