import { runAllocationAlgorithm } from "../../../src/services/allocationService.js";

describe("Unit Test — Req 3: runAllocationAlgorithm", () => {

    test("assigns student to first available preference", () => {
        const students = [{ studentID: 1, gender: "Female" }];
        const preferencesMap = { 1: [{ opportunityID: 10 }] };
        const capacityMap = [{ opportunityID: 10, maleCapacity: 0, femaleCapacity: 5 }];

        const result = runAllocationAlgorithm(students, preferencesMap, capacityMap);
        expect(result[0].status).toBe("Assigned");
        expect(result[0].opportunityID).toBe(10);
    });

    test("first preference full → assigned to second", () => {
        const students = [{ studentID: 1, gender: "Male" }];
        const preferencesMap = { 1: [{ opportunityID: 10 }, { opportunityID: 11 }] };
        const capacityMap = [
            { opportunityID: 10, maleCapacity: 0, femaleCapacity: 5 },
            { opportunityID: 11, maleCapacity: 3, femaleCapacity: 3 }
        ];

        const result = runAllocationAlgorithm(students, preferencesMap, capacityMap);
        expect(result[0].status).toBe("Assigned");
        expect(result[0].opportunityID).toBe(11);
    });

    test("no preferences → Unassigned", () => {
        const students = [{ studentID: 1, gender: "Male" }];
        const preferencesMap = {};
        const capacityMap = [{ opportunityID: 10, maleCapacity: 5, femaleCapacity: 5 }];

        const result = runAllocationAlgorithm(students, preferencesMap, capacityMap);
        expect(result[0].status).toBe("Unassigned");
        expect(result[0].opportunityID).toBeNull();
    });

    test("invalid gender → Unassigned", () => {
        const students = [{ studentID: 1, gender: "Unknown" }];
        const preferencesMap = { 1: [{ opportunityID: 10 }] };
        const capacityMap = [{ opportunityID: 10, maleCapacity: 5, femaleCapacity: 5 }];

        const result = runAllocationAlgorithm(students, preferencesMap, capacityMap);
        expect(result[0].status).toBe("Unassigned");
        expect(result[0].opportunityID).toBeNull();
    });

    test("all capacities full → Unassigned", () => {
        const students = [{ studentID: 1, gender: "Female" }];
        const preferencesMap = { 1: [{ opportunityID: 10 }, { opportunityID: 11 }] };
        const capacityMap = [
            { opportunityID: 10, maleCapacity: 5, femaleCapacity: 0 },
            { opportunityID: 11, maleCapacity: 5, femaleCapacity: 0 }
        ];

        const result = runAllocationAlgorithm(students, preferencesMap, capacityMap);
        expect(result[0].status).toBe("Unassigned");
        expect(result[0].opportunityID).toBeNull();
    });

    test("capacity reduces after assignment — second student Unassigned when only 1 seat", () => {
        const students = [
            { studentID: 1, gender: "Male" },
            { studentID: 2, gender: "Male" }
        ];
        const preferencesMap = {
            1: [{ opportunityID: 10 }],
            2: [{ opportunityID: 10 }]
        };
        const capacityMap = [{ opportunityID: 10, maleCapacity: 1, femaleCapacity: 5 }];

        const result = runAllocationAlgorithm(students, preferencesMap, capacityMap);
        expect(result[0].status).toBe("Assigned");
        expect(result[1].status).toBe("Unassigned");
    });

    test("male capacity full, female still available — female student Assigned", () => {
        const students = [{ studentID: 1, gender: "Female" }];
        const preferencesMap = { 1: [{ opportunityID: 10 }] };
        const capacityMap = [{ opportunityID: 10, maleCapacity: 0, femaleCapacity: 3 }];

        const result = runAllocationAlgorithm(students, preferencesMap, capacityMap);
        expect(result[0].status).toBe("Assigned");
        expect(result[0].opportunityID).toBe(10);
    });

});
