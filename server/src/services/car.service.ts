type ScoreRange = {
    min: number;
    max: number;
};

type Driver = {
    driverId: number;
    points: number;
};

type Car = {
    carId: number;
    score: number;
};

type DriverWithIdealCar = Driver & {
    idealCar: number;
};

/**
 * Pairing cost compared in priority order: distant pairs (fewer is better), close pairs (negated, more is better),
 * close-pair standings positions (negated, higher in the standings is better), total point gap (smaller is better).
 */
type PairingCost = [number, number, number, number];

type DriverUnit = {
    drivers: DriverWithIdealCar[];
    idealCar: number;
};

/**
 * Builds a balanced starting grid by assigning stronger cars to lower-scoring drivers.
 *
 * The algorithm first maps each driver's points onto the inverse car-score range to calculate an ideal car score.
 * It then uses dynamic programming to group drivers into two-driver units. Adjacent drivers in the standings whose
 * point gap is within the configured tolerance always share a car, even when there are enough cars for everyone, so
 * that drivers fighting closely get no car advantage over each other. When more than two consecutive drivers are close,
 * they are paired from the top of the standings down, so the lowest-placed one drives alone. This voluntary pairing is
 * skipped while every driver has the same points (season start). If sharing is required for capacity and there are not
 * enough close pairs, it adds the remaining pairs with the smallest point gaps. A second dynamic-programming
 * pass assigns each unit to a distinct car while minimizing the total distance from drivers' ideal car scores.
 *
 * @param driverPoints Maps each driver ID to their current championship points.
 * @param carsScore Maps each car ID to its performance score.
 * @param balanceFactor Controls the balancing strength from 0.2 to 1, where 1 fully maps the best car to the lowest-scoring driver.
 * @param toleranceFactor Defines a close-pair point gap as a fraction, from 0.01 to 0.5, of the standings' total point range.
 * @returns A map from driver ID to assigned car ID. A car is assigned to no more than two drivers.
 * @throws {Error} When factors are outside their accepted range or there are more than two drivers per available car.
 */
export class CarService {
    private readonly MAX_DRIVERS_PER_CAR = 2;
    private readonly MIN_BALANCE_FACTOR = 0.2;
    private readonly MIN_TOLERANCE_FACTOR = 0.01;
    private readonly MAX_TOLERANCE_FACTOR = 0.5;

    assignCars(
        driverPoints: Map<number, number>,
        carsScore: Map<number, number>,
        balanceFactor: number = 1,
        toleranceFactor: number = 0.05
    ): Map<number, number> {
        this.validateAssignmentRequest(driverPoints, carsScore, balanceFactor, toleranceFactor);

        if (driverPoints.size === 0 || carsScore.size === 0) {
            return new Map();
        }

        const drivers = this.toDrivers(driverPoints);
        const cars = this.toCars(carsScore);

        const driverRange = this.getRange(drivers.map(driver => driver.points));
        const carRange = this.getRange(cars.map(car => car.score));
        const averageCarScore = this.calculateAverageCarScore(cars);

        const driversWithIdealCar = drivers.map(d =>
            this.calculateDriverWithIdealCar(d, driverRange, carRange, averageCarScore, balanceFactor)
        );

        return this.matchDriversToCarsWithGrouping(driversWithIdealCar, cars, toleranceFactor);
    }

    private validateAssignmentRequest(
        driverPoints: Map<number, number>,
        carsScore: Map<number, number>,
        balanceFactor: number,
        toleranceFactor: number
    ): void {
        if (balanceFactor < this.MIN_BALANCE_FACTOR || balanceFactor > 1) {
            throw new Error('Balance factor must be between 0.2 and 1');
        }
        if (toleranceFactor < this.MIN_TOLERANCE_FACTOR || toleranceFactor > this.MAX_TOLERANCE_FACTOR) {
            throw new Error('Tolerance factor must be between 0.01 and 0.5');
        }
        if (driverPoints.size > carsScore.size * this.MAX_DRIVERS_PER_CAR) {
            throw new Error('Not enough cars for the number of drivers');
        }
    }

    private toDrivers(driverPoints: Map<number, number>): Driver[] {
        return [...driverPoints]
            .map(([driverId, points]) => ({ driverId, points }))
            .sort((first, second) => second.points - first.points || first.driverId - second.driverId);
    }

    private toCars(carsScore: Map<number, number>): Car[] {
        return [...carsScore]
            .map(([carId, score]) => ({ carId, score }))
            .sort((first, second) => first.score - second.score || first.carId - second.carId);
    }

    private calculateAverageCarScore(cars: Car[]): number {
        return cars.reduce((sum, car) => sum + car.score, 0) / cars.length;
    }

    private calculateDriverWithIdealCar(
        driver: Driver,
        driverRange: ScoreRange,
        carRange: ScoreRange,
        averageCarScore: number,
        balanceFactor: number
    ) {
        const normalizedPoints = this.normalizePoints(driver.points, driverRange.min, driverRange.max);
        let idealCar = carRange.max - normalizedPoints * (carRange.max - carRange.min);
        idealCar = averageCarScore + (idealCar - averageCarScore) * balanceFactor;

        return { ...driver, idealCar };
    }

    private matchDriversToCarsWithGrouping(
        driversWithIdealCar: DriverWithIdealCar[],
        cars: Car[],
        toleranceFactor: number
    ): Map<number, number> {
        if (driversWithIdealCar.length === 0 || cars.length === 0) {
            return new Map();
        }

        const requiredPairCount = Math.max(0, driversWithIdealCar.length - cars.length);
        const pointRange = this.getRange(driversWithIdealCar.map(driver => driver.points));
        const units = this.createDriverUnits(driversWithIdealCar, requiredPairCount, (pointRange.max - pointRange.min) * toleranceFactor);

        return this.assignUnitsToCars(units, cars);
    }

    private createDriverUnits(
        drivers: DriverWithIdealCar[],
        requiredPairCount: number,
        pointTolerance: number
    ): DriverUnit[] {
        const driversByPoints = [...drivers].sort((first, second) => first.points - second.points || first.driverId - second.driverId);
        const pointRange = driversByPoints[driversByPoints.length - 1].points - driversByPoints[0].points;
        // With every driver on the same points (season start) there is no fight to neutralize: only pair for capacity.
        const maxPairCount = pointRange === 0
            ? requiredPairCount
            : Math.floor(driversByPoints.length / this.MAX_DRIVERS_PER_CAR);
        const pairingCosts = Array.from(
            { length: driversByPoints.length + 1 },
            () => Array<PairingCost | null>(maxPairCount + 1).fill(null)
        );
        const includesPair = Array.from(
            { length: driversByPoints.length + 1 },
            () => Array<boolean>(maxPairCount + 1).fill(false)
        );
        pairingCosts[0][0] = [0, 0, 0, 0];

        for (let driverIndex = 1; driverIndex <= driversByPoints.length; driverIndex++) {
            for (let pairCount = 0; pairCount <= maxPairCount; pairCount++) {
                pairingCosts[driverIndex][pairCount] = pairingCosts[driverIndex - 1][pairCount];

                const previousCost = driverIndex < 2 || pairCount === 0 ? null : pairingCosts[driverIndex - 2][pairCount - 1];
                if (!previousCost) {
                    continue;
                }

                const firstDriver = driversByPoints[driverIndex - 2];
                const secondDriver = driversByPoints[driverIndex - 1];
                const pointGap = secondDriver.points - firstDriver.points;
                const isClosePair = pointGap <= pointTolerance;
                // driverIndex grows with standings position, so rewarding it pairs close drivers from the top down.
                const pairingCost: PairingCost = [
                    previousCost[0] + (isClosePair ? 0 : 1),
                    previousCost[1] - (isClosePair ? 1 : 0),
                    previousCost[2] - (isClosePair ? driverIndex : 0),
                    previousCost[3] + pointGap
                ];

                if (this.isCheaper(pairingCost, pairingCosts[driverIndex][pairCount])) {
                    pairingCosts[driverIndex][pairCount] = pairingCost;
                    includesPair[driverIndex][pairCount] = true;
                }
            }
        }

        // Close pairs always share a car; distant pairs are only formed when capacity requires them.
        let pairCount = requiredPairCount;
        for (let candidatePairCount = requiredPairCount + 1; candidatePairCount <= maxPairCount; candidatePairCount++) {
            if (this.isCheaper(pairingCosts[driversByPoints.length][candidatePairCount], pairingCosts[driversByPoints.length][pairCount])) {
                pairCount = candidatePairCount;
            }
        }

        const units: DriverUnit[] = [];
        let driverIndex = driversByPoints.length;
        while (driverIndex > 0) {
            if (!includesPair[driverIndex][pairCount]) {
                units.push({ drivers: [driversByPoints[driverIndex - 1]], idealCar: driversByPoints[driverIndex - 1].idealCar });
                driverIndex--;
                continue;
            }

            const firstDriver = driversByPoints[driverIndex - 2];
            const secondDriver = driversByPoints[driverIndex - 1];
            units.push({
                drivers: [firstDriver, secondDriver],
                idealCar: (firstDriver.idealCar + secondDriver.idealCar) / this.MAX_DRIVERS_PER_CAR
            });
            driverIndex -= this.MAX_DRIVERS_PER_CAR;
            pairCount--;
        }

        return units.sort((first, second) => first.idealCar - second.idealCar);
    }

    private isCheaper(candidate: PairingCost | null, current: PairingCost | null): boolean {
        if (!candidate) {
            return false;
        }
        if (!current) {
            return true;
        }

        const differingIndex = candidate.findIndex((value, index) => value !== current[index]);
        return differingIndex !== -1 && candidate[differingIndex] < current[differingIndex];
    }

    private assignUnitsToCars(
        units: DriverUnit[],
        cars: Car[]
    ): Map<number, number> {
        const assignmentCosts = Array.from({ length: units.length + 1 }, () => Array<number>(cars.length + 1).fill(Infinity));
        const includesAssignment = Array.from({ length: units.length + 1 }, () => Array<boolean>(cars.length + 1).fill(false));
        assignmentCosts[0].fill(0);

        for (let unitIndex = 1; unitIndex <= units.length; unitIndex++) {
            for (let carIndex = 1; carIndex <= cars.length; carIndex++) {
                assignmentCosts[unitIndex][carIndex] = assignmentCosts[unitIndex][carIndex - 1];
                const assignmentCost = assignmentCosts[unitIndex - 1][carIndex - 1]
                    + units[unitIndex - 1].drivers.reduce(
                        (total, driver) => total + Math.abs(driver.idealCar - cars[carIndex - 1].score),
                        0
                    );

                if (assignmentCost < assignmentCosts[unitIndex][carIndex]) {
                    assignmentCosts[unitIndex][carIndex] = assignmentCost;
                    includesAssignment[unitIndex][carIndex] = true;
                }
            }
        }

        const assignment = new Map<number, number>();
        let unitIndex = units.length;
        let carIndex = cars.length;
        while (unitIndex > 0) {
            if (!includesAssignment[unitIndex][carIndex]) {
                carIndex--;
                continue;
            }

            for (const driver of units[unitIndex - 1].drivers) {
                assignment.set(driver.driverId, cars[carIndex - 1].carId);
            }
            unitIndex--;
            carIndex--;
        }

        return assignment;
    }
    
    private getRange(values: number[]): ScoreRange {
        return { min: Math.min(...values), max: Math.max(...values) };
    }

    private normalizePoints(value: number, min: number, max: number): number {
        if (max === min) {
            return 0.5;
        }

        return (value - min) / (max - min);
    }
  
}