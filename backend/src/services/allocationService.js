/**
 * هذا الكلاس هو  خوارزمية بس يحسب التوزيع 
 */



// توزع الطلاب حسب ترتيب الأولوية: المعدل الأعلى أولاً، ثم الأسبق تسجيلاً.
// كل طالب يأخذ أول رغبة متاحة حسب سعة الجنس.
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

    // نمشي على كل طالب بالترتيب (الأعلى معدل أولاً، وعند التساوي الي سجل اول يعني الاسبق تسجيلاً)
    for (const student of students) {

        // نتحقق أن الجندر صحيح قبل نبدأ التوزيع
        if (!['Male', 'Female'].includes(student.gender)) {
            allocations.push({
                studentID: student.studentID,
                opportunityID: null,
                status: 'Unassigned'
            });
            continue;
        }

        const genderKey = student.gender === 'Male' ? 'male' : 'female';
        const preferences = preferencesMap[student.studentID] || [];
        let assigned = false;

        // نحاول نوزع الطالب على أول أولوية متاحة
        for (const pref of preferences) {
            const capacity = remainingCapacity[pref.opportunityID];

            if (!capacity) continue;

            if (capacity[genderKey] > 0) {
                allocations.push({
                    studentID: student.studentID,
                    opportunityID: pref.opportunityID,
                    status: 'Assigned'
                });

                capacity[genderKey]--;
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