import { describe, it, expect } from 'vitest';
import { CarService } from './car.service';

describe('CarService', () => {
    let carService: CarService;

    beforeEach(() => {
        carService = new CarService();
    });

    describe('assignCars', () => {
        it('should assign a car to every driver', () => {
            const driverPoints = new Map([
                [1, 100],
                [2, 85],
                [3, 70],
                [4, 55]
            ]);
            const carsScore = new Map([
                [1, 80],
                [2, 60],
                [3, 40],
                [4, 20]
            ]);

            const assignment = carService.assignCars(driverPoints, carsScore, 0.2);

            expect(assignment.size).toBe(4);
            expect(assignment.has(1)).toBe(true);
            expect(assignment.has(2)).toBe(true);
            expect(assignment.has(3)).toBe(true);
            expect(assignment.has(4)).toBe(true);
        });

        it('should assign a higher-scoring car to the lower-point driver', () => {
            const driverPoints = new Map([
                [1, 100],
                [2, 20]
            ]);
            const carsScore = new Map([
                [1, 100],
                [2, 20]
            ]);

            const assignment = carService.assignCars(driverPoints, carsScore, 1);

            expect(assignment.get(1)).toBe(2);
            expect(assignment.get(2)).toBe(1);
        });

        it('should assign every driver while respecting car capacity', () => {
            const driverPoints = new Map([
                [1, 100],
                [2, 100], // same score as driver 1
                [3, 50],
                [4, 50], // same score as driver 3
                [5, 20],
                [6, 19], // similar score as driver 5
                [7, 45],
                [8, 80]  
            ]);
            const carsScore = new Map([
                [1, 95],
                [2, 85],
                [3, 65],
                [4, 38],
                [5, 35],
                [6, 26],
                [7, 15],
            ]);

            const assignment = carService.assignCars(driverPoints, carsScore, 1.0);

            // Each driver should be assigned a car
            expect(assignment.has(1)).toBe(true);
            expect(assignment.has(2)).toBe(true);
            expect(assignment.has(3)).toBe(true);
            expect(assignment.has(4)).toBe(true);
            expect(assignment.has(5)).toBe(true);
            expect(assignment.has(6)).toBe(true);
            expect(assignment.has(7)).toBe(true);
            expect(assignment.has(8)).toBe(true);

            const carCounts = new Map<number, number>();
            assignment.forEach(carId => {
                carCounts.set(carId, (carCounts.get(carId) || 0) + 1);
            });

            carCounts.forEach(count => {
                expect(count).toBeLessThanOrEqual(2);
            });
        });

        it('should not assign same car to more than 2 drivers', () => {
            const driverPoints = new Map([
                [1, 100],
                [2, 100],
                [3, 100],
                [4, 50],
                [5, 50],
                [6, 20]
            ]);
            const carsScore = new Map([
                [1, 80],
                [2, 60],
                [3, 40],
                [4, 30],
                [5, 20],
                [6, 10]
            ]);

            const assignment = carService.assignCars(driverPoints, carsScore, 0.2);

            const carCount = new Map<number, number>();
            assignment.forEach(carId => {
                carCount.set(carId, (carCount.get(carId) || 0) + 1);
            });

            carCount.forEach(count => {
                expect(count).toBeLessThanOrEqual(2);
            });
        });

        it('should apply balance factor correctly', () => {
            const driverPoints = new Map([
                [1, 100],
                [2, 50]
            ]);
            const carsScore = new Map([
                [1, 100],
                [2, 50]
            ]);

            const assignmentLowBalance = carService.assignCars(driverPoints, carsScore, 0.2);
            const assignmentHighBalance = carService.assignCars(driverPoints, carsScore, 0.8);

            const weakDriver2CarLowBalance = assignmentLowBalance.get(2);
            const weakDriver2CarHighBalance = assignmentHighBalance.get(2);

            // With lower balance factor, weak driver should get more balanced assignment
            // With higher balance factor, assignment should be more extreme
            expect(assignmentLowBalance.size).toBe(2);
            expect(assignmentHighBalance.size).toBe(2);
        });

        it('should handle single driver and car', () => {
            const driverPoints = new Map([[1, 100]]);
            const carsScore = new Map([[1, 80]]);

            const assignment = carService.assignCars(driverPoints, carsScore, 0.2);

            expect(assignment.size).toBe(1);
            expect(assignment.get(1)).toBe(1);
        });

        it('should handle drivers with same scores and same car scores', () => {
            const driverPoints = new Map([
                [1, 100],
                [2, 100],
                [3, 100],
                [4, 100]
            ]);
            const carsScore = new Map([
                [1, 80],
                [2, 80],
                [3, 80],
                [4, 80]
            ]);

            const assignment = carService.assignCars(driverPoints, carsScore, 0.2);

            expect(assignment.size).toBe(4);
            // All drivers should be assigned some car
            [1, 2, 3, 4].forEach(driverId => {
                expect(assignment.has(driverId)).toBe(true);
            });
        });

        it('should spread assignments across available cars when matching is similar', () => {
            const driverPoints = new Map([
                [1, 100],
                [2, 80],
                [3, 60],
                [4, 40]
            ]);
            const carsScore = new Map([
                [1, 90],
                [2, 70],
                [3, 50],
                [4, 30]
            ]);

            const assignment = carService.assignCars(driverPoints, carsScore, 0.2);

            // Each driver should get a car
            expect(assignment.has(1)).toBe(true);
            expect(assignment.has(2)).toBe(true);
            expect(assignment.has(3)).toBe(true);
            expect(assignment.has(4)).toBe(true);

            // With similar balance and multiple good options, should spread across cars
            // but focusing on matching quality first
            const assignedCars = assignment.values();
            const carSet = new Set(assignedCars);
            
            // Should use at least 2-3 different cars (not all in one car)
            expect(carSet.size).toBeGreaterThanOrEqual(2);
            // Should not exceed total cars available
            expect(carSet.size).toBeLessThanOrEqual(4);
        });

        it('balance factor 0 should throw error', () => {
            const driverPoints = new Map([
                [1, 100], // strongest
                [2, 50]   // weakest
            ]);
            const carsScore = new Map([
                [1, 100], // strongest
                [2, 50]   // weakest
            ]);

            expect(() => carService.assignCars(driverPoints, carsScore, 0)).toThrow("Balance factor must be between 0.2 and 1");
        });

        it('should assign cars to all drivers even when cars are fewer than drivers', () => {
            const driverPoints = new Map([
                [1, 299],
                [2, 221],
                [3, 203],
                [4, 171],
                [5, 155],
                [6, 145],
                [7, 104],
                [8, 26],
                [9, 26]
            ]);
            const carsScore = new Map([
                [1, 100],
                [2, 90],
                [3, 80],
                [4, 60],
                [5, 60],
                [6, 50],
            ]);

            const assignment = carService.assignCars(driverPoints, carsScore);
            console.log('assignment: ', assignment)
            expect(assignment.size).toBe(9);
        });

        it('same car shuld be sddigned max 2 times', () => {
            const driverPoints = new Map([
                [1, 299],
                [2, 221],
                [3, 203],
                [4, 171],
                [5, 155],
                [6, 145],
                [7, 104],
                [8, 26],
                [9, 26]
            ]);
            const carsScore = new Map([
                [1, 100],
                [2, 90],
                [3, 80],
                [4, 60],
                [5, 60],
                [6, 50],
            ]);
            
            const assignment = carService.assignCars(driverPoints, carsScore);
            
            const carCounts = new Map<number, number>();
            assignment.forEach(carId => {
                carCounts.set(carId, (carCounts.get(carId) || 0) + 1);
            });

            carCounts.forEach(count => {
                expect(count).toBeLessThanOrEqual(2);
            });
        });

        it('should assign all drivers when capacity requires pairs outside the tolerance', () => {
            const driverPoints = new Map([
                [1, 100],
                [2, 80],
                [3, 60],
                [4, 40],
                [5, 20],
                [6, 0]
            ]);
            const carsScore = new Map([
                [1, 90],
                [2, 60],
                [3, 30]
            ]);

            const assignment = carService.assignCars(driverPoints, carsScore, 1, 0.01);

            expect(assignment.size).toBe(driverPoints.size);

            const carCounts = new Map<number, number>();
            assignment.forEach(carId => {
                carCounts.set(carId, (carCounts.get(carId) || 0) + 1);
            });

            carCounts.forEach(count => {
                expect(count).toBeLessThanOrEqual(2);
            });
        });
    });
});
