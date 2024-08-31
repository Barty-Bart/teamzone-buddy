document.addEventListener('DOMContentLoaded', function () {
  // Get references to HTML elements
  const timeContainer = document.getElementById('time-container'); // Container for displaying time zones and members
  const addMemberBtn = document.getElementById('add-member-btn'); // Button to open the "Add Member" page
  const addMemberPage = document.getElementById('add-member-page'); // Container for the "Add Member" page
  const addBtn = document.getElementById('add-btn'); // Button to confirm adding a new member
  const timezoneSelect = document.getElementById('timezone-select'); // Dropdown for selecting a timezone
  const nameInput = document.getElementById('name'); // Input field for entering the member's name
  const localTimeInput = document.getElementById('local-time'); // Input field for entering the local time to convert
  const convertBtn = document.getElementById('convert-btn'); // Button to trigger time conversion
  const conversionResults = document.getElementById('conversion-results'); // Container for displaying conversion results
  const tabLinks = document.querySelectorAll('.tab-link'); // All tab links for switching between tabs

  // Initialize state variables
  let addedZones = JSON.parse(localStorage.getItem('addedZones')) || []; // Retrieve saved zones from localStorage or initialize as empty array
  let editingIndex = null; // To track which zone is being edited (null when not editing)
  let isAddMemberPageVisible = false; // Track whether the "Add Member" page is currently visible

  // Get a comprehensive list of all supported time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Function to populate the timezone dropdown with all available time zones
  function populateTimezoneSelect() {
      timeZones.forEach(zone => {
          const option = document.createElement('option'); // Create a new option element
          option.value = zone; // Set the value to the timezone name
          option.textContent = zone; // Set the display text to the timezone name
          timezoneSelect.appendChild(option); // Add the option to the dropdown
      });
  }

  // Define the editTimeZone function at the top level
  function editTimeZone(index) {
      console.log('Edit button clicked for index:', index); // Debugging output
      const zoneToEdit = addedZones[index];
      console.log('Zone to edit:', zoneToEdit); // Show the data being edited
      nameInput.value = zoneToEdit.name;
      timezoneSelect.value = zoneToEdit.tz;
      editingIndex = index;
      addBtn.textContent = "Update"; // Change the button text to "Update"
      showAddMemberPage(); // Ensure this shows the "Add Member" page
  }

  // Then define updateTime, which calls editTimeZone when needed
  function updateTime() {
      const timeContainer = document.getElementById('time-container-tab1'); // Update to specific container
      timeContainer.innerHTML = ''; // Clear the container before repopulating

      addedZones.forEach((zone, index) => {
          const timeElement = document.createElement('div'); // Create a new div to hold the member's time info
          timeElement.className = 'time-zone'; // Assign a class for styling

          // Get the current time and day in the member's timezone
          const now = new Date().toLocaleTimeString('en-US', { timeZone: zone.tz, hour: '2-digit', minute: '2-digit' });
          const day = new Date().toLocaleDateString('en-US', { timeZone: zone.tz, weekday: 'long' });

          // Populate the div with the member's name, current day, and time and edit and delete icons
          timeElement.innerHTML = `
          <div class="time-details">
              <span class="member-name">${zone.name}</span>
              <span class="day-time">${day}, ${now}</span>
              <span class="timezone-info">${zone.tz}</span>
          </div>
          <div class="button-container">
              <button class="edit-btn" data-index="${index}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                      <path fill="none" stroke="currentColor" stroke-width="2" d="M15.5,6.20710678 L4,17.7071068 L4,20 L6.29289322,20 L17.7928932,8.5 L15.5,6.20710678 Z M16.2071068,5.5 L18.5,7.79289322 L19.7928932,6.5 L17.5,4.20710678 L16.2071068,5.5 L16.2071068,5.5 Z M3,20.5 L3,17.5 C3,17.3673918 3.05267842,17.2402148 3.14644661,17.1464466 L17.1464466,3.14644661 C17.3417088,2.95118446 17.6582912,2.95118446 17.8535534,3.14644661 L20.8535534,6.14644661 C21.0488155,6.34170876 21.0488155,6.65829124 20.8535534,6.85355339 L6.85355339,20.8535534 C6.7597852,20.9473216 6.63260824,21 6.5,21 L3.5,21 C3.22385763,21 3,20.7761424 3,20.5 Z"/>
                  </svg>
              </button>
              <button class="delete-btn" data-index="${index}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1920" width="24" height="24">
                      <path fill="currentColor" d="M797.32 985.882 344.772 1438.43l188.561 188.562 452.549-452.549 452.548 452.549 188.562-188.562-452.549-452.548 452.549-452.549-188.562-188.561L985.882 797.32 533.333 344.772 344.772 533.333z"/>
                  </svg>
              </button>
          </div>
        `;

          timeContainer.appendChild(timeElement); // Add the time element to the container
      });

      // Add event listeners for delete and edit buttons after they are added to the DOM
      const deleteButtons = document.querySelectorAll('.delete-btn'); // Get all delete buttons
      const editButtons = document.querySelectorAll('.edit-btn'); // Get all edit buttons

      // Add click event to each delete button to remove the corresponding member
      deleteButtons.forEach(button => {
          button.addEventListener('click', function() {
              const index = this.getAttribute('data-index'); // Get the index of the item to delete
              removeTimeZone(index); // Call the remove function with the index
          });
      });

      // Add click event to each edit button to edit the corresponding member
      editButtons.forEach(button => {
          button.addEventListener('click', function() {
              const index = this.getAttribute('data-index'); // Get the index of the item to edit
              editTimeZone(index); // Call the edit function with the index
          });
      });
  }

  // Function to add a new timezone or update an existing one
  function addTimeZone() {
      const name = nameInput.value; // Get the name entered by the user
      const tz = timezoneSelect.value; // Get the selected timezone
      if (name && tz) { // Ensure both name and timezone are provided
          if (editingIndex !== null) {
              // If editing, update the existing entry
              addedZones[editingIndex] = { name, tz };
              editingIndex = null; // Reset editing index
              addBtn.textContent = "Add"; // Reset button text to "Add" after updating
          } else {
              // Otherwise, add a new entry
              addedZones.push({ name, tz });
          }
          localStorage.setItem('addedZones', JSON.stringify(addedZones)); // Save updated zones to localStorage
          updateTime(); // Refresh the displayed list
          resetForm(); // Clear the form for new entries
      }
  }

  // Function to reset the "Add Member" form to its default state
  function resetForm() {
      nameInput.value = ''; // Clear the name input field
      timezoneSelect.value = ''; // Reset the timezone dropdown
      addBtn.textContent = "Add"; // Ensure the button text is reset to "Add"
      showMainContent(); // Show the main content after adding/editing
  }

  // Function to remove a timezone from the list based on the index
  function removeTimeZone(index) {
      addedZones.splice(index, 1); // Remove the entry at the specified index
      localStorage.setItem('addedZones', JSON.stringify(addedZones)); // Save updated list to localStorage
      updateTime(); // Refresh the displayed list
  }

  function convertTime() {
      const localTime = localTimeInput.value; // Get the local time entered by the user
      if (localTime) { // Ensure a local time has been entered
          const baseTime = new Date(localTime); // Create a Date object from the local time
          const selectedDate = baseTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); // Format the selected date
          const selectedDay = baseTime.toLocaleDateString('en-US', { weekday: 'long' }); // Get the selected day of the week
          const selectedTime = baseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); // Get the selected time
          
          // Display the selected date, day, and time at the top of the conversion results
          conversionResults.innerHTML = `
              <div class="conversion-info">
                  Converting ${selectedDay}, ${selectedTime} (${selectedDate}):
              </div>
          `; // Clear previous results and display conversion info

          // Convert the selected time to each of the added timezones
          addedZones.forEach((zone) => {
              // Convert the local time to the selected timezone
              const convertedTime = new Date(baseTime.toLocaleString('en-US', { timeZone: zone.tz })).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              const convertedDay = new Date(baseTime.toLocaleString('en-US', { timeZone: zone.tz })).toLocaleDateString('en-US', { weekday: 'long' });
              const convertedDate = new Date(baseTime.toLocaleString('en-US', { timeZone: zone.tz })).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

              // Create a new element to display the conversion result
              const resultElement = document.createElement('div');
              resultElement.className = 'converted-item';
              resultElement.innerHTML = `
                  <div class="time-details">
                      <span class="member-name">${zone.name}</span>
                      <span class="day-time">${convertedDay}, ${convertedTime}</span>
                      <span class="converted-date">${convertedDate}</span>
                  </div>
              `;
              conversionResults.appendChild(resultElement); // Add the result to the container
          });

          // Ensure the conversion-results div is displayed
          conversionResults.style.display = 'block';
      }
  }

  // Tab switching logic to show the correct content when a tab is clicked
  tabLinks.forEach(link => {
      link.addEventListener('click', function() {
          document.querySelector('.tab-content.active').classList.remove('active'); // Hide currently active tab
          document.querySelector('.tab-link.active').classList.remove('active'); // Deactivate currently active tab link
          const targetTab = this.getAttribute('data-tab'); // Get the target tab from the clicked link
          document.getElementById(targetTab).classList.add('active'); // Show the target tab
          this.classList.add('active'); // Activate the clicked tab link
      });
  });

  // Toggle the "Add Member" page when the "+" button is clicked
  addMemberBtn.addEventListener('click', function() {
      addBtn.textContent = "Add"; // Ensure the button text is always set to "Add" when "+" is clicked
      if (isAddMemberPageVisible) {
          showMainContent(); // If the "Add Member" page is visible, switch back to main content
      } else {
          showAddMemberPage(); // Otherwise, show the "Add Member" page
      }
      isAddMemberPageVisible = !isAddMemberPageVisible; // Toggle the visibility state
  });

  // Function to show the "Add Member" page by hiding the main content and footer
  function showAddMemberPage() {
      document.getElementById('content-wrapper').style.display = 'none'; // Hide the main content
      addMemberPage.style.display = 'flex'; // Show the "Add Member" page
      document.getElementById('tab-bar').style.display = 'none'; // Hide the footer
  }

  // Function to hide the "Add Member" page and return to the main content and footer
  function showMainContent() {
      addMemberPage.style.display = 'none'; // Hide the "Add Member" page
      document.getElementById('content-wrapper').style.display = 'block'; // Show the main content
      document.getElementById('tab-bar').style.display = 'flex'; // Show the footer
  }

  // Populate the timezone dropdown when the page loads
  populateTimezoneSelect();

  // Update the displayed time zones and members
  updateTime();

  // Set an interval to update the time zones every second to keep accurate
  setInterval(updateTime, 1000); // Update every second

  // Event listener to add a new timezone when the "Add" button is clicked
  addBtn.addEventListener('click', addTimeZone);

  // Event listener to convert the time when the "Convert" button is clicked
  convertBtn.addEventListener('click', convertTime);
});
