
document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const messageDiv = document.getElementById("message");
  const addActivityBtn = document.getElementById("add-activity-btn");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        // Collapsible card
        const cardHeader = document.createElement("div");
        cardHeader.className = "card-header";
        cardHeader.innerHTML = `<h4>${name}</h4>`;
        cardHeader.style.cursor = "pointer";

        const cardContent = document.createElement("div");
        cardContent.className = "card-content";
        cardContent.style.display = "none";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants HTML
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
                <h5>Participants:</h5>
                <ul class="participants-list">
                  ${details.participants
                    .map(
                      (email) =>
                        `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">74c</button></li>`
                    )
                    .join("")}
                </ul>
              </div>`
            : `<p><em>No participants yet</em></p>`;

        // Inline signup form for each activity
        const signupFormHTML = `
          <form class="signup-form" data-activity="${name}">
            <div class="form-group">
              <label for="email-${name}">Student Email:</label>
              <input type="email" id="email-${name}" required placeholder="your-email@mergington.edu" />
            </div>
            <button type="submit">Sign Up</button>
          </form>
        `;

        cardContent.innerHTML = `
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
          ${signupFormHTML}
        `;

        activityCard.appendChild(cardHeader);
        activityCard.appendChild(cardContent);
        activitiesList.appendChild(activityCard);

        // Collapsible logic
        cardHeader.addEventListener("click", () => {
          cardContent.style.display = cardContent.style.display === "none" ? "block" : "none";
        });
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });

      // Add event listeners to signup forms
      document.querySelectorAll(".signup-form").forEach((form) => {
        form.addEventListener("submit", handleSignup);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    event.stopPropagation();
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle signup for each activity
  async function handleSignup(event) {
    event.preventDefault();
    event.stopPropagation();
    const form = event.target;
    const activity = form.getAttribute("data-activity");
    const emailInput = form.querySelector("input[type='email']");
    const email = emailInput.value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        form.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  }

  // Floating Add Activity button (demo only, no backend)
  addActivityBtn.addEventListener("click", () => {
    alert("Add Activity feature coming soon!");
  });

  // Initialize app
  fetchActivities();
});
