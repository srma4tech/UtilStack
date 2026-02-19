function calculateAge(dob, target) {
  let years = target.getFullYear() - dob.getFullYear();
  let months = target.getMonth() - dob.getMonth();
  let days = target.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const nextBirthdayYear =
    target.getMonth() > dob.getMonth() || (target.getMonth() === dob.getMonth() && target.getDate() >= dob.getDate())
      ? target.getFullYear() + 1
      : target.getFullYear();

  const nextBirthday = new Date(nextBirthdayYear, dob.getMonth(), dob.getDate());
  const daysToBirthday = Math.ceil((nextBirthday - target) / 86400000);

  return { years, months, days, daysToBirthday };
}

export async function render(root) {
  const today = new Date().toISOString().split('T')[0];

  root.innerHTML = `
    <div class="grid gap-4">
      <label class="grid gap-2 text-sm">
        <span class="font-medium">Date of Birth</span>
        <input id="age-dob" type="date" max="${today}" />
      </label>
      <label class="grid gap-2 text-sm">
        <span class="font-medium">Calculate As Of</span>
        <input id="age-target" type="date" value="${today}" />
      </label>
      <button id="age-run" class="btn-primary" type="button">Calculate Age</button>
      <div id="age-result" class="stats-grid"></div>
    </div>
  `;

  const dobEl = root.querySelector('#age-dob');
  const targetEl = root.querySelector('#age-target');
  const resultEl = root.querySelector('#age-result');

  root.querySelector('#age-run').addEventListener('click', () => {
    if (!dobEl.value || !targetEl.value) {
      resultEl.innerHTML = '<p class="text-sm text-red-600">Please enter both dates.</p>';
      return;
    }

    const dob = new Date(`${dobEl.value}T00:00:00`);
    const target = new Date(`${targetEl.value}T00:00:00`);

    if (target < dob) {
      resultEl.innerHTML = '<p class="text-sm text-red-600">Target date must be after date of birth.</p>';
      return;
    }

    const age = calculateAge(dob, target);

    resultEl.innerHTML = `
      <div class="stat-box"><p class="text-xs uppercase">Years</p><p class="text-2xl font-semibold">${age.years}</p></div>
      <div class="stat-box"><p class="text-xs uppercase">Months</p><p class="text-2xl font-semibold">${age.months}</p></div>
      <div class="stat-box"><p class="text-xs uppercase">Days</p><p class="text-2xl font-semibold">${age.days}</p></div>
      <div class="stat-box"><p class="text-xs uppercase">Next Birthday</p><p class="text-xl font-semibold">${age.daysToBirthday} days</p></div>
    `;
  });
}
