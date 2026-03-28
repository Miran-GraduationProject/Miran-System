/**
 * هذا الكلاس هو  خوارزمية بس يحسب التوزيع 
 */



const runAllocationAlgorithm = (students, preferencesMap, capacityMap) => {

    // نسوي نسخة من السعة عشان نعدل عليها بدون ما نأثر على الاصلية
    const remainingCapacity = {};
    for (const opp of capacityMap) {
        remainingCapacity[opp.opportunityID] = {
            male: opp.maleCapacity,
            female: opp.femaleCapacity
        };
    }

    const allocations = [];

    // نمشي على كل طالب بالترتيب (الأعلى معدل أولاً، وعند التساوي الأسبق تسجيلاً)
    for (const student of students) {

        const preferences = preferencesMap[student.studentID] || [];
        let assigned = false;

        // نحاول نوزع الطالب على أول أولوية متاحة
        for (const pref of preferences) {
            const capacity = remainingCapacity[pref.opportunityID];

            if (!capacity) continue;

            // نشوف السعة حسب جنس الطالب
            const availableSlots = student.gender === 'Male'
                ? capacity.male
                : capacity.female;

            if (availableSlots > 0) {
                // نخصص الطالب لهذي الفرصة
                allocations.push({
                    studentID: student.studentID,
                    opportunityID: pref.opportunityID,
                    status: 'Assigned'
                });

                // ننقص السعة
                if (student.gender === 'Male') {
                    remainingCapacity[pref.opportunityID].male--;
                } else {
                    remainingCapacity[pref.opportunityID].female--;
                }

                assigned = true;
                break;
            }
        }

        // لو ما لقى مقعد في أي أولوية
        if (!assigned) {
            allocations.push({
                studentID: student.studentID,
                opportunityID: null,
                status: 'Unassigned'
            });
        }
    }

    return allocations;
};


export { runAllocationAlgorithm };