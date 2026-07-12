const form = document.getElementById('checkInForm');
const attendeeNameInput = document.getElementById('attendeeName');
const teamSelect = document.getElementById('teamSelect');
const greeting = document.getElementById('greeting');
const attendeeCount = document.getElementById('attendeeCount');
const progressBar = document.getElementById('progressBar');
const attendanceGoal = 50;
const storageKey = 'intelEventAttendance';

const teamCounts = {
  water: 0,
  zero: 0,
  power: 0
};

const teamLabels = {
  water: 'Team Water Wise',
  zero: 'Team Net Zero',
  power: 'Team Renewables'
};

let totalAttendees = 0;
let attendees = [];
let celebrationShown = false;
let attendeeListContainer;
let attendeeList;

function showMessage(message, isSuccess = true) {
  greeting.textContent = message;
  greeting.style.display = 'block';
  greeting.className = isSuccess ? 'success-message' : '';

  if (isSuccess) {
    greeting.style.backgroundColor = '';
    greeting.style.color = '';
    greeting.style.border = '';
  } else {
    greeting.style.backgroundColor = '#fff7ed';
    greeting.style.color = '#9a2c00';
    greeting.style.border = '1px solid #f59e0b';
  }

  greeting.focus();
}

function saveAttendanceData() {
  const dataToSave = {
    totalAttendees,
    teamCounts,
    attendees,
    celebrationShown
  };

  localStorage.setItem(storageKey, JSON.stringify(dataToSave));
}

function loadAttendanceData() {
  try {
    const savedData = JSON.parse(localStorage.getItem(storageKey));

    if (savedData && typeof savedData === 'object') {
      totalAttendees = Number.isInteger(savedData.totalAttendees)
        ? savedData.totalAttendees
        : 0;

      attendees = Array.isArray(savedData.attendees) ? savedData.attendees : [];
      celebrationShown = Boolean(savedData.celebrationShown);

      if (savedData.teamCounts && typeof savedData.teamCounts === 'object') {
        teamCounts.water = Number(savedData.teamCounts.water) || 0;
        teamCounts.zero = Number(savedData.teamCounts.zero) || 0;
        teamCounts.power = Number(savedData.teamCounts.power) || 0;
      }
    }
  } catch (error) {
    console.warn('Unable to load saved attendance data.', error);
  }

  updateDisplay();

  if (totalAttendees >= attendanceGoal) {
    showCelebration('', true);
  }
}

function updateDisplay() {
  attendeeCount.textContent = totalAttendees;
  document.getElementById('waterCount').textContent = teamCounts.water;
  document.getElementById('zeroCount').textContent = teamCounts.zero;
  document.getElementById('powerCount').textContent = teamCounts.power;

  updateProgressBar();
  renderAttendeeList();
}

function updateProgressBar() {
  const percentage = Math.min((totalAttendees / attendanceGoal) * 100, 100);
  const roundedPercentage = Math.round(percentage);

  progressBar.style.width = `${roundedPercentage}%`;
  progressBar.setAttribute('aria-valuenow', roundedPercentage);
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');
  progressBar.setAttribute('aria-valuetext', `${roundedPercentage}% of the attendance goal reached`);
}

function renderAttendeeList() {
  if (!attendeeListContainer) {
    attendeeListContainer = document.createElement('div');
    attendeeListContainer.className = 'attendee-list-container';

    const listHeading = document.createElement('h3');
    listHeading.textContent = 'Recent Check-Ins';
    attendeeListContainer.appendChild(listHeading);

    attendeeList = document.createElement('ul');
    attendeeList.className = 'attendee-list';
    attendeeListContainer.appendChild(attendeeList);

    document.querySelector('.team-stats').insertAdjacentElement('afterend', attendeeListContainer);
  }

  attendeeList.textContent = '';

  if (attendees.length === 0) {
    const emptyState = document.createElement('li');
    emptyState.textContent = 'No attendees checked in yet.';
    attendeeList.appendChild(emptyState);
    return;
  }

  const recentAttendees = [...attendees].reverse();

  recentAttendees.forEach((attendee) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${attendee.name} — ${attendee.team}`;
    attendeeList.appendChild(listItem);
  });
}

function getWinningTeams() {
  const counts = [
    { name: 'Team Water Wise', count: teamCounts.water },
    { name: 'Team Net Zero', count: teamCounts.zero },
    { name: 'Team Renewables', count: teamCounts.power }
  ];

  const highestCount = Math.max(...counts.map((team) => team.count));

  return counts
    .filter((team) => team.count === highestCount)
    .map((team) => team.name);
}

function showCelebration(customMessage = '', force = false) {
  if (celebrationShown && !force && !customMessage) {
    return;
  }

  celebrationShown = true;

  if (customMessage) {
    showMessage(customMessage, true);
    return;
  }

  const winningTeams = getWinningTeams();

  if (winningTeams.length === 1) {
    showMessage(
      `Attendance goal reached! Congratulations to ${winningTeams[0]} for having the highest attendance!`,
      true
    );
  } else {
    showMessage(
      `Attendance goal reached! ${winningTeams.join(' and ')} are tied for the highest attendance!`,
      true
    );
  }
}

function handleCheckIn(event) {
  event.preventDefault();

  const attendeeName = attendeeNameInput.value.trim();
  const selectedTeam = teamSelect.value;

  if (!attendeeName) {
    showMessage('Please enter your name before checking in.', false);
    return;
  }

  if (!selectedTeam) {
    showMessage('Please select a team before checking in.', false);
    return;
  }

  const previousTotal = totalAttendees;

  totalAttendees += 1;
  teamCounts[selectedTeam] += 1;
  attendees.push({
    name: attendeeName,
    team: teamLabels[selectedTeam]
  });

  attendeeNameInput.value = '';
  teamSelect.selectedIndex = 0;

  saveAttendanceData();
  updateDisplay();

  const welcomeMessage = `Welcome, ${attendeeName}! You are checked in with ${teamLabels[selectedTeam]}.`;

  if (totalAttendees >= attendanceGoal && previousTotal < attendanceGoal) {
    showCelebration(`${welcomeMessage} Attendance goal reached!`);
  } else {
    showMessage(welcomeMessage, true);
  }
}

form.addEventListener('submit', handleCheckIn);
document.addEventListener('DOMContentLoaded', loadAttendanceData);