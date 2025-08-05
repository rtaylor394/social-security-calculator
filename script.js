function calculateBreakEven() {
    // Constants
    const benefit62 = 2483; // Monthly benefit at age 62
    const benefit67 = 3526; // Monthly benefit at age 67
    const inflationRate = 0.025; // 2.5% annual inflation
    const startDate = new Date('2026-02-18'); // Age 62
    const monthsTo67 = 60; // 5 years = 60 months
    const maxMonths = 300; // Up to ~age 87

    // Calculate cumulative PVs
    let cumPV1 = 0, cumPV2 = 0;
    let month = 0;
    let prevDiff = 0, currDiff = 0;

    // Find where Option 2 overtakes Option 1
    const data = [];
    while (month <= maxMonths) {
        // Discount factor: e^(-0.025 * (month/12))
        const discount = Math.exp(-inflationRate * (month / 12));
        
        // Option 1 PV (starts at month 0)
        const pv1 = benefit62 * discount;
        
        // Option 2 PV (starts at month 60)
        const pv2 = month < monthsTo67 ? 0 : benefit67 * discount;
        
        // Cumulative PVs
        cumPV1 += pv1;
        cumPV2 += pv2;
        
        // Date and age
        const date = new Date(startDate);
        date.setMonth(startDate.getMonth() + month);
        const age = 62 + (date - startDate) / (1000 * 60 * 60 * 24 * 365.25);
        
        // Store data for table
        data.push({ month, date, age, pv1, pv2, cumPV1, cumPV2 });
        
        // Check for break-even
        currDiff = cumPV1 - cumPV2;
        if (month > monthsTo67 && currDiff <= 0 && prevDiff > 0) {
            // Break-even between month-1 and month
            const m1 = month - 1;
            const m2 = month;
            const diff1 = prevDiff;
            const diff2 = currDiff;
            
            // Linear interpolation
            const breakEvenMonth = m1 + diff1 / (diff1 - diff2);
            const breakEvenDate = new Date(startDate);
            breakEvenDate.setMonth(startDate.getMonth() + breakEvenMonth);
            const breakEvenAge = 62 + (breakEvenDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
            const breakEvenAmount = data[m1].cumPV1 + (data[m2].cumPV1 - data[m1].cumPV1) * (breakEvenMonth - m1);
            
            // Update results
            document.getElementById('breakEvenAge').textContent = breakEvenAge.toFixed(2) + ' years';
            document.getElementById('breakEvenAmount').textContent = '$' + breakEvenAmount.toFixed(2);
            document.getElementById('breakEvenDate').textContent = breakEvenDate.toLocaleDateString();
            
            // Populate table with 10 rows around break-even
            const tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = '';
            const startMonth = Math.max(0, Math.floor(breakEvenMonth) - 5);
            for (let i = startMonth; i < startMonth + 10 && i < data.length; i++) {
                const row = data[i];
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.month}</td>
                    <td>${row.date.toLocaleDateString()}</td>
                    <td>${row.age.toFixed(2)}</td>
                    <td>$${row.pv1.toFixed(2)}</td>
                    <td>$${row.pv2.toFixed(2)}</td>
                    <td>$${row.cumPV1.toFixed(2)}</td>
                    <td>$${row.cumPV2.toFixed(2)}</td>
                    <td>$${(row.cumPV1 - row.cumPV2).toFixed(2)}</td>
                `;
                tableBody.appendChild(tr);
            }
            break;
        }
        prevDiff = currDiff;
        month++;
    }
}   